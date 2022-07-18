#  Scientific Questions Ontology

The DISK Scientific Questions Ontology provides the vocabulary to create semantic representations for scientific hypothesis or questions.

The ontology defines the `Question` class, with the following properties:

 - `hasQuestionTemplate`: A brief text statement of the question. Includes Question Variables that will be replaced with domain concepts to create specific questions.
 
 - `hasQuestionPattern`: `SPARQL` like pattern that defines the semantic representation of this *Question*.
 
 - `hasQuestionVariable`: list of `QuestionVariable` for this *Question*. These appear as `SPARQL` variables on the template and pattern.
 
and the `QuestionVariable` resource:
 
 - `hasVariableName`: `SPARQL` name of this variable. Is used on the question pattern and template.
 
 - `hasConstraints`: `SPARQL` query that will determine the options for this variable.
 
 - `hasFixedOptions`: list of fixed options for this variable, use this or `hasConstraints`.

As each question defines a "part" of a `SPARQL` query, we can compose multiple simple questions to create complex ones.
