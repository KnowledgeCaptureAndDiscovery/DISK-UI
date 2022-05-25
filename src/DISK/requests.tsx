import { Triple, VariableBinding } from "./interfaces";

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

export {}