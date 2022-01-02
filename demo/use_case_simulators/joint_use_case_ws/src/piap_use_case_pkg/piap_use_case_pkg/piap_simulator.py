import rclpy
import numpy as np
from rclpy.node import Node

from std_msgs.msg import String
from std_msgs.msg import Int32


class PiapUseCaseSimulator(Node):

    def __init__(self):
        super().__init__('piap_use_case_simulator')
        
        # ROS Topics and Publishers
        # ----------
        self.humidity_sensor_topic = 'humidity'                                                                         #1     
        self.humidity_publisher_ = self.create_publisher(Int32, self.humidity_sensor_topic , 10)          
        self.temperature_sensor_topic = 'temperature'
        self.temperature_publisher_ = self.create_publisher(Int32, self.temperature_sensor_topic , 10)                  #2
        self.opener_cmd_topic = 'opener_cmd'
        self.opener_cmd_publisher_ = self.create_publisher(Int32, self.opener_cmd_topic , 10)                           #3
        self.opener_cmd_monitor_topic = 'opener_cmd_monitor'
        self.opener_cmd_monitor_publisher_ = self.create_publisher(Int32, self.opener_cmd_monitor_topic , 10)           #4
        self.opener_status_topic = 'opener_status'
        self.opener_status_publisher_ = self.create_publisher(Int32, self.opener_status_topic , 10)                     #5
        self.door_status_topic = 'door_status'
        self.door_status_publisher_ = self.create_publisher(Int32, self.door_status_topic , 10)                         #6
        self.laser_status_topic = 'distance'
        self.laser_status_publisher_ = self.create_publisher(Int32, self.laser_status_topic , 10)                       #7 
        self.final_effector_cmd_topic = 'final_effector_cmd'
        self.effector_cmd_publisher_ = self.create_publisher(Int32, self.final_effector_cmd_topic, 10)         #8
        self.final_effector_cmd_monitor_topic = 'final_effector_cmd'
        self.effector_cmd_monitor_publisher_ = self.create_publisher(Int32, self.final_effector_cmd_monitor_topic , 10) #9 
        self.final_effector_status_topic = 'final_effector_status'
        self.effector_status_publisher_ = self.create_publisher(Int32, self.final_effector_status_topic , 10)           #10
                
        # Humidity Sensor
        # ---------------        

        # a) Configure the humidity sensor simulator
        # - Set the mean and standard deviation for the humidity sensor
        # - Set the topic name and publishing rate 
        self.humidity_mean = 56
        self.humidity_sigma = 1 # mean and standard deviation
        humidity_timer_period = 0.5  # seconds

        # b) Create the ROS 2 Publishers 
        # - Create the humidity publisher and an infinite publishing loop                
        self.humidity_timer = self.create_timer(humidity_timer_period, self.humidity_timer_callback)
        self.humidity_msg_counter = 0


        # Temperature Sensor
        # ------------------

        # a) Configure the temperature sensor simulator
        # - Set the mean and standard deviation for the temperature sensor
        # - Set the topic name and publishing rate 
        self.temperature_mean = 16
        self.temperature_sigma = 0.3 # mean and standard deviation
        temperature_timer_period = 2  # seconds

        # b) Create the ROS 2 Publishers 
        # - Create the temperature publisher and an infinite publishing loop                
        self.temperature_timer = self.create_timer(temperature_timer_period, self.temperature_timer_callback)
        self.temperature_msg_counter = 0
        
        # Automated Warehouse Door
        # ------------------------

        # a) Opener Simulator:
        ## Config and initialize the Opener Status
        self.opener_cmd = 0 # 0-Stop, 1-Open, 2-Close
        opener_init_msg = Int32()
        opener_init_msg.data = int(0)
        self.opener_cmd_publisher_.publish(opener_init_msg)
        self.opener_status = 0 # 0-Stopped, 1-Running
        opener_status_timer_period = 2  # seconds
        ## Publish the status of the opener in a continuous loop
        self.opener_status_timer = self.create_timer(opener_status_timer_period, self.opener_status_timer_callback)
        
        
        # b) Door Simulator:
        self.door_state_closed = 0
        self.door_state_open = 10
        self.door_current_state = 0     #  
        self.door_current_behaviour = 0 # 0-Stopped, 1-Opening, 2-Closing
        automated_door_simulator_timer_period = 1  # seconds
        ## Create the door automation simulator
        self.automated_door_simulator_timer = self.create_timer(automated_door_simulator_timer_period, self.door_state_loop_callback)
       
        # c) Laser Simulator:
        self.laser_closest_distance_max = 300 # cm
        self.laser_closest_distance = 300 # cm
        self.laser_pose = 0 #The world space is a 6m. long straight line which accounts for 600 positions (1 per cm.). 
                            # The pose value -300 is 3m. away from the door on the East direction
                            # The pose value +300 is 3m. away from the door on the East direction                        
                            # laser_pose == 0 (laser & door pose are the same) means the laser is placed in the central pose of the world
        laser_simulator_timer_period = 0.5
        self.laser_simulator_timer = self.create_timer(laser_simulator_timer_period, self.laser_simulator_timer_callback)
                            
        # d) Final effector simulator:
        ## Config
        self.final_effector_cmd = 0 # 0-switch off / 1--switch on
        self.final_effector_status = 0 # 0-off / 1-on 
        efector_status_timer_period = 1 #seconds
        ## Initialize the Final Effector Status, Listen to final effector commands and act accordingly
        new_msg = Int32()
        new_msg.data = int(0)
        self.effector_cmd_publisher_.publish(new_msg)      
        self.effector_cmd_subscriber_ = self.create_subscription(Int32, self.final_effector_cmd_topic , self.effector_cmd_callback, 10)
        self.effector_cmd_subscriber_  # prevent unused variable warning
        ## Publish the status of the final effector in a continuous loop
        self.effector_status_timer = self.create_timer(efector_status_timer_period, self.effector_status_timer_callback)
        self.effector_status_msg_counter = 0

        # d) Door Controller Simulator:
        ## Config
        door_controller_simulator_timer_period = 0.5
        self.door_controller_simulator_timer = self.create_timer(door_controller_simulator_timer_period, self.door_control_loop_callback)
        ## The controller listens to door opener commands and act accordingly 
        self.opener_cmd_subscriber_ = self.create_subscription(Int32, self.opener_cmd_topic , self.opener_cmd_callback, 10)
        self.opener_cmd_subscriber_  # prevent unused variable warning               


        # Robot Simulator
        # ---------------        
        
        # a) simulate a robot which wants to (and does) croos the door
        # - the robot approaches the laser sensor -> The robot stops and the door opening task starts when the robot is 100cm away (final effector switched on)
        # - once the door is opened the robot passes through the door -> The laser distance reduces up to 0 and then increases
        # - once the robot goes 100cm away -> the door closing operation starts
        self.robot_time_counter = 0
        robot_simulator_timer_period = 1
        self.robot_simulator_timer = self.create_timer(robot_simulator_timer_period, self.robot_simulator_loop_callback)
        self.robot_speed = 0 # Only two possible robot speeds: 0 and 20 cm/s 
        self.robot_direction = 1 # Only two possible robot directions: 1-east, 2-west
        self.robot_pose = -300 # The world space is a 6m. long straight line which accounts for 600 positions (1 per cm.). 
                               # pose == -300 means the robot is 3m. away from the door on the East direction
                               # pose == +300 means the robot is 3m. away from the door on the East direction
                               
        # The situation repeats in a infinite loop
        # ----------------------------------------
        # The robot starts at -300
        # The door current status is 0 at the very beginning
        
        self.restarter_timer = self.create_timer(1, self.restarter_loop_callback)
                               
    def humidity_timer_callback(self):
        s = np.random.normal(self.humidity_mean, self.humidity_sigma, 1)
        print(s)
        msg = Int32()
        msg.data = int(s)
        self.humidity_publisher_.publish(msg)
        self.get_logger().info('Humidity Sensor: %d [%%]' % msg.data)
        self.humidity_msg_counter += 1
        # if self.humidity_msg_counter > 10:
        #  self.humidity_timer.cancel()
    
    def temperature_timer_callback(self):
        s = np.random.normal(self.temperature_mean, self.temperature_sigma, 1)
        msg = Int32()
        msg.data = int(s[0])
        self.temperature_publisher_.publish(msg)
        self.get_logger().info('Temperature Sensor: %d [ºC]' % msg.data)
        self.temperature_msg_counter += 1
        
    def door_state_loop_callback(self):
        if self.opener_cmd == 1 and self.door_current_state != 10: # opening and door not opened yet
                self.door_current_state = self.door_current_state + 1
        elif self.opener_cmd == 1 and self.door_current_state == 10: # opening and already opened
                msg = Int32()
                msg.data = 0
                self.opener_cmd_publisher_.publish(msg) # Notify the door is already open
        elif self.opener_cmd == 2 and self.door_current_state != 0: # closing and door not closed yet
                self.door_current_state = self.door_current_state - 1
        elif self.opener_cmd == 2 and self.door_current_state == 0: # closing and door not closed yet
                msg = Int32()
                msg.data = 0
                self.opener_cmd_publisher_.publish(msg) # Notify the door is already closed   
        msg = Int32()
        msg.data = self.door_current_state
        self.door_status_publisher_.publish(msg) # Notify the current robot status
        self.get_logger().info('Door Status: %d [0-Closed, 10-Open]' % msg.data)


    def effector_cmd_callback(self, msg):
        if msg.data == 0:
                self.final_effector_status = 0
        elif msg.data == 1:
                self.final_effector_status = 1
        self.get_logger().info('Final Effector Command: %d [0-Switch On, 1-Switch Off)]' % msg.data)
    
    def effector_status_timer_callback(self):
        msg = Int32()
        msg.data = int(self.final_effector_status)
        self.effector_status_publisher_.publish(msg)
        self.get_logger().info('Final Effector Status (Warning Light) is: %d [0:On / 1:Off]' % msg.data)
    
    def opener_cmd_callback(self, msg):
        if msg.data == 0 or msg.data == 1 or msg.data == 2 :
                self.opener_cmd = msg.data
                self.get_logger().info('Opener Command: %d [0-Stop, 1-Open Door, 2- Close Door)]' % msg.data)
                if msg.data == 0:
                        new_msg = Int32()
                        new_msg.data = int(0)
                        self.effector_cmd_publisher_.publish(new_msg)
                else:
                        new_msg = Int32()
                        new_msg.data = int(1)
                        self.effector_cmd_publisher_.publish(new_msg)                    

    def opener_status_timer_callback(self):
        msg = Int32()
        msg.data = int(self.opener_status)
        self.opener_status_publisher_.publish(msg)
        self.get_logger().info('Door Opener Status is: %d [0:Stopped, 1:Running]' % msg.data)  
    
    def laser_simulator_timer_callback(self):
        self.laser_closest_distance = abs(self.robot_pose)
        if self.laser_closest_distance > 300:
                self.laser_closest_distance = 300                 
        msg = Int32()
        msg.data = int(self.laser_closest_distance)
        self.laser_status_publisher_.publish(msg)
        self.get_logger().info('Laser Sensor: Closest obstacle is %d [cm] away' % msg.data)  

    def door_control_loop_callback(self):
        if self.laser_closest_distance <= 160 and self.opener_cmd != 1 and self.door_current_state != 10 : #Open the door
                msg = Int32()
                msg.data = int(1)
                self.opener_cmd_publisher_.publish(msg)
                self.get_logger().info('Door Controller: Open the Door')  
        elif self.laser_closest_distance > 160 and self.opener_cmd != 2 and self.door_current_state != 0 : #Close the door
                msg = Int32()
                msg.data = int(2)
                self.opener_cmd_publisher_.publish(msg)   
                self.get_logger().info('Door Controller: Close the Door')  
        
        
    
    def robot_simulator_loop_callback(self):

        if self.robot_time_counter > 10 and self.laser_closest_distance > 60:
                # Move
                self.robot_speed = 20
        elif self.robot_time_counter > 10 and self.laser_closest_distance <= 60 and self.door_current_state != self.door_state_open:
                # Wait for the door to be open
                self.robot_speed = 0
        elif self.robot_time_counter > 10 and self.laser_closest_distance <= 60 and self.door_current_state == self.door_state_open:
                # Go through the door              
                self.robot_speed = 20
    
        self.robot_pose = self.robot_pose + self.robot_speed        
        self.robot_time_counter = self.robot_time_counter + 1
        
    def restarter_loop_callback(self):
        if self.robot_pose == 300: 
                self.robot_pose = -500
                self.door_current_state = 0       
                self.get_logger().info('Restarter: New Situation')  
                self.get_logger().info('------------------------')          
    
                
                
                
                 

def main(args=None):
    rclpy.init(args=args)

    piap_simulator = PiapUseCaseSimulator()

    rclpy.spin(piap_simulator)

    # Destroy the node explicitly
    # (optional - otherwise it will be done automatically
    # when the garbage collector destroys the node object)
    piap_simulator.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
