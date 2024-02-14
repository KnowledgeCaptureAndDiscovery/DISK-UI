//export const idPattern = new RegExp(/.*\//); 
export const varPattern = new RegExp(/(\?[a-zA-Z0-9]*)/g);

type ObjectWithId = { id:string };

export interface DISKResource {
    id:             string;
    name:           string;
    description:    string;
    dateCreated?:   string;
    dateModified?:  string;
    notes:          string;
    author?:        Entity;
}
  
export interface Entity {
    name: string;
    email: string;
    id: string;
}

export interface Goal extends DISKResource {
    question: Question | ObjectWithId;
    questionBindings: VariableBinding[];
    graph: Graph;
}

export interface Graph {
    triples: Triple[]
}

export interface VariableBinding { /// variable = binding
    variable:   string;
    binding:    string[];
    type:       BindingType;
    isArray:    boolean;
    datatype?:  string;
}

type InputType = 'DEFAULT' | 'FREEFORM' | 'DATA_QUERY' | 'QUERY_VARIABLE' | 'WORKFLOW_VARIABLE' | 'DISK_DATA';
type OutputType = 'DROP' | 'SAVE' | 'PROCESS';
type BindingType = InputType | OutputType;

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

export interface LineOfInquiry extends DISKResource {
    updateCondition:    number;
    goalQuery:          string;
    question:           Question | ObjectWithId;
    dataQueryTemplate?: DataQueryTemplate;
    workflowSeeds:      WorkflowSeed[];
    metaWorkflowSeeds:  WorkflowSeed[];
}

export interface DataQueryTemplate {
    endpoint:           Endpoint | (Partial<Endpoint> & Pick<Endpoint, 'id'>);
    template:           string;
    description:        string;
    variablesToShow:    string;
    footnote:           string;
}

export interface Endpoint {
    name:   string;
    url:    string;
    id:     string;
}

export interface WorkflowSeed {
    id:             string;
    link:           string;
    description:    string;
    source:         Endpoint;
    parameters:     VariableBinding[];
    inputs:         VariableBinding[];
}

export interface TriggeredLineOfInquiry extends LineOfInquiry{
    status:         Status;
    parentLoi:      LineOfInquiry;
    parentGoal:     Goal;
    queryResults:   DataQueryResult;
    workflows:      WorkflowInstantiation[];
    metaWorkflows:  WorkflowInstantiation[];
}

export type Status = 'QUEUED' | 'RUNNING' | 'FAILED' | 'SUCCESSFUL' | 'PENDING';

export interface DataQueryResult extends DataQueryTemplate {
    query:      string;
    results:    string;
}

export interface WorkflowInstantiation extends WorkflowSeed {
    status:         Status;
    dataBindings:   VariableBinding[] ;
    executions:     Execution[];
}

export interface Execution extends ExecutionRecord {
    externalId:     string ;
    result:         GoalResult ;
    steps:          ExecutionRecord ;
    inputs:         VariableBinding;
    outputs:        VariableBinding;

}

export interface GoalResult {
    confidenceType:     string;
    confidenceValue:    string;
}

export interface ExecutionRecord {
    log:        string;
    startDate:  string;
    endDate:    string;
    status:     Status;
}

// UNTESTED BELOW


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
    url:                string,
    name:               string,
    prefix:             string,
    namespace:          string,
    prefixResolution:   string,
    description:        string;
    id:                 string;
}

export interface QuestionOptionsRequest {
    id:         string,
    bindings:   MultiValueAssignation,
}

export type MultiValueAssignation = {
    [name:string] : string[]
}

const _names = {}

export default _names;