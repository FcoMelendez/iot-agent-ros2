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

    config.ros_2 = {};
    config.ros_2.system = {};
    config.ros_2.subscribers = {};  
    //  Bridge configuration for the ROS 2 System:
    config.ros_2.system = {
    	"ngsiv2_id": "urn:ngsiv2:ROS2System:0001",
   	"ngsiv2_type": "ROS2System",
   	"ngsiv2_active_attrs": ["turtlePose"]
    };
    //  Bridge configuration for ROS 2 Subscribers:
    //    <name of the NGSI attribute (string)> : { "topic_path": <ROS 2 Topic path (string)>,
    //                                              "topic_type": <ROS Message Type (string)> } 
    config.ros_2.subscribers = {
    	"turtlePose" : { "topic_path": "/turtle1/pose", "topic_type": "turtlesim/msg/Pose"} 
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
