# Ontologies Overview

## What is a ontology?

Ontology is a term borrowed from philosophy that refers to the science of describing 
the kinds of entities in the world and how they are related. 
An OWL ontology may include descriptions of classes, properties and their instances.


## Disk Ontologies

The DISK system uses several ontologies to store and produce data.
However, we are going to focus on only one ontology: Question Template Ontology. 
 
 **Question Template:** Ontology to help on the creation of hypothesis, defines *Hypothesis Questions* and how to customize them. 


### Question Template Ontology


The question ontology aims to help users on the creation of semantic representations for scientific questions (hypothesis).

The ontology defines the `Question` resource with the following properties:

 - `hasQuestionTemplate`: Text representation of the question. Includes `SPARQL` variable names that will be replaced for appropriate options.
 
 - `hasQuestionPattern`: `SPARQL` like pattern that defines the semantic representation of this *Question*.
 
 - `hasQuestionVariable`: list of `QuestionVariable` for this *Question*. These appear as `SPARQL` variables on the template and pattern.
 
and the `QuestionVariable` resource:
 
 - `hasVariableName`: `SPARQL` name of this variable. Is used on the question pattern and template.
 
 - `hasConstraints`: `SPARQL` query that will determine the options for this variable.
 
 - `hasFixedOptions`: list of fixed options for this variable, use this or `hasConstraints`.

As each question defines a "part" of a `SPARQL` query, we can compose multiple simple questions to create complex ones.
