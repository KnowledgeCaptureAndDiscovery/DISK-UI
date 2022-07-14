#  Scientific Questions Ontology

The Scientific Questions Ontology aims to help users on the creation of semantic representations for scientific questions (hypothesis).

The ontology defines the `Question` resource with the following properties:

 - `hasQuestionTemplate`: Text representation of the question. Includes `SPARQL` variable names that will be replaced for appropriate options.
 
 - `hasQuestionPattern`: `SPARQL` like pattern that defines the semantic representation of this *Question*.
 
 - `hasQuestionVariable`: list of `QuestionVariable` for this *Question*. These appear as `SPARQL` variables on the template and pattern.
 
and the `QuestionVariable` resource:
 
 - `hasVariableName`: `SPARQL` name of this variable. Is used on the question pattern and template.
 
 - `hasConstraints`: `SPARQL` query that will determine the options for this variable.
 
 - `hasFixedOptions`: list of fixed options for this variable, use this or `hasConstraints`.

As each question defines a "part" of a `SPARQL` query, we can compose multiple simple questions to create complex ones.
