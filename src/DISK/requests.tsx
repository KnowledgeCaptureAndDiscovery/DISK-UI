import { Triple, VariableBinding, Workflow } from "./interfaces";

export interface HypothesisRequest { 
    // Mandatory
    name:               string,
    description:        string,
    question:           string,
    questionBindings:   VariableBinding[],
    // Optional
    id?:                string,
    notes?:             string,
    // Could be generated server side.
    author?:            string,
    graph: {
        triples:        Triple[]
    }
    dateCreated?:       string,
    dateModified?:      string | null,
}

export interface LineOfInquiryRequest {
    // Mandatory
    name:               string,
    description:        string,
    dataQuery:          string,
    question:           string,
    dataSource:         string,
    // Optional
    id?:                string,
    notes?:             string,
    workflows?:         Workflow[],
    metaworkflows?:     Workflow[],
    relevantVariables?: string,
    explanation?:       string,
    hypothesisQuery?:   string, //should be the question id?
    // Could be generated server side.
    author?:            string,
    dateCreated?:       string,
    dateModified?:      string | null,
}

export {}