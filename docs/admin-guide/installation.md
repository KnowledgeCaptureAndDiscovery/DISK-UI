You can install DISK using Docker or [building from source](https://github.com/KnowledgeCaptureAndDiscovery/DISK-WEB/building.md)
We recommend to use `docker` to install DISK. 

## Requirements

To install DISK you need to meet the following requirements:

- Docker
- Docker Compose
- Operating System: Linux, macOS, Windows
- Architecture: x86_64
- Memory: 2GB
- CPU: 1 core

## Installation process

Clone the repository using git

```bash
$ git clone https://github.com/KnowledgeCaptureAndDiscovery/DISK-WEB.git
```

Install DISK using `docker-compose` tool

```bash
$ docker-compose up -d
```

Now, you can verify if DISK is running.

```bash
$ docker-compose ps
```

You will see the following output:

```
     Name                    Command               State                    Ports                  
---------------------------------------------------------------------------------------------------
core_backend_1    catalina.sh run                  Up      0.0.0.0:8080->8080/tcp,:::8080->8080/tcp
core_endpoint_1   /docker-entrypoint.sh java ...   Up      0.0.0.0:3030->3030/tcp,:::3030->3030/tcp
core_frontend_1   nginx -g daemon off;             Up      0.0.0.0:8000->80/tcp,:::8000->80/tcp    
core_wings_1      catalina.sh run                  Up      0.0.0.0:7080->8080/tcp,:::7080->8080/tcp
```

If the state is `Up`, the service are running.
You can access the web interface at [http://localhost:8000](http://localhost:8000)

## Troubleshooting

### Check the server

Sometimes, the server is not responding. You can check if the server is running by running the following command:

Open http://localhost:8080/disk-server/vocabulary to check that the local repository server is working fine. It might take a little while to open it for the first time as it downloads vocabularies from the internet.
