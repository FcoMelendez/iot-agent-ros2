# iot-agent-ros2
Welcome to the ROS 2 IoT Agent Repository...
1. [Introduction](#intro)
2. [ROS 2 IoT Agent Installation](#installation) 
3. [Hello World](#hello)
4. [Demo](#demo) 

## <a name="intro"></a> Introduction

The ROS 2 IoT Agent enables ROS 2 architectures to interact with NGSI brokers. More specifically, the aim of this agent is to bridge the following interaction patterns

* ROS 2 Patterns
    * *"Pub/Sub"* enabled by ROS 2 Publishers and Subscribers
    * *"Request/Response"* enabled by ROS 2 Service Clients and Servers
    * *"Request/Multi-Response"* enabled by ROS 2 Action Clients and Servers

* NGSIv2 Patterns
    * Sync updates through Active NGSI Attributes
    * Async updates through Lazy NGSI Attributes
    * Device actuation through NGSI Commands  

The agent relies on *rclnodejs* to interact with the ROS 2 architecture (south port of the agent). For NGSI interactions (north port of the agent), the agent follows the typical approach to FIWARE IoT Agents and builds on the *iotagent-node-lib*. 

The current version creates one single NGSI entity. A default configuration for the NGSI Id and NGSI Type is given but both can be replaced in the config file:

* Default NGSI Id: *"urn:ngsiv2:ROS2System:001"*
* Default NGSI Type: *"ROS2System"*

The custom behavior of the agent needs to be configured through a collection of Active, Lazy and Command attributes in the config file. It is expected that the ROS 2 counterpart of NGSI attributes and commands (i.e., ROS 2 Topics, Service and Action Servers) is known and given to the agent through convenient inputs in the config file. 

The first collection of use cases selected for this IoT Agent is listed below:

1. ROS 2 Topic Message (Read by ROS 2 Subscriber) --> Agent updates an Active NGSIv2 Attribute
2. NGSIv2 Query to Lazy Attribute(s) --> Agent reads Topic Message from ROS 2 Subscriber(s) and sends the NGSIv2 Response
3. NGSIv2 Command *publish* --> Message Published by ROS 2 Publisher
4. NGSIv2 Command *call_srv* --> Service Call made by ROS 2 Service Client (TBD)
5. NGSIv2 Command *call_action* --> Action Call made by ROS 2 Action Client (TBD)

## <a name="installation"></a> ROS 2 IoT Agent Installation

### Prerequisites

* A ROS 2 installation is needed, either [Foxy](https://docs.ros.org/en/foxy/Installation.html) or [Galactic](https://docs.ros.org/en/galactic/Installation.html). The links attached will guide you through the ROS 2 installation.
* Node.js is also required, it can be installed from [here](https://nodejs.org/en/download/)   

### Installing the ROS 2 Agent

1. Download the agent codebase
```
git clone https://github.com/FcoMelendez/iot-agent-ros2.git
````

2. Go to the iot-agent folder
```
cd iot-agent
```

3. Install the required Node.js dependencies
```
npm install
```
## <a name="hello"></a> Hello World

### Run the Agent
```
node index.js
``` 

## <a name="demo"></a> Demo

### Run the Orion Context Broker

...(Docker-compose)

### Run the Turtlesim Node
Open a console and run the Turtlesim Node with the following command
```
ros2 run turtlesim turtlesim_node
``` 

### Run the Agent
Open a console, go to the "iot-agent/lib" folder and run the following command
```
node index.js
``` 

### Use Cases

#### Use Case 1 (Active Attribute): Monitoring the Turtle Pose 
* Display the pose of the turtle in the web-based GUI
* Run the turtle teleoperation node
* Drive the turtle and see how the pose changes in the GUI

