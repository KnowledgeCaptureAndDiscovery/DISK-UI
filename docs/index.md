# Overview

## What is DISK?

The DISK is a system that automates the execution of scientific workflows triggered on data changes. 

!!! TODO
    Add video or gif


## Why DISK?


## Getting Started


### Quick Start

```bash
$ git clone https://github.com/KnowledgeCaptureAndDiscovery/DISK-WEB.git
$ docker-compose up -d
```

Follow our [getting started guide](getting-started.md). Further user oriented [documentation](user-guide/)
is provided for additional features. Developer oriented [documentation](developer-guide/) is available for people interested in building third-party integrations.



## How it works

The DISK system automates the execution of scientific workflows triggered on data changes.
To do this DISK collects data from different data repositories and defines methods on different workflows systems.
User defined goals are periodically check for new data/methods available. When a method detects new data, a new workflow execution will be send.
Each experiment execution is stored with its metadata and outputs for posterior analysis.

## Architecture

For additional details, see [architecture overview](operator-manual/architecture.md).

## Features

## Development Status

---

![Disk overview](figures/DISK-overview.png "DISK Overview")



## Adoptions
