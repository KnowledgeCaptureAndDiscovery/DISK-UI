#  Scientific Questions Ontology

The DISK Scientific Questions Ontology provides a vocabulary to create semantic representations for scientific hypothesis or questions.

The ontology defines the `Question` class, with the following properties:

 - `hasQuestionTemplate`: A brief text statement of the question. Includes Question Variables that will be replaced with domain concepts to create specific questions.
 
 - `hasQuestionPattern`: `SPARQL` like semantic representation of this *Question*, placing Question Variables within the Question Template.
 
 - `hasQuestionVariable`: list of `QuestionVariable` for this *Question template*. These appear as `SPARQL` variables on the Question Pattern.
 
The `QuestionVariable` class has the following properties:
 
 - `hasVariableName`: `SPARQL` name of this variable. It is used on the Question Pattern.
 
 - `hasConstraints`: `SPARQL` query that will determine any restrictions for this variable.
 
 - `hasFixedOptions`: list of possible values for this variable.  This is an alternative to specifying `hasConstraints`.

Since each question corresponds to a portion of a `SPARQL` query, multiple questions can be composed to create more complex ones.
