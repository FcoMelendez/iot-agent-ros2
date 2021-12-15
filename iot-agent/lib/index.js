const rclnodejs = require('rclnodejs');
var iotAgentLib = require('iotagent-node-lib');
var async = require('async');
var request = require('request');
var config = require('./configService'),
    context = {
      op: 'IoTA-ROS2.Agent'
    };

// App Constant
// App Variables
var last_message = {};
var ros2_system_conf = {};
var iota_conf = {};
var checkDeviceLoop = {};
var ros2Loop = {};
var registered_devices_count = 0;
var cached_ros2_msgs_for_lazy_attrs = {};
var ros2_node;

// ROS 2 Commands
// Constants
const ros2_commands = {
  PUBLISH_CMD_RESULT: "OK",
  PUBLISH_CMD_FINAL_STATUS: "COMPLETED"
};

/**
 * Main Flow of the ROS 2 <> NGSI IoTA
 *  1. Load the Configuration and Activate the IoT Agent
 *  2. Read the Conf File and Register the ROS 2 System
 *  3. Start the ROS 2 Middleware
 */
function start() {
   
  // 1. Initialize the app and Activate the Agent
  // --------------------------------------------
  readConfigurationParams();
  activateTheAgent();
 
  // 2. Register the ROS 2 System in the IoTA
  // ----------------------------------------
  provisionROS2Service();
  provisionROS2System();
  waitUntilTheIotaIsReady();
 
  // 3. Start the ROS 2 middleware
  // -----------------------------
  // Crete the ROS 2 Node which will handle the south port of the IoT Agent
  // Create ROS 2 subscribers which will update NGSI Active Attributes
  // Create ROS 2 subscribers which will cache the last message and serve it as NGSI Lazy Attributes
  // When NGSI commands are received the "commandHandler" function will take care of them
  //   Allowed NGSI Command types:
  //   - publish (Topic Message)
  //   - call_srv (Call Service as a ROS 2 Service Client)
  //   - call_action (Call action as a ROS 2 Action Client)
  startTheROS2Loop();

}

// IoTA Agent Handlers
//////////////////////
function queryContextHandler(id, type, service, subservice, attributes, callback) {
  var response = {};
  response["id"]= id;
  response["type"]= type;
  for (var i = 0; i < attributes.length; i++) {
      let attrObject = {};
      attrObject["type"] = cached_ros2_msgs_for_lazy_attrs[attributes[i]].type;
      attrObject["value"] = cached_ros2_msgs_for_lazy_attrs[attributes[i]].value;
      response[attributes[i]] = attrObject;
  }
  callback(null, response);
}

function commandHandler(deviceId, type, service, subservice, attributes, callback) {
  // ToDo: generate command exsecution for the whole command array
  // ToDo: validate the command payload (Check it is a convenient ROS Message)
  console.log("---------");
  console.log(deviceId);
  console.log("---------");
  console.log(attributes);
  var cmdObj = attributes[0];
  generateCommandExecution(service, subservice, deviceId, cmdObj);
  callback();
}

// Main ROS 2 Loop
//////////////////

var startTheROS2Loop =  function(){ros2Loop = setInterval(startROS, 1000);}; // Wait for the ROS System to be provisioned
                                                                             // Then start the ROS 2 Node 

