# DISK REST API

The main resources of [DISK](https://disk.isi.edu) are exposed through the REST API.
Common REST operations are available, but some may be restricted to authenticated users.

Each resource can be listed (`GET`), but creating (`POST`) or editing (`PUT`) needs authentication.

## Authentication

To edit the data on the [DISK](https://disk.isi.edu) REST API you need an account on our [login system](https://auth.mint.isi.edu/auth/).
You could get an access token with:

```
curl -d 'client_id=enigma-disk' -d 'username=xxx' -d 'password=xxx' -d 'grant_type=password' \
     'https://auth.mint.isi.edu/auth/realms/production/protocol/openid-connect/token'
```

On each authorized request you must add the obtained access token and added to the request header:

```
Authorization: Bearer <your_token>
```


## Hypotheses

Hypotheses represents a question to be solve.

 - List resources: `GET disk-server/hypotheses`
 - Get specific resource `GET disk-server/hypotheses/{id}`
 - Edit specific resource `PUT disk-server/hypotheses/{id}`
 - Create a new resource `POST disk-server/hypotheses`

With the following json schema:

```json
{
    "id":string,
    "name":string,
    "description":string,
    "dateCreated":timestamp,
    "dateModified":timestamp,
    "author":string (email),
    "notes":string,
    "parentId":string,
    "question":string (QuestionURI),
    "questionBindings":[
        {
            "variable":string (VariableURI),
            "binding":string (value),
            "collection":boolean
        },
        ... 
    ],
    "graph":{
        "triples":[
            {
                "subject":string (subject URI),
                "predicate":string (subject URI),
                "object":{
                    "type":string (LITERAL or URI),
                    "value":string (value),
                    "datatype":string (datatype if LITERAL)
                }
            },
            ...
        ]
    }
}
```

## Line of Inquiry

Lines of inquiry represents a method to get data and solve a type of question

 - List resources: `GET disk-server/lois`
 - Get specific resource `GET disk-server/lois/{id}`
 - Edit specific resource `PUT disk-server/lois/{id}`
 - Create a new resource `POST disk-server/lois`

With the following json schema:

```json
{
    "id":string,
    "name":string,
    "description":string,
    "hypothesisQuery":string,
    "dataQuery":string,
    "notes":string,
    "author":string,
    "dateCreated":timestamp,
    "dateModified":timestamp,
    "relevantVariables":string,
    "explanation":string,
    "dataSource":string,
    "question":string (question URI),
    "workflows":[
        {
            "workflow":string,
            "workflowLink":string,
            "bindings":[
                {
                    "variable":string,
                    "binding":string,
                    "collection":boolean
                },
                ...
            ],"parameters":[
                {
                    "variable":string,
                    "binding":string,
                    "collection":boolean
                },
                ...
            ],
            "optionalParameters":[
                {
                    "variable":string,
                    "binding":string,
                    "collection":boolean
                },
                ...
            ],
            "run":{
                "id":string,
                "link":string,
                "status":string,
                "outputs":string[],
                "files":string[],
                "startDate":timestamp,
                "endDate":timestamp
            }
        }
    ],
    "metaWorkflows":[same as workflow]
}
```

## Triggered Line of Inquiry

A Triggered Line of Inquiry represents the execution of a Line of Inquiry that matches a hypothesis.

 - List resources: `GET disk-server/lois`
 - Get specific resource `GET disk-server/lois/{id}`
 - Edit specific resource `PUT disk-server/lois/{id}`
 - Create a new resource `POST disk-server/lois`

With the following json schema:

```json
{
    "id":string,
    "name":string,
    "description":string,
    "status":string,
    "loiId":string,
    "parentHypothesisId":string,
    "resultingHypothesisIds":string[],
    "author":string,
    "notes":string,
    "dateCreated":timestamp,
    "dateModified":timestamp,
    "dataQuery":string,
    "relevantVariables":string,
    "explanation":string,
    "dataSource":string,
    "workflows":[
        {
            "workflow":string,
            "workflowLink":string,
            "bindings":[
                {
                    "variable":string,
                    "binding":string,
                    "collection":boolean
                },
                ...
            ],
            "parameters":[
                {
                    "variable":string,
                    "binding":string,
                    "collection":boolean
                },
                ...
            ],
            "optionalParameters":[
                {
                    "variable":string,
                    "binding":string,
                    "collection":boolean
                },
                ...
            ],
            "run":{
                "id":string,
                "link":string,
                "status":string,
                "outputs":string[],
                "files":string[],
                "startDate":timestamp,
                "endDate":timestamp
            }
        }
    ],
    "metaWorkflows":Workflow[],
    "inputFiles":string[],
    "outputFiles":string[],
    "confidenceValue":double
}
```