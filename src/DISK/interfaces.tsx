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
    status: 'QUEUED' | 'RUNNING' | 'FAILED' | 'SUCCESSFUL',
    outputs: {[name:string] :string},
    files: {[name:string] :string},
    startDate: string,
    endDate: string
}

export interface MetaInfo {
     //
}

export interface Workflow {
    source: string,
    description: string | null,
    workflow: string, //Same as method id
    workflowLink: string,
    bindings: VariableBinding[],
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
    parentLoiId: string,
    parentHypothesisId: string,
    workflows: Workflow[],
    metaWorkflows: Workflow[],
    dataQuery: string,
    notes: string,
    author: string,
    dateCreated: string,
    dateModified: string,
    tableVariables: string,
    tableDescription: string,
    dataQueryExplanation: string,
    dataSource: string,
    // All of these are workflow-run related.
    confidenceValue: number,
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

export interface VocabularyEntity {
    id: string,
    name: string,
    label: string,
    description: string,
}

export interface VocabularyType extends VocabularyEntity {
    parent: string | null,
    children: string[]
}

export interface VocabularyProperty  extends VocabularyEntity{
    domain: string | null,
    range: string | null,
}

export interface VocabularyIndividual  extends VocabularyEntity{
    type: string,
}

export interface Vocabulary {
    namespace: string,
    prefix: string,
    title: string,
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
    prefixResolution: string,
    description: string;
}

const _names = {}


export default _names;