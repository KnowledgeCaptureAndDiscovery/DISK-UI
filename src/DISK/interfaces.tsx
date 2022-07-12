export const idPattern = new RegExp(/.*\//); 
export const varPattern = new RegExp(/\?[a-zA-Z0-9]*/g);

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
    questionBindings: VariableBinding[],
    graph?: {
        triples: Triple[]
    }
}

export interface VariableBinding {
    variable:   string,
    binding:    string,
    collection?: boolean,
}

export interface Triple {
    details?:    string,
    subject:    string,
    predicate:  string, 
    object: {
        type:       'LITERAL' | 'URI',
        value:      string,
        datatype?:  string,
    }
}

export interface Question {
    id:         string,
    name:       string,
    template:   string,
    pattern:    string,
    variables:  QuestionVariable[],
}

export interface QuestionVariable {
    id:             string,
    constraints:    string,
    varName:        string,
    fixedOptions:   string,
}

export interface WorkflowRun {
    id: string,
    link: string,
    status: any,
    outputs: string[],
    files: string[],
    startDate: string,
    endDate: string
}

export interface MetaInfo {
     //
}

export interface Workflow {
    source: string,
    workflow: string, //Same as method id
    workflowLink: string,
    bindings: VariableBinding[],
    parameters: VariableBinding[],
    optionalParameters: VariableBinding[],
    run?: WorkflowRun,
    meta?: {
        hypothesis: MetaInfo,
        revisedHypothesis: MetaInfo,
    }
}

export interface LineOfInquiry {
    id: string,
    name: string,
    description: string,
    hypothesisQuery: string,
    dataQuery: string,
    workflows: Workflow[],
    metaWorkflows: Workflow[],
    notes: string,
    author: string,
    dateCreated: string,
    dateModified: string,
    tableVariables: string,
    tableDescription: string,
    dataQueryExplanation: string,
    dataSource: string,
    question: string,
}

export interface TriggeredLineOfInquiry {
    id: string,
    name: string,
    description: string,
    status: 'QUEUED' | 'RUNNING' | 'FAILED' | 'SUCCESSFUL',
    loiId: string,
    parentHypothesisId: string,
    resultingHypothesisIds: string[],
    workflows: Workflow[],
    metaworkflows: Workflow[],
    confidenceValue: number,
    inputFiles: string[],
    outputFiles: string[],
    dataQuery: string,
    notes: string,
    author: string,
    dateCreated: string,
    dateModified: string,
    tableVariables: string,
    tableDescription: string,
    dataQueryExplanation: string,
    dataSource: string,
}

export type MethodInputType = 'input' | 'parameter' | 'none' ;

export interface MethodInput {
    name: string,
    type: MethodInputType
}

export interface Method {
    id?: string,
    name: string,
    link: string,
    source: string,
    inputs?: MethodInput[]
}

export interface VocabularyType {
    id: string,
    name: string,
    label: string,
    parent: string | null,
    children: string[]
}

export interface VocabularyProperty {
    id: string,
    name: string,
    label: string,
    domain: string | null,
    range: string | null,
}

export interface VocabularyIndividual {
    id: string,
    name: string,
    label: string,
    type: string,
}

export interface Vocabulary {
    namespace: string,
    description?: string,
    types: {[uri:string]: VocabularyType},
    properties: {[uri:string]: VocabularyProperty},
    individuals: {[uri:string]: VocabularyIndividual},
}

export type Vocabularies = {[url:string]: Vocabulary};

export interface DataEndpoint {
    url:    string,
    name:   string,
    prefix: string,
    namespace: string,
    description: string;
}

const _names = {}


export default _names;