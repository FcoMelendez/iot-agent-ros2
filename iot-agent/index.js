const rclnodejs = require('rclnodejs');

rclnodejs.init().then(() => {
  const node = rclnodejs.createNode('subscription_example_node');

  node.createSubscription('turtlesim/msg/Pose', '/turtle1/pose', (msg) => {
    console.log(`Received message: ${typeof msg}`, msg);
  });
 
 node.spin(); 
});
