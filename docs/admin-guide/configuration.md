# Configuration

To configure [DISK](https://disk.isi.edu), you need to edit the [server.properties file](https://github.com/KnowledgeCaptureAndDiscovery/DISK-WEB/blob/main/server.properties).


## Editing server.properties configuration file

The configuration contains four major sections:

- Data Adapters: This section contains the list of data adapters that are used to retrieve data from the data sources.
- Method Adapters: This section contains the list of method adapters that are used to run workflows for data analysis.
- Question Templates: This section contains the list of question templates that are used to create new questions.
- Vocabularies: This section contains the list of ontologies that are used to describe the domain.

### Data Adapters

To add a new Data Source, you should edit the section `data-adapters`. The supported data-adapters are available [here](../developer-guide/data-adapter.md).

For example, the sparql adapter requires the following attributes

- type: sparql
- endpoint: the URL where the RDF data source is available
If the endpoint server is protected using HTTP Basic Authentication

- username: the username  
- username: the password

```bash
data-adapters = 
{
    Wiki = 
    {
        type = sparql;
        endpoint = https://endpoint.mint.isi.edu/tutorial;
        username = admin;
        password = admin;
    }
}

```

### Method Adapters

To add a new workflow system, you should edit the section `method-adapters`. The supported method-adapters are available [here](../developer-guide/method-adapter.md).

For example, the wings adapter requires the following attributes

```bash
method-adapters =
{
    wings =
    {
        type = wings;
        endpoint = http://localhost:7080/wings-portal;
        username = admin;
        password = 4dm1n!23;
        internal_server = http://wings:8080/wings-portal;
        domain = test;
    }
}
```

### Question Templates

If you want to use a new Question Templates, you should edit the section `question-templates`.
To learn more about question templates, please visit [here](../admin-guide/questions/overview.md).

The following example shows how to add the Bike-Rental example on DISK.

```bash
question-templates =
{
    bikes = https://raw.githubusercontent.com/KnowledgeCaptureAndDiscovery/QuestionOntology/main/examples/bike_rent.xml;
}
```

### Domain vocabularies

If you want to use a new domain vocabulary, you should edit the section `vocabularies`.
To learn more about how to create or edit vocabularies, please visit [insert link].

The following example shows how to add the Neuro-DISK domain vocabulary on DISK.

```bash
vocabularies =
{
    neuro = {
        url = https://knowledgecaptureanddiscovery.github.io/DISK-Ontologies/enigma_hypothesis/release/2.0.1/ontology.ttl;
        prefix = neuro;
        namespace = https://w3id.org/disk/ontology/enigma_hypothesis#;
        description = "The NEURO-DISK Hypothesis Ontology: Defines terms to express neuroimaging hypotheses.";
    }
}
```

## Restarting DISK

[DISK](https://disk.isi.edu) needs to be restart after you have edited the configuration files.

To restart the [DISK](https://disk.isi.edu), you should run the following command:

```bash
docker-compose restart
```
