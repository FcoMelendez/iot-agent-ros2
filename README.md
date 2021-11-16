# Iot Agent for the Robot Operating System (ROS 2)
[![FIWARE IoT Agents](https://nexus.lab.fiware.org/static/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![License: APGL](https://img.shields.io/github/license/telefonicaid/iotagent-ul.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Docker badge](https://img.shields.io/docker/pulls/fiware/iotagent-ul.svg)](https://hub.docker.com/r/fiware/iotagent-ul/)
[![Support badge](https://nexus.lab.fiware.org/repository/raw/public/badges/stackoverflow/iot-agents.svg)](https://stackoverflow.com/questions/tagged/fiware+iot)
<br/>
[![Documentation badge](https://img.shields.io/readthedocs/fiware-iotagent-isoxml.svg)](https://fiware-iotagent-isoxml.readthedocs.io/en/latest/?badge=latest)

(...)

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

## <a name="license"></a> License

TBD
