You can install [DISK](https://disk.isi.edu) using a Docker container or [building from source code](https://github.com/KnowledgeCaptureAndDiscovery/DISK-WEB/building.md).
We recommend to use a Docker container to install [DISK](https://disk.isi.edu).

## Requirements

To install [DISK](https://disk.isi.edu) from a Docker container you need to meet the following requirements:

- Docker
- Docker Compose
- Operating System: Linux, macOS, Windows
- Architecture: x86_64
- Memory: 2GB
- CPU: 1 core

## Installation process

DISK is composed of two services:

- [DISK Frontend Web Application](https://hub.docker.com/repository/docker/ikcap/disk_frontend)
- [DISK Backend](https://hub.docker.com/repository/docker/ikcap/disk_backend)

And two external services:

- [WINGS](https://hub.docker.com/repository/docker/ikcap/disk_backend)
- [Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/)

Clone the repository using git:

```bash
$ git clone https://github.com/KnowledgeCaptureAndDiscovery/DISK-WEB.git
```

Install the [DISK](https://disk.isi.edu) container using `docker-compose` tool:

```bash
$ docker-compose up -d
```

Now you can verify if [DISK](https://disk.isi.edu) is running:

```bash
$ docker-compose ps
```

This will generate the following output:

```
     Name                    Command               State                    Ports
---------------------------------------------------------------------------------------------------
core_backend_1    catalina.sh run                  Up      0.0.0.0:8080->8080/tcp,:::8080->8080/tcp
core_endpoint_1   /docker-entrypoint.sh java ...   Up      0.0.0.0:3030->3030/tcp,:::3030->3030/tcp
core_frontend_1   nginx -g daemon off;             Up      0.0.0.0:8000->80/tcp,:::8000->80/tcp
core_wings_1      catalina.sh run                  Up      0.0.0.0:7080->8080/tcp,:::7080->8080/tcp
```

If the state is `Up` in all the lines, all the [DISK](https://disk.isi.edu) services are running.

You can access the [DISK](https://disk.isi.edu) user interface at [http://localhost:8000](http://localhost:8000).

## Troubleshooting

### Check the server

Sometimes the server is not responding. You can check the state of the server opening http://localhost:8080/disk-server/vocabulary. It might take a little while to open it for the first time as it downloads domain vocabularies from the internet.

You should see a list of domain vocabularies.
