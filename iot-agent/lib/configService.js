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

    config.iota = {
        logLevel: 'DEBUG',
        contextBroker: {
            host: 'localhost', //192.168.1.15
            port: '1026',
            ngsiVersion: 'v2'
        },
        server: {
            port: 4061,
            host: 'iota' //192.168.1.18
        },
        deviceRegistry: {
            type: 'memory'
        },
        types: {},
        service: 'ros2iot',
        subservice: '/',
        providerUrl: 'http://localhost:4061', //http://192.168.1.18:4061
        defaultResource: '/',
        defaultType: 'ROS2System',
        defaultKey: 'abc'
    };

    config.ros_2 = {};
    config.ros_2.system = {};
    config.ros_2.subscribers = {};  
    
    //  Bridge configuration for the ROS 2 System:
    config.ros_2.system = {
    	"iota_id": "ROS2System0001",
   	    "ngsiv2_type": "ROS2System",
        "ngsiv2_id": "urn:ngsiv2:ROS2System:0001",
        "service": "ros2iot",
        "subservice": "/",   
   	    "ngsiv2_active_attrs": [ {name:"turtlePose", type:"Object"} ],// {name:"turtleVel", type:"Object"} ],//[],//[ {name:"turtlePose", type:"Object"} ],
        "ngsiv2_lazy_attrs":[{name:"turtleColor", type:"Object"}],// [{name:"turtleColor", type:"Object"}, {name:"turtlePose", type:"Object"}],*/
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
