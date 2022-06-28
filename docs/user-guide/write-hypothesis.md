# Writing Semantic hypothesis

The disk system stores hypotheses as semantic graphs (RDF).
This representation allow us to register any kind of information and can be extended with the use of external ontologies.

For example, a simple hypothesis like *is A associated with B* is stored as `:A hypothesis:associatedWith :B`.
In this case we are creating two resources that this hypothesis will use (`:A` and `:B`) and linked them together with `associatedWith` from the DISK-Hypothesis ontology.

We could specify the type of each resource to better match the available LOIs:

```
:A hypothesis:associatedWith :B .
:A rdf:type ont:someType .
:B rdf:type ont:otherType .
```

As we can see, this approach can be extended to represent any kind of information with the use of different ontologies.
The main tradeoff is the difficulty of creating such semantic graphs.

To make this process easier we have created the Question Template Ontology and some UI helpers.
You can read an explanation of how this kind of hypothesis are generated [here](/question-ontology) and see a complete list of the ontologies DISK uses [here](/ontology).
