# Welcome to the FIWARE IoT Agent for ROS 2

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![](https://nexus.lab.fiware.org/repository/raw/public/badges/stackoverflow/iot-agents.svg)](https://stackoverflow.com/questions/tagged/fiware+iot)

An Internet of Things Agent for the Robot Operating System (ROS 2) (with [HTTP](https://www.ros.org)). This IoT Agent is
designed to be a bridge between robotics systems running the ROS 2 Middleware and the
[NGSI](https://swagger.lab.fiware.org/?url=https://raw.githubusercontent.com/FIWARE/specifications/master/OpenAPI/ngsiv2/ngsiv2-openapi.json)
interface of a context broker.

[ROS](https://www.ros.org) (Robot Operating System) is an open source software development kit for robotics applications. Ready-made drivers, state-of-the-art algorithms, and powerful developer tools are some of its key features. Step by step ROS is becoming a standard software platform that allows developers across multiple industries to successfullly carry out ambitious robotics projects at all stages, from research and prototyping all the way through to deployment and production.

This _Internet of Things Agent_ is a bridge that can be used to communicate devices
using the ROS 2 Middleware and NGSI Context Brokers (like [Orion](https://github.com/telefonicaid/fiware-orion)). 
The south port of the agent implements a ROS 2 client which is based on the [rclnodejs](https://github.com/RobotWebTools/rclnodejs) library.  
The north port handles the NGSI interactions and is based on the [IoT Agent Node.js Library](https://github.com/telefonicaid/iotagent-ul/blob/master/README.md). Further general information about the FIWARE IoT Agents framework, its architecture and the common interaction model can be found in the library's GitHub repository.

The [User Manual](usermanual.md) and the [Admin Guide](installationguide.md) of the ROS 2 IoT Agent cover more advanced topics of this robotics interface for NGSI brokers.
