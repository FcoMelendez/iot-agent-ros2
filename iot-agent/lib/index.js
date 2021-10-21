const rclnodejs = require('rclnodejs');
var configSrv = require('./configService');
var last_message = {}

rclnodejs.init().then(() => {
  configSrv.setConfig({});
  console.log(configSrv.getConfig());

  const node = new rclnodejs.Node('iot_agent', 'ngsiv2');
  
  // Set Aux for Freq Control
  last_message["turtlePose"] = new Date().getTime();

  node.createSubscription('turtlesim/msg/Pose', '/turtle1/pose', (msg) => {
    let last_time_stamp = last_message["turtlePose"];
    let time_stamp = new Date().getTime();
    let diff = Math.abs(time_stamp - last_time_stamp);
    if (diff > 1000) 
    {
      console.log(`Received message: ${typeof msg}`, msg);
      last_message["turtlePose"] = new Date().getTime();
    }
  });
 
 node.spin(); 
});
