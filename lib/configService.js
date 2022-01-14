'use strict';

var config = {},
    logger = require('logops');

function anyIsSet(variableSet) {
    for (var i = 0; i < variableSet.length; i++) {
        if (process.env[variableSet[i]]) {
            return true;
        }
    }

    return false;
}

/*
*   
*
*/

function processEnvironmentVariables() {
    var ORION_HOST = process.env.ORION_HOST;
    var MONGODB_HOST = process.env.MONGODB_HOST;
    var IOTA_HOST = process.env.IOTA_HOST;


    config.iota = {
        logLevel: 'DEBUG',
        contextBroker: {
            host: ORION_HOST, //192.168.1.15
            port: '1026',
            ngsiVersion: 'v2'
        },
        server: {
            port: 4061,
            host: IOTA_HOST //192.168.1.18
        },
        deviceRegistry: {
            type: 'memory'
        },
        types: {},
        service: 'ros2iot',
        subservice: '/',
        providerUrl: 'http://'+IOTA_HOST+':4061', //http://192.168.1.18:4061
        defaultResource: '/',
        defaultType: 'ROS2System',
        defaultKey: 'abc'
    };

    config.ros_2 = {};
    config.ros_2.system = {};
    config.ros_2.subscribers = {};  


    /*

    // IoTA Configuration for PIAP's Use Case
    // --------------------------------------
    config.ros_2.system = {
    	"iota_id": "ROS2System0001",
   	    "ngsiv2_type": "ROS2System",
        "ngsiv2_id": "urn:ngsiv2:ROS2System:0001",
        "service": "ros2iot",
        "subservice": "/",   
   	    "ngsiv2_active_attrs": [ {name:"humidity", type: "number"},
                                 {name:"temperature", type: "number"},
                                 {name:"distance", type:"number"},
                                 {name:"doorStatus", type: "number"},
                                 {name:"finalEffectorStatus", type: "number"},
                                 {name:"finalEffectorCmdMonitor", type: "number"},
                                 {name:"openerStatus", type: "number"},
                                 {name:"openerCmdMonitor", type: "number"} ],
        "ngsiv2_lazy_attrs":[{name:"iotaCheck", type:"string"}],// [{name:"turtleColor", type:"Object"}, {name:"turtlePose", type:"Object"}],
        "ngsiv2_commands": [{name:"openerCmd", type:"command"},
                            {name:"finalEffectorCmd", type:"command"}] //[{name:"publishTwist", type:"command"}]   
    };
    
    //  Bridge configuration for ROS 2 Subscribers:
    //    <name of the NGSI attribute (string)> : { "topic_path": <ROS 2 Topic path (string)>,
    //                                              "topic_type": <ROS Message Type (string)> } 
    config.ros_2.subscribers = {
    	"humidity" : { "topic_path": "/humidity", "topic_type": "std_msgs/msg/Int32"},
        "temperature" : { "topic_path": "/temperature", "topic_type": "std_msgs/msg/Int32"},
        "distance" : { "topic_path": "/distance", "topic_type": "std_msgs/msg/Int32"},
        "doorStatus" : { "topic_path": "/door_status", "topic_type": "std_msgs/msg/Int32"},
        "finalEffectorStatus" : { "topic_path": "/final_effector_status", "topic_type": "std_msgs/msg/Int32"},
        "finalEffectorCmdMonitor" : { "topic_path": "/final_effector_cmd", "topic_type": "std_msgs/msg/Int32"},
        "openerStatus" : { "topic_path": "/opener_status", "topic_type": "std_msgs/msg/Int32"},
        "openerCmdMonitor" : { "topic_path": "/opener_cmd", "topic_type": "std_msgs/msg/Int32"},
        "iotaCheck" : {"topic_path": "/ngsiv2/iota_check", "topic_type": "std_msgs/msg/String"}
    };
    
    */

    /*
    // IoTA Configuration for BOSCH's Use Case
    // --------------------------------------
    config.ros_2.system = {
    	"iota_id": "ROS2System0001",
   	    "ngsiv2_type": "ROS2System",
        "ngsiv2_id": "urn:ngsiv2:ROS2System:0001",
        "service": "ros2iot",
        "subservice": "/",   
   	    "ngsiv2_active_attrs": [ {name:"globalPose", type: "number"},
                                 {name:"kf2Pose", type: "number"},
                                 {name:"odom", type:"number"},
                                 {name:"wheelState", type: "number"},
                                 {name:"navigationState", type: "number"},
                                 {name:"navigationSubState", type: "number"},
                                 {name:"borderSensorLeft", type: "number"},
                                 {name:"borderSensorRight", type: "number"},
                                 {name:"compressedImg", type: "object"},
                                 {name:"laserScan", type: "object"},
                                 {name:"laserScanMinDistance", type: "number"}],
        "ngsiv2_lazy_attrs":[{name:"iotaCheck", type:"string"}],// [{name:"turtleColor", type:"Object"}, {name:"turtlePose", type:"Object"}],
        "ngsiv2_commands": [{name:"cmdVelCmd", type:"command"},
                            {name:"finalEffectorCmd", type:"command"}] //[{name:"publishTwist", type:"command"}]   
    };
    
    //  Bridge configuration for ROS 2 Subscribers:
    //    <name of the NGSI attribute (string)> : { "topic_path": <ROS 2 Topic path (string)>,
    //                                              "topic_type": <ROS Message Type (string)> } 
    config.ros_2.subscribers = {
    	"globalPose" : { "topic_path": "/indego_node/global_pose", "topic_type": "geometry_msgs/msg/PoseStamped"},
        "kf2Pose" : { "topic_path": "/indego_node/kf2_pose", "topic_type": "geometry_msgs/msg/PoseStamped"},
        "odom" : { "topic_path": "/indego_node/odom", "topic_type": "nav_msgs/msg/Odometry"},
        "wheelState" : { "topic_path": "/wheel_state", "topic_type": "sensor_msgs/msg/JointState"},
        "navigationState" : { "topic_path": "/indego_node/navigation_state", "topic_type": "std_msgs/msg/UInt8"},
        "navigationSubState" : { "topic_path": "/indego_node/navigation_sub_state", "topic_type": "std_msgs/msg/UInt8"},
        "borderSensorLeft" : { "topic_path": "/indego_node/border_sensor_left", "topic_type": "std_msgs/msg/UInt8"},
        "borderSensorRight" : { "topic_path": "/indego_node/border_sensor_right", "topic_type": "std_msgs/msg/UInt8"},
        "compressedImg" : { "topic_path": "/esp32_cam/detection_image/compressed", "topic_type": "sensor_msgs/msg/CompressedImage"},
        "laserScan" : { "topic_path": "/esp32_cam/laserscan", "topic_type": "sensor_msgs/msg/LaserScan"},
        "laserScanMinDistance" : { "topic_path": "/esp32_cam/laserscan_min_distance", "topic_type": "std_msgs/msg/Float32"},
        "iotaCheck" : {"topic_path": "/ngsiv2/iota_check", "topic_type": "std_msgs/msg/String"}
    };
    */

    config.ros_2.system = {
    	"iota_id": "ROS2System0001",
   	    "ngsiv2_type": "ROS2System",
        "ngsiv2_id": "urn:ngsiv2:ROS2System:0001",
        "service": "ros2iot",
        "subservice": "/",   
   	    "ngsiv2_active_attrs": [ {name:"dronePosition", type: "object"},
                                 {name:"locationSensor001", type: "object"},
                                 {name:"temperatureSensor001", type: "number"},
                                 {name:"humiditySensor001", type: "number"},
                                 {name:"locationSensor002", type: "object"},
                                 {name:"temperatureSensor002", type: "number"},
                                 {name:"humiditySensor002", type: "number"},
                                 {name:"locationSensor003", type: "object"},
                                 {name:"temperatureSensor003", type: "number"},
                                 {name:"humiditySensor003", type: "number"},
                                 {name:"locationSensor004", type: "object"},
                                 {name:"temperatureSensor004", type: "number"},
                                 {name:"humiditySensor004", type: "number"},
                                 {name:"locationSensor005", type: "object"},
                                 {name:"temperatureSensor005", type: "number"},
                                 {name:"humiditySensor005", type: "number"},
                                 {name:"locationSensor006", type: "object"},
                                 {name:"temperatureSensor006", type: "number"},
                                 {name:"humiditySensor006", type: "number"},
                                 {name:"locationSensor007", type: "object"},
                                 {name:"temperatureSensor007", type: "number"},
                                 {name:"humiditySensor007", type: "number"},
                                 {name:"locationSensor008", type: "object"},
                                 {name:"temperatureSensor008", type: "number"},
                                 {name:"humiditySensor008", type: "number"}],
        "ngsiv2_lazy_attrs":[{name:"iotaCheck", type:"string"}],// [{name:"turtleColor", type:"Object"}, {name:"turtlePose", type:"Object"}],
        "ngsiv2_commands": [{name:"cmdVelCmd", type:"command"}] //[{name:"publishTwist", type:"command"}]   
    };
    
    //  Bridge configuration for ROS 2 Subscribers:
    //    <name of the NGSI attribute (string)> : { "topic_path": <ROS 2 Topic path (string)>,
    //                                              "topic_type": <ROS Message Type (string)> } 
    config.ros_2.subscribers = {
    	"dronePosition" : { "topic_path": "/drone_position", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "locationSensor001" : { "topic_path": "/sensors/sensor001/location", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "temperatureSensor001" : { "topic_path": "/sensors/sensor001/temperature", "topic_type": "std_msgs/msg/Int32"},
        "humiditySensor001" : { "topic_path": "/sensors/sensor001/humidity", "topic_type": "std_msgs/msg/Int32"},
        "locationSensor002" : { "topic_path": "/sensors/sensor002/location", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "temperatureSensor002" : { "topic_path": "/sensors/sensor002/temperature", "topic_type": "std_msgs/msg/Int32"},
        "humiditySensor002" : { "topic_path": "/sensors/sensor003/humidity", "topic_type": "std_msgs/msg/Int32"},
        "locationSensor003" : { "topic_path": "/sensors/sensor003/location", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "temperatureSensor003" : { "topic_path": "/sensors/sensor003/temperature", "topic_type": "std_msgs/msg/Int32"},
        "humiditySensor003" : { "topic_path": "/sensors/sensor003/humidity", "topic_type": "std_msgs/msg/Int32"},
        "locationSensor004" : { "topic_path": "/sensors/sensor004/location", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "temperatureSensor004" : { "topic_path": "/sensors/sensor004/temperature", "topic_type": "std_msgs/msg/Int32"},
        "humiditySensor004" : { "topic_path": "/sensors/sensor004/humidity", "topic_type": "std_msgs/msg/Int32"},
        "locationSensor005" : { "topic_path": "/sensors/sensor005/location", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "temperatureSensor005" : { "topic_path": "/sensors/sensor005/temperature", "topic_type": "std_msgs/msg/Int32"},
        "humiditySensor005" : { "topic_path": "/sensors/sensor005/humidity", "topic_type": "std_msgs/msg/Int32"},
        "locationSensor006" : { "topic_path": "/sensors/sensor006/location", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "temperatureSensor006" : { "topic_path": "/sensors/sensor006/temperature", "topic_type": "std_msgs/msg/Int32"},
        "humiditySensor006" : { "topic_path": "/sensors/sensor006/humidity", "topic_type": "std_msgs/msg/Int32"},
        "locationSensor007" : { "topic_path": "/sensors/sensor007/location", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "temperatureSensor007" : { "topic_path": "/sensors/sensor007/temperature", "topic_type": "std_msgs/msg/Int32"},
        "humiditySensor007" : { "topic_path": "/sensors/sensor007/humidity", "topic_type": "std_msgs/msg/Int32"},
        "locationSensor008" : { "topic_path": "/sensors/sensor008/location", "topic_type": "sensor_msgs/msg/NavSatFix"},
        "temperatureSensor008" : { "topic_path": "/sensors/sensor008/temperature", "topic_type": "std_msgs/msg/Int32"},
        "humiditySensor008" : { "topic_path": "/sensors/sensor008/humidity", "topic_type": "std_msgs/msg/Int32"},
        "iotaCheck" : {"topic_path": "/ngsiv2/iota_check", "topic_type": "std_msgs/msg/String"}
    };

    /* 
    
    // IoTA Configuration for the Turtlesim
    // ------------------------------------
    //  Bridge configuration for the ROS 2 System:
    config.ros_2.system = {
    	"iota_id": "ROS2System0001",
   	    "ngsiv2_type": "ROS2System",
        "ngsiv2_id": "urn:ngsiv2:ROS2System:0001",
        "service": "ros2iot",
        "subservice": "/",   
   	    "ngsiv2_active_attrs": [ {name:"turtlePose", type:"Object"} ],// {name:"turtleVel", type:"Object"} ],//[],//[ {name:"turtlePose", type:"Object"} ],
        "ngsiv2_lazy_attrs":[{name:"turtleColor", type:"Object"}],// [{name:"turtleColor", type:"Object"}, {name:"turtlePose", type:"Object"}],
        "ngsiv2_commands": [{name:"moveCmd", type:"command"},
                            {name:"spawnSrvCmd", type:"command"},
                            {name:"rotateAbsActionCmd", type:"command"}] //[{name:"publishTwist", type:"command"}]   
    };
    
    //  Bridge configuration for ROS 2 Subscribers:
    //    <name of the NGSI attribute (string)> : { "topic_path": <ROS 2 Topic path (string)>,
    //                                              "topic_type": <ROS Message Type (string)> } 
    config.ros_2.subscribers = {
    	"turtlePose" : { "topic_path": "/turtle1/pose", "topic_type": "turtlesim/msg/Pose"},
        "turtleColor" : { "topic_path": "/turtle1/color_sensor", "topic_type": "turtlesim/msg/Color"}  
    };
    */  

      	
}



function setConfig(newConfig) {
    config = newConfig;

    processEnvironmentVariables();
}

function getConfig() {
    return config;
}

function setLogger(newLogger) {
    logger = newLogger;
}

function getLogger() {
    return logger;
}

exports.setConfig = setConfig;
exports.getConfig = getConfig;
exports.setLogger = setLogger;
exports.getLogger = getLogger;
