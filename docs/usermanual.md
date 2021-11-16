# User & Programmers Manueal 

The agent relies on *rclnodejs* to interact with the ROS 2 architecture (south port of the agent). For NGSI interactions (north port of the agent), the agent follows the typical approach to FIWARE IoT Agents and builds on the *iotagent-node-lib*. 

The current version creates one single NGSI entity. A default configuration for the NGSI Id and NGSI Type is given but both can be replaced in the config file:

* Default NGSI Id: *"urn:ngsiv2:ROS2System:001"*
* Default NGSI Type: *"ROS2System"*

The custom behavior of the agent needs to be configured through a collection of Active, Lazy and Command attributes in the config file. It is expected that the ROS 2 counterpart of NGSI attributes and commands (i.e., ROS 2 Topics, Service and Action Servers) is known and given to the agent through convenient inputs in the config file. 

The current collection of use cases selected for this IoT Agent is listed below:

1. ROS 2 Topic Message (Read by ROS 2 Subscriber) --> Agent updates an Active NGSIv2 Attribute
2. NGSIv2 Query to Lazy Attribute(s) --> Agent reads Topic Message from ROS 2 Subscriber(s) and sends the NGSIv2 Response
3. NGSIv2 Command *publish* --> Message Published by ROS 2 Publisher
4. NGSIv2 Command *call_srv* --> Service Call made by ROS 2 Service Client (TBD)
5. NGSIv2 Command *call_action* --> Action Call made by ROS 2 Action Client (TBD)
