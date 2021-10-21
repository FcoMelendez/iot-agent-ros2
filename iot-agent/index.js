const rclnodejs = require('rclnodejs');

rclnodejs.init().then(() => {
  const node = new rclnodejs.Node('publisher_example_node');
  
  var counter = 0;
  var i = setInterval(function(){
    var obj = node.getTopicNamesAndTypes();
    console.log(obj);
    console.log("//////////////////"+counter);
    counter++;
    if(counter === 50) {
	clearInterval(i);
    }
 }, 1000);
 node.spin(); 
});