function startROS(){
  if(registered_devices_count>0){
    clearInterval(ros2Loop);
    console.log("ROS2 System: Starting ROS 2 Node");
    rclnodejs.init().then(() => {
      // Create the ROS 2 Node
      ros2_node = new rclnodejs.Node('iot_agent', 'ngsiv2')
      var publisher_init = ros2_node.createPublisher('std_msgs/msg/String', 'iota_check');
      publisher_init.publish(`Hello ROS, this is the FIWARE IoTA`);
      console.log("------ Checking Connection -------");
      var topic_object = ros2_node.getTopicNamesAndTypes();
      console.log(topic_object);
      console.log("------ Checking Connection -------");
      // Create a ROS 2 Subscriber for each Active Attribute
      var ros_attributes = ros2_system_conf.attributes;
      ros_attributes.forEach(element => {
        let ngsi_attr_name = element.name;
        let topic_type_str = ros2_system_conf.subscribers[ngsi_attr_name].topic_type;
        let topic_path_str = ros2_system_conf.subscribers[ngsi_attr_name].topic_path;
        last_message[ngsi_attr_name] = new Date().getTime();
        createSubscriberForActiveAttr(ros2_node,
                              topic_type_str,
                              topic_path_str,
                              ngsi_attr_name, 
                              1000);
      });
      // Create a ROS 2 Subscriber for each Lazy Attribute
      var ros_lazy_attrs = ros2_system_conf.lazy_attrs;
        
        ros_lazy_attrs.forEach(lazy_element => {
        let ngsi_lazy_attr_name = lazy_element.name;
        let lazy_topic_type_str = ros2_system_conf.subscribers[ngsi_lazy_attr_name].topic_type;
        let lazy_topic_path_str = ros2_system_conf.subscribers[ngsi_lazy_attr_name].topic_path;
        last_message[ngsi_lazy_attr_name] = new Date().getTime();
        createSubscriberForLazyAttr(ros2_node,
                              lazy_topic_type_str,
                              lazy_topic_path_str,
                              ngsi_lazy_attr_name, 
                              1000);
      });

    ros2_node.spin(); 
    });
  }
  else{
    console.log("ROS2 System: Waiting for the IOTA");
  }

}

// Aux Functions for IoTA Features
///////////////////////////////////
function activateTheAgent(){
  iotAgentLib.activate(config.getConfig().iota, function (error) {
    if (error) {
        console.log("There was an error activating the IOTA");
        process.exit(1);
    } else {
        iotAgentLib.setDataQueryHandler(queryContextHandler);
        iotAgentLib.setCommandHandler(commandHandler);
        console.log("The IOTA started successfully!!");
    }
  });
}

