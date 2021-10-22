const rclnodejs = require('rclnodejs');
var iotAgentLib = require('iotagent-node-lib');
var configSrv = require('./configService'),
    context = {
      op: 'IoTA-ROS2.Agent'
    };

var last_message = {};
var ros2_system = {};
function start() {
  configSrv.setConfig({});
  configSrv.getLogger().info(context, configSrv.getConfig());
  
  // 1. Read the Conf File and Register the ROS 2 System in the IoTA
  ros2_system["id"]= configSrv.getConfig().ros_2.system.iota_id;
  ros2_system["type"]= configSrv.getConfig().ros_2.system.ngsiv2_type;
  ros2_system["name"]= configSrv.getConfig().ros_2.system.ngsiv2_id;
  ros2_system["service"]= configSrv.getConfig().ros_2.system.service;
  ros2_system["subservice"]= configSrv.getConfig().ros_2.system.subservice;
  ros2_system["active"] = configSrv.getConfig().ros_2.system.ngsiv2_active_attrs;
  //iotAgentLib.register(ros2_system);
  
  // 2. Read the Conf File and Start the ROS 2 middleware
  rclnodejs.init().then(() => {
    // Create the ROS 2 Node
    const node = new rclnodejs.Node('iot_agent', 'ngsiv2');
    
    // Set Aux for Freq Control
    last_message["turtlePose"] = new Date().getTime();
    createSubscriber(node,'turtlesim/msg/Pose',
                          '/turtle1/pose',
                          'turtlePose', 
                          1000);
  
  node.spin(); 
  });
}

/**
 * 
 * @param {Object} systemObj 
 */
function registerROS2System(systemObj){
  
}


/** 
* Create a ROS 2 subscriber using rcl-nodejs
*
* @param {Onject} ros2_node ROS 2 Node 
* @param {String} topic_type_str A string which determines the ROS 2 Type of the subscription topic
* @param {String} topic_path_str the path of the topic in the ROS 2 System
* @param {String} ngsi_attr_name_str name of the NGSI attribute which will hold the topic data
* @param {Integer} throttling_ms_int sets the minimum period (in milisecs) between messages 
*
*/
function createSubscriber(ros2_node, topic_type_str, topic_path_str, ngsi_attr_name_str,throttling_ms_int)
{
  ros2_node.createSubscription(topic_type_str, topic_path_str, (msg) => {
    let last_time_stamp = last_message[ngsi_attr_name_str];
    let time_stamp = new Date().getTime();
    let diff = Math.abs(time_stamp - last_time_stamp);
    if (diff > throttling_ms_int) 
    {
      console.log(`Received message: ${typeof msg}`, msg);
      last_message[ngsi_attr_name_str] = new Date().getTime();
    }
  });

}

start();

exports.start = start;