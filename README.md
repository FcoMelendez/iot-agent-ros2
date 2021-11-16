# Iot Agent for the Robot Operating System (ROS 2)
[![FIWARE IoT Agents](https://nexus.lab.fiware.org/static/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![License: APGL](https://img.shields.io/github/license/telefonicaid/iotagent-ul.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Docker badge](https://img.shields.io/docker/pulls/fiware/iotagent-ul.svg)](https://hub.docker.com/r/fiware/iotagent-ul/)
[![Documentation badge](https://img.shields.io/readthedocs/iot-agent-ros2.svg)](https://iot-agent-ros2.readthedocs.io/en/latest/?badge=latest)

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

This project is part of [FIWARE](https://www.fiware.org/). For more information check the FIWARE Catalogue entry for the
[IoT Agents](https://github.com/Fiware/catalogue/tree/master/iot-agents).

| :books: [Documentation](https://iot-agent-ros2.readthedocs.io/en/latest/) | :dart: [Roadmap](https://github.com/telefonicaid/iotagent-ul/blob/master/docs/roadmap.md) |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |

## Content

1. [Background](#intro)
2. [Install](#install) 
3. [Usage](#usage)
4. [API](#api)
5. [Testing](#testing) 
6. [License](#license) 

## <a name="background"></a> Background

The ROS 2 IoT Agent enables ROS 2 architectures to interact with NGSI brokers. More specifically, the aim of this agent is to bridge the following interaction patterns

* ROS 2 Patterns
    * *"Pub/Sub"* enabled by ROS 2 Publishers and Subscribers
    * *"Request/Response"* enabled by ROS 2 Service Clients and Servers
    * *"Request/Multi-Response"* enabled by ROS 2 Action Clients and Servers

* NGSIv2 Patterns
    * Sync updates through Active NGSI Attributes
    * Async updates through Lazy NGSI Attributes
    * Device actuation through NGSI Commands  

The agent relies on *rclnodejs* to interact with the ROS 2 architecture (south port of the agent). For NGSI interactions (north port), the agent follows the typical approach to FIWARE IoT Agents and builds on the *iotagent-node-lib*. 

## <a name="install"></a> Install
Information about how to install the IoT Agent for ROS 2 can be found at the corresponding section of the
[Installation & Administration Guide](docs/installationguide.md).


## <a name="usage"></a> Usage

Information about how to use the IoT Agent can be found in the [User & Programmers Manual](docs/usermanual.md).

## <a name="api"></a> API

TBD

## <a name="testing"></a> Testing

TBD

---

## <a name="license"></a> License

The IoT Agent for ROS 2 is licensed under [Affero General Public License (GPL) version 3](./LICENSE).

© 2020 FIWARE Foundation e.V.

### Are there any legal issues with AGPL 3.0? Is it safe for me to use?

There is absolutely no problem in using a product licensed under AGPL 3.0. Issues with GPL (or AGPL) licenses are mostly
related with the fact that different people assign different interpretations on the meaning of the term “derivate work”
used in these licenses. Due to this, some people believe that there is a risk in just _using_ software under GPL or AGPL
licenses (even without _modifying_ it).

For the avoidance of doubt, the owners of this software licensed under an AGPL-3.0 license wish to make a clarifying
public statement as follows:

> Please note that software derived as a result of modifying the source code of this software in order to fix a bug or
> incorporate enhancements is considered a derivative work of the product. Software that merely uses or aggregates (i.e.
> links to) an otherwise unmodified version of existing software is not considered a derivative work, and therefore it
> does not need to be released as under the same license, or even released as open source.