function provisionROS2Service(){
  var options = {
    'method': 'POST',
    'url': 'http://'+iota_conf.server_host+':'+iota_conf.server_port+'/iot/services',
    'headers': {
      'fiware-service': ros2_system_conf.service,
      'fiware-servicepath': ros2_system_conf.subservice,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"services":[{"apikey":iota_conf.default_key,
                                       "cbroker":"http://"+iota_conf.cbroker_host+":"+iota_conf.cbroker_port,
                                       "entity_type":iota_conf.default_type,
                                       "resource":iota_conf.default_resource}]})

  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

function provisionROS2System(){
  var options = {
    'method': 'POST',
    'url': 'http://'+iota_conf.server_host+':'+iota_conf.server_port+'/iot/devices',
    'headers': {
      'fiware-service': ros2_system_conf.service,
      'fiware-servicepath': ros2_system_conf.subservice,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"devices":[{"device_id": ros2_system_conf.id,
                                      "entity_name":ros2_system_conf.name,
                                      "entity_type": ros2_system_conf.type,
                                      "apikey": iota_conf.default_key, 
                                      "attributes":ros2_system_conf.attributes,
                                      "lazy": ros2_system_conf.lazy_attrs,
                                      "commands": ros2_system_conf.commands} ]})

  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

var waitUntilTheIotaIsReady =  function(){checkDeviceLoop = setInterval(checkDevice, 1000);};

function checkDevice(){
  iotAgentLib.listDevices(ros2_system_conf.service, ros2_system_conf.subservice, 20,0, function (error, obj){
    if (error){
      console.log(error);
    }
    else if(obj.count>0){
      clearInterval (checkDeviceLoop);
      registered_devices_count = obj.count;
      console.log("IOTA Agent: The ROS 2 System is Ready");   
    }
    else{
      console.log("IOTA Agent: Waiting for the ROS 2 System to be registered");  
    }
  });
}


var generateCommandExecution = async function (service, subservice, deviceId, commandObj) {
  var myDeviceInfo;
  iotAgentLib.getDeviceByName(deviceId, service, subservice, function(error, dev) {
    if (error) {
        console.log(error);
    } else {
      myDeviceInfo = dev;
    }
  });
  var ros2_command_type = commandObj.value.rosCmd;
  //  if command type is: 
  //    "publish"     -> Create publisher, publish message, update command result
  //    "call_srv"    -> Create Service Client, call Service, update command result
  //    "call_action" -> Create Action Client, call Action, start handler of async command results
  //    Otherwise return "unknown_command" 
  if (ros2_command_type == "publish")
  {
    publishNgsiCommandAsROS2TopicMessage(commandObj);
    // Update the Command
    iotAgentLib.setCommandResult(deviceId,
      iota_conf.default_resource,iota_conf.default_key,
      commandObj.name,
      ros2_commands.PUBLISH_CMD_RESULT,
      ros2_commands.PUBLISH_CMD_FINAL_STATUS,
      myDeviceInfo,
      function(error, obj) {
        if (error){
          console.log(error);
          config.getLogger().debug('Error in Command Update: %s', error);
        }
        else{
          console.log("The command was successfully updated");
          console.log(obj);
        }
      });
  }
  else if(ros2_command_type == "call_srv") 
  {
    publishNgsiCommandAsROS2ServiceCall(commandObj, deviceId, myDeviceInfo);
  }
  else if(ros2_command_type == "call_action") 
  {
    publishNgsiCommandAsROS2ActionCall(commandObj, deviceId, myDeviceInfo);
  }  

}


// Aux Functions for ROS 2 Features
///////////////////////////////////

/** 
* Create a ROS 2 subscriber using rcl-nodejs
*
* @param {Object} ros2_node ROS 2 Node 
* @param {String} topic_type_str A string which determines the ROS 2 Type of the subscription topic
* @param {String} topic_path_str the path of the topic in the ROS 2 System
* @param {String} ngsi_attr_name_str name of the NGSI attribute which will hold the topic data
* @param {Integer} throttling_ms_int sets the minimum period (in milisecs) between messages 
*
*/
function createSubscriberForActiveAttr(ros2_node, topic_type_str, topic_path_str, ngsi_attr_name_str,throttling_ms_int)
{
  /*last_message[ngsi_attr_name_str] = 0;
  var subscriber_initializer_loop = setInterval(() => {
    var topics_names_and_types = ros2_node.getTopicNamesAndTypes();
    console.log(topics_names_and_types);
    
  }, 1000);*/
  ros2_node.createSubscription(topic_type_str, topic_path_str, (msg) => {
    let last_time_stamp = last_message[ngsi_attr_name_str];
    let time_stamp = new Date().getTime();
    let diff = Math.abs(time_stamp - last_time_stamp);
    if (diff > throttling_ms_int) 
    {
      //console.log(`Received message: ${typeof msg}`, msg); //fmf
      last_message[ngsi_attr_name_str] = new Date().getTime();
      sendROS2MessageAsActiveAttribute(ngsi_attr_name_str, msg);
    }
  });

}

function createSubscriberForLazyAttr(ros2_node, topic_type_str, topic_path_str, ngsi_attr_name_str,throttling_ms_int)
{
    last_message[ngsi_attr_name_str] = 0;
    ros2_node.createSubscription(topic_type_str, topic_path_str, (msg) => {
    let last_time_stamp = last_message[ngsi_attr_name_str];
    let time_stamp = new Date().getTime();
    let diff = Math.abs(time_stamp - last_time_stamp);
    if (diff > throttling_ms_int) 
    {
      var messageObject = {"name":ngsi_attr_name_str, "type":"Object", "value":msg};
      cached_ros2_msgs_for_lazy_attrs[ngsi_attr_name_str] = messageObject;
      last_message[ngsi_attr_name_str] = new Date().getTime();
    }
  });
}

function publishNgsiCommandAsROS2TopicMessage(ngsiCommand){
  var command_value = ngsiCommand.value;
  var refCommandValueObject = {rosCmd:"",topic_path:"",topic_type:"",messageObj:{}};
  var isValidCmdValue = deepMessageStructureCheck(refCommandValueObject, command_value, 1);

  if (isValidCmdValue){
    var referenceMessageObj = rclnodejs.createMessageObject(command_value.topic_type);
    var ros2MessageObj = command_value.messageObj; 
    var isValidMessageObj = deepMessageStructureCheck(referenceMessageObj, ros2MessageObj);
    if (isValidMessageObj){
      console.log(referenceMessageObj);
      console.log(command_value.messageObj);
      var publisher = ros2_node.createPublisher(command_value.topic_type, command_value.topic_path);
      publisher.publish(command_value.messageObj);+
      delete publisher;
    }
    else{
      console.log("Wrong 'messageObject' structure for "+commandValueObject.topic_type+ ", the correct structure is:");
      console.log(referenceMessageObj);
      console.log("check the complete message definition at:");
      var msg_type_array = command_value.topic_type.split("/");
      console.log("http://docs.ros.org/en/melodic/api/"+msg_type_array[0]+"/html/msg/"+msg_type_array[2]+".html");
    }
  }
  else if(!isValidCmdValue){
    console.log("Wrong NGSI 'publish' command for ROS2 systems. The correct structure is:");
    console.log(refCommandValueObject);
    console.log("Yours is:");
    console.log(command_value);
  }
  else{
    console.log("This is not a 'publish' command");
  }
}

function publishNgsiCommandAsROS2ServiceCall(ngsiCommand, device_id, device_info){
  var command_value = ngsiCommand.value;
  var refCommandValueObject = {rosCmd:"",srv_type:"", srv_name:"", requestObj:{}};
  var isValidCmdValue = deepMessageStructureCheck(refCommandValueObject, command_value, 1);
  if (isValidCmdValue){
    console.log("Service Calling!!!!!!!!!!");
    // TODO: Find a way to validate service request and add convenient code here
    console.log(command_value);
    var srv_manager = ros2_node.createClient(command_value.srv_type, command_value.srv_name);
    srv_manager.sendRequest(command_value.requestObj, function(response){
      // Update the NGSI Command
      iotAgentLib.setCommandResult(device_id,
        iota_conf.default_resource,iota_conf.default_key,
        ngsiCommand.name,
        response,
        ros2_commands.PUBLISH_CMD_FINAL_STATUS,
        device_info,
        function(error, obj) {
          if (error){
            console.log(error);
            config.getLogger().debug('Error in Command Update: %s', error);
          }
          else{
            console.log("The command was successfully updated");
            console.log("Service Response: %s", JSON.stringify(response, null, 2));
          }
        });
    });
    
  }
  else{
    console.log("Wrong NGSI 'publish' command for ROS2 systems. The correct structure is:");
    console.log(refCommandValueObject);
    console.log("Yours is:");
    console.log(command_value);
  }
}

function publishNgsiCommandAsROS2ActionCall(ngsiCommand, device_id, device_info){
  var command_name = ngsiCommand.name;
  var command_value = ngsiCommand.value;
  var refCommandValueObject = {rosCmd:"", actionType:"", actionName:"", goalObj:{}};
  var isValidCmdValue = deepMessageStructureCheck(refCommandValueObject, command_value, 1);
  
  if (isValidCmdValue){
    // TODO: Find a way to validate service request and add convenient code here
    console.log(command_value);
    var action_result={};
    sendGoal(command_value, command_name);
}

async function sendGoal(ngsi_command_value, ngsi_command_name){
  var action_client = new rclnodejs.ActionClient(ros2_node, ngsi_command_value.actionType, ngsi_command_value.actionName);
  // goalHandle is a "ClientGoalHandle", see http://robotwebtools.org/rclnodejs/docs/0.20.0/ClientGoalHandle.html
  const goalHandle = await action_client.sendGoal(ngsi_command_value.goalObj, (feedback) => {
    ros2_node.getLogger().info(`Received feedback: ${JSON.stringify(feedback)}`);
  });
  if (!goalHandle.accepted) {
    ros2_node.getLogger().info('Goal rejected');
    return;
  }

  ros2_node.getLogger().info('Goal accepted');
  result = await goalHandle.getResult();
  ros2_node.getLogger()
  .info(`Goal suceeded with result: ${JSON.stringify(result)}`);
  // Update the NGSI Command
  iotAgentLib.setCommandResult(device_id,
    iota_conf.default_resource,iota_conf.default_key,
    ngsiCommand.name,
    result.status,
    ros2_commands.PUBLISH_CMD_FINAL_STATUS,
    device_info,
    function(error, obj) {
        if (error){
          console.log(error);
          config.getLogger().debug('Error in Command Update: %s', error);
        }
        else{
          console.log("The command was successfully updated");
          console.log("Service Response: %s", JSON.stringify(obj, null, 2));
        }
      });
  }
}




function deepMessageStructureCheck(object1, object2, max_level=999) {
  if(max_level > 0)
  {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = isObject(val1) && isObject(val2);
      new_max = max_level - 1;
      if (areObjects && !deepMessageStructureCheck(val1, val2, new_max)) {
        return false;
      }
    }
  }
  return true;
}

function isObject(object) {
  return object != null && typeof object === 'object';
}

function sendROS2MessageAsActiveAttribute(ngsi_attribute_name, ros2_message)
{
  var myObject = [{"name":ngsi_attribute_name, "type":"Object", "value":ros2_message}];
  iotAgentLib.retrieveDevice(ros2_system_conf.id, iota_conf.default_key, function (error, device) {
    if (error) {
        console.log("Couldn't find the device: " + JSON.stringify(error));
    } else {
        iotAgentLib.update(device.name, device.type, "", myObject, device, function (error) {
            if (error) {
                console.log("Error updating the device");
            } else {
                console.log("Device successfully updated");
            }
        });
    }
  });
}



// Aux Function for Loading Configuration Variables
///////////////////////////////////////////////////
function readConfigurationParams(){
  
  config.setConfig({});
  config.getLogger().info(context, config.getConfig());

  // Read IoTA Service Configuration
  iota_conf["server_host"] = config.getConfig().iota.server.host;
  iota_conf["server_port"] = config.getConfig().iota.server.port;
  iota_conf["cbroker_host"] = config.getConfig().iota.contextBroker.host;
  iota_conf["cbroker_port"] = config.getConfig().iota.contextBroker.port;
  iota_conf["default_type"] = config.getConfig().iota.defaultType;
  iota_conf["default_key"] = config.getConfig().iota.defaultKey;
  iota_conf["default_resource"] = config.getConfig().iota.defaultResource;
  
  // Read ROS 2 System Configuration
  ros2_system_conf["id"]= config.getConfig().ros_2.system.iota_id;
  ros2_system_conf["type"]= config.getConfig().ros_2.system.ngsiv2_type;
  ros2_system_conf["name"]= config.getConfig().ros_2.system.ngsiv2_id;
  ros2_system_conf["service"]= config.getConfig().ros_2.system.service;
  ros2_system_conf["subservice"]= config.getConfig().ros_2.system.subservice;
  ros2_system_conf["attributes"] = config.getConfig().ros_2.system.ngsiv2_active_attrs;
  ros2_system_conf["lazy_attrs"] = config.getConfig().ros_2.system.ngsiv2_lazy_attrs;
  ros2_system_conf["commands"] = config.getConfig().ros_2.system.ngsiv2_commands;
  ros2_system_conf["subscribers"] = config.getConfig().ros_2.subscribers;

}

// Sys Functions
////////////////
process.on('SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  process.exit(0);
});


start();

exports.start = start;
