export interface Hypothesis {
    id:               string,
    name:             string,
    description:      string,
    author:           string,
    notes?:           string,
    dateCreated?:     string,
    dateModified?:    string,
    question?:        string, //Should be question ID
    parentId?:        string, //Parent hypothesis ID
    questionBindings: QuestionBinding[],
    graph?: {
        triples: Triple[]
    }
}

export interface QuestionBinding {
    variable:   string,
    binding:    string,
    collection: boolean,
}

export interface Triple {
    details:    string,
    subject:    string,
    predicate:  string, 
    object: {
        type:       'LITERAL' | 'URI',
        value:      string,
        datatype?:  string,
    }
}

export default {};