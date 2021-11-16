# Iot Agent for the Robot Operating System (ROS 2)
[![FIWARE IoT Agents](https://nexus.lab.fiware.org/static/badges/chapters/iot-agents.svg)](https://www.fiware.org/developers/catalogue/)
[![License: APGL](https://img.shields.io/github/license/telefonicaid/iotagent-ul.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Docker badge](https://img.shields.io/docker/pulls/fiware/iotagent-ul.svg)](https://hub.docker.com/r/fiware/iotagent-ul/)
[![Support badge](https://nexus.lab.fiware.org/repository/raw/public/badges/stackoverflow/iot-agents.svg)](https://stackoverflow.com/questions/tagged/fiware+iot)
<br/>
[![Documentation badge](https://img.shields.io/readthedocs/fiware-iotagent-ul.svg)](http://fiware-iotagent-ul.readthedocs.io/en/latest/?badge=latest)
[![CI](https://github.com/telefonicaid/iotagent-ul/workflows/CI/badge.svg)](https://github.com/telefonicaid/iotagent-ul/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/telefonicaid/iotagent-ul/badge.svg?branch=master)](https://coveralls.io/github/telefonicaid/iotagent-ul?branch=master)
![Status](https://nexus.lab.fiware.org/static/badges/statuses/iot-ultralight.svg)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/4699/badge)](https://bestpractices.coreinfrastructure.org/projects/4699)

(...)

This project is part of [FIWARE](https://www.fiware.org/). For more information check the FIWARE Catalogue entry for the
[IoT Agents](https://github.com/Fiware/catalogue/tree/master/iot-agents).

| :books: [Documentation](https://iot-agent-ros2.readthedocs.io/en/latest/) | :dart: [Roadmap](https://github.com/telefonicaid/iotagent-ul/blob/master/docs/roadmap.md) |

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

The agent relies on *rclnodejs* to interact with the ROS 2 architecture (south port of the agent). For NGSI interactions (north port of the agent), the agent follows the typical approach to FIWARE IoT Agents and builds on the *iotagent-node-lib*. 

The current version creates one single NGSI entity. A default configuration for the NGSI Id and NGSI Type is given but both can be replaced in the config file:

* Default NGSI Id: *"urn:ngsiv2:ROS2System:001"*
* Default NGSI Type: *"ROS2System"*

The custom behavior of the agent needs to be configured through a collection of Active, Lazy and Command attributes in the config file. It is expected that the ROS 2 counterpart of NGSI attributes and commands (i.e., ROS 2 Topics, Service and Action Servers) is known and given to the agent through convenient inputs in the config file. 

The current collection of use cases selected for this IoT Agent is listed below:

1. ROS 2 Topic Message (Read by ROS 2 Subscriber) --> Agent updates an Active NGSIv2 Attribute
2. NGSIv2 Query to Lazy Attribute(s) --> Agent reads Topic Message from ROS 2 Subscriber(s) and sends the NGSIv2 Response
3. NGSIv2 Command *publish* --> Message Published by ROS 2 Publisher
4. NGSIv2 Command *call_srv* --> Service Call made by ROS 2 Service Client (TBD)
5. NGSIv2 Command *call_action* --> Action Call made by ROS 2 Action Client (TBD)

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
