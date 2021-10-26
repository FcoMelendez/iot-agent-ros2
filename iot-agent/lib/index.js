const rclnodejs = require('rclnodejs');
var iotAgentLib = require('iotagent-node-lib');
var request = require('request');
var configSrv = require('./configService'),
    context = {
      op: 'IoTA-ROS2.Agent'
    };

// App Variables
var last_message = {};
var ros2_system_conf = {};
var iota_conf = {};
var checkDeviceLoop = {};
var ros2Loop = {};
var registered_devices_count = 0;
var cached_ros2_msgs_for_lazy_attrs = {};

/**
 * Main Flow of the ROS 2 <> NGSI IoTA
 *  1. Load the Configuration and Activate the IoT Agent
 *  2. Read the Conf File and Register the ROS 2 System
 *  3. Start the ROS 2 Middleware
 */
function start() {
   
  // 1. Initialize the app and Activate the Agent
  // -------------------------------
  readConfigurationParams();
  activateTheAgent();
 

  // 2. Register the ROS 2 System in the IoTA
  // ---------------------------------------------------------------
  provisionROS2Service();
  provisionROS2System();
  waitUntilTheIotaIsReady();
  

  // 3. Start the ROS 2 middleware
  // -----------------------------
  startTheROS2Loop();

}

// Aux Function for Loading Configuration Variables
///////////////////////////////////////////////////
function readConfigurationParams(){
  
  configSrv.setConfig({});
  configSrv.getLogger().info(context, configSrv.getConfig());

  // Read IoTA Service Configuration
  iota_conf["server_host"] = configSrv.getConfig().iota.server.host;
  iota_conf["server_port"] = configSrv.getConfig().iota.server.port;
  iota_conf["cbroker_host"] = configSrv.getConfig().iota.contextBroker.host;
  iota_conf["cbroker_port"] = configSrv.getConfig().iota.contextBroker.port;
  iota_conf["default_type"] = configSrv.getConfig().iota.defaultType;
  iota_conf["default_key"] = configSrv.getConfig().iota.defaultKey;
  iota_conf["default_resource"] = configSrv.getConfig().iota.defaultResource;
  
  // Read ROS 2 System Configuration
  ros2_system_conf["id"]= configSrv.getConfig().ros_2.system.iota_id;
  ros2_system_conf["type"]= configSrv.getConfig().ros_2.system.ngsiv2_type;
  ros2_system_conf["name"]= configSrv.getConfig().ros_2.system.ngsiv2_id;
  ros2_system_conf["service"]= configSrv.getConfig().ros_2.system.service;
  ros2_system_conf["subservice"]= configSrv.getConfig().ros_2.system.subservice;
  ros2_system_conf["attributes"] = configSrv.getConfig().ros_2.system.ngsiv2_active_attrs;
  ros2_system_conf["lazy_attrs"] = configSrv.getConfig().ros_2.system.ngsiv2_lazy_attrs;
  ros2_system_conf["subscribers"] = configSrv.getConfig().ros_2.subscribers;

}


// Aux Functions for IoTA Features
///////////////////////////////////
function activateTheAgent(){
  iotAgentLib.activate(configSrv.getConfig().iota, function (error) {
    if (error) {
        console.log("There was an error activating the IOTA");
        process.exit(1);
    } else {
        iotAgentLib.setDataQueryHandler(queryContextHandler);
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
                                      "attributes":ros2_system_conf.attributes,
                                      "lazy": ros2_system_conf.lazy_attrs}]})

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


// Aux Functions for ROS 2 Features
///////////////////////////////////

var startTheROS2Loop =  function(){ros2Loop = setInterval(startROS, 1000);};

function startROS(){
  if(registered_devices_count>0){
    clearInterval(ros2Loop);
    console.log("ROS2 System: Starting ROS 2 Node");
    rclnodejs.init().then(() => {
      // Create the ROS 2 Node
      const node = new rclnodejs.Node('iot_agent', 'ngsiv2');
      
      // Create a ROS 2 Subscriber for each Active Attribute
      var ros_attributes = ros2_system_conf.attributes;
      ros_attributes.forEach(element => {
        let ngsi_attr_name = element.name;
        let topic_type_str = ros2_system_conf.subscribers[ngsi_attr_name].topic_type;
        let topic_path_str = ros2_system_conf.subscribers[ngsi_attr_name].topic_path;
        last_message[ngsi_attr_name] = new Date().getTime();
        createSubscriberForActiveAttr(node,
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
        createSubscriberForLazyAttr(node,
                              lazy_topic_type_str,
                              lazy_topic_path_str,
                              ngsi_lazy_attr_name, 
                              1000);
      });
    node.spin(); 
    });
  }
  else{
    console.log("ROS2 System: Waiting for the IOTA");
  }

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
function createSubscriberForActiveAttr(ros2_node, topic_type_str, topic_path_str, ngsi_attr_name_str,throttling_ms_int)
{
  last_message[ngsi_attr_name_str] = 0;
  ros2_node.createSubscription(topic_type_str, topic_path_str, (msg) => {
    let last_time_stamp = last_message[ngsi_attr_name_str];
    let time_stamp = new Date().getTime();
    let diff = Math.abs(time_stamp - last_time_stamp);
    if (diff > throttling_ms_int) 
    {
      console.log(`Received message: ${typeof msg}`, msg);
      last_message[ngsi_attr_name_str] = new Date().getTime();
      sendROS2MessageAsActiveAttribute(ngsi_attr_name_str, msg);
    }
  });

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

function createSubscriberForLazyAttr(ros2_node, topic_type_str, topic_path_str, ngsi_attr_name_str,throttling_ms_int)
{
    last_message[ngsi_attr_name_str] = 0;
    ros2_node.createSubscription(topic_type_str, topic_path_str, (msg) => {
    let last_time_stamp = last_message[ngsi_attr_name_str];
    let time_stamp = new Date().getTime();
    let diff = Math.abs(time_stamp - last_time_stamp);
    if (diff > throttling_ms_int) 
    {
      console.log(`Received message: ${typeof msg}`, msg);
      var messageObject = {"name":ngsi_attr_name_str, "type":"Object", "value":msg};
      cached_ros2_msgs_for_lazy_attrs[ngsi_attr_name_str] = messageObject;
      last_message[ngsi_attr_name_str] = new Date().getTime();
    }
  });

}

// Sys Functions
/////////////////////
process.on('SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  process.exit(0);
});


start();

exports.start = start;
