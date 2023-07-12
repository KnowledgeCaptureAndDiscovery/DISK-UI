export const idPattern = new RegExp(/.*\//); 
export const varPattern = new RegExp(/(\?[a-zA-Z0-9]*)/g);

export interface Hypothesis {
    id:               string,
    name:             string,
    description:      string,
    author:           string,
    notes?:           string,
    dateCreated?:     string,
    dateModified?:    string,
    questionId?:        string,
    parentId?:        string, //Parent hypothesis ID
    questionBindings: VariableBinding[],
    graph?: {
        triples: Triple[]
    }
}

export interface VariableBinding { /// variable = binding
    variable:   string,
    binding:    string,
    type:       string|null,
    collection?: boolean,
}

export interface Triple {
    subject:    string,
    predicate:  string, 
    object: {
        type:       'LITERAL' | 'URI',
        value:      string, //FIXME: this is an Object in the server, maybe can return a Date, not sure.
        datatype?:  string,
    }
}

export interface Question {
    id:         string,
    name:       string,
    template:   string,
    constraint: string,
    pattern:    Triple[],
    category:   QuestionCategory | null,
    variables:  AnyQuestionVariable[],
}

export interface QuestionCategory {
    id:     string,
    name:   string,
}

export type QuestionVariable = {
    id:                 string,
    variableName:       string,
    minCardinality:     number,
    maxCardinality:     number,
    representation:     string | null,
    explanation:        string | null,
    patternFragment:    Triple[]
}

export type UserInputQuestionVariable = {
    subType: 'USER_INPUT',
    inputDatatype: string
} & QuestionVariable;

export type DynamicOptionsQuestionVariable = {
    subType: 'DYNAMIC_OPTIONS',
    optionsQuery: string
} & QuestionVariable;

export type StaticOptionsQuestionVariable = {
    subType: 'STATIC_OPTIONS',
    options: VariableOption[]
} & QuestionVariable;

export type BoundingBoxQuestionVariable = {
    subType: 'BOUNDING_BOX',
    optionsQuery: string
    minLat: UserInputQuestionVariable,
    minLng: UserInputQuestionVariable,
    maxLat: UserInputQuestionVariable,
    maxLng: UserInputQuestionVariable
} & QuestionVariable;

export type TimeIntervalQuestionVariable = {
    subType: 'TIME_INTERVAL',
    optionsQuery: string
    startTime: UserInputQuestionVariable,
    endTime: UserInputQuestionVariable,
    timeType: StaticOptionsQuestionVariable
} & QuestionVariable;

export type AnyQuestionVariable = UserInputQuestionVariable | DynamicOptionsQuestionVariable | StaticOptionsQuestionVariable | BoundingBoxQuestionVariable | TimeIntervalQuestionVariable;

export interface VariableOption {
    value:  string,
    label:  string,
    commnet: string | null,
}

export interface ExecutionInfo {
    status:  'QUEUED' | 'RUNNING' | 'FAILED' | 'SUCCESSFUL' | 'PENDING';
    startTime: string,
    endTime: string
    log: string,
}

export interface RunBinding {
    id: string | null,
    datatype: string | null,
    value: string | null,
    type: 'URI' | 'LITERAL',
}

export interface WorkflowRun {
    id: string,
    link: string,
    outputs: {[name:string]: RunBinding},
    inputs: {[name:string]: RunBinding},
    executionInfo: ExecutionInfo;
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
    runs?: {
        [uri:string]: WorkflowRun
    },
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
    questionId: string,
    updateCondition: number,
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
    queryResults: string,
    // All of these are workflow-run related.
    confidenceValue: number,
    confidenceType: string,
}


export interface MethodVariables {
    name: string,
    type: string[],
    dimensionality: number,
    param: boolean,
    input: boolean,
    output: boolean
}

export interface Method {
    id?: string,
    name: string,
    link: string,
    source: string,
    inputs?: MethodVariables[]
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

export interface QuestionOptionsRequest {
    id:         string,
    bindings:   {[name:string] : string};
}

const _names = {}

export default _names;