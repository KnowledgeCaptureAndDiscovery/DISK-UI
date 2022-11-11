import { DataEndpoint, Hypothesis, LineOfInquiry, Method, MethodInput, Question, QuestionOptionsRequest, TriggeredLineOfInquiry, VariableOption, Vocabularies } from "./interfaces";
import { HypothesisRequest, LineOfInquiryRequest } from "./requests";
import { REACT_APP_DISK_API }  from "../config";
import { cleanLOI, cleanTLOI } from "./util";

export class DISKAPI {
    private static url : string = REACT_APP_DISK_API;
    private static headers : RequestInit["headers"] = {
        "Content-Type": "application/json;charset=UTF-8",
    };

    public static setToken (tkn:string) {
        if (tkn) {
            DISKAPI.headers = {
                "Content-Type": "application/json;charset=UTF-8",
                "Authorization": `Bearer ${tkn}`,
            }
        } else {
            DISKAPI.headers = {
                "Content-Type": "application/json;charset=UTF-8",
            }
        }
    }

    private static async get (url:string, asText:boolean=false) : Promise<any> {
        const response = await fetch(url, {
            method: "GET",
            headers: DISKAPI.headers,
        });

        if (!response.ok) 
            throw new Error(response.statusText);
        return asText ? response.text() : response.json();
    }

    private static async post (url:string, obj:any, asText:boolean=false) : Promise<any> {
        const response = await fetch(url, {
            method: 'POST',
            headers: DISKAPI.headers,
            body: JSON.stringify(obj),
        });
        if (!response.ok) 
            throw new Error(response.statusText);
        return asText ? response.text() : response.json();
    }

    private static async put (url:string, obj:any) : Promise<any> {
        const response = await fetch(url, {
            method: 'PUT',
            headers: DISKAPI.headers,
            body: JSON.stringify(obj),
        });
        if (!response.ok) 
            throw new Error(response.statusText);
        return response.json();
    }

    private static async delete (url:string) : Promise<boolean> {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: DISKAPI.headers,
        });
        if (!response.ok) 
            throw new Error(response.statusText);
        return true;
    }

    // HYPOTHESES
    //=======================

    public static async getHypotheses () : Promise<Hypothesis[]> {
        return await DISKAPI.get(DISKAPI.url + "hypotheses") as Hypothesis[];
    }

    public static async createHypothesis (hypothesis:Hypothesis|HypothesisRequest) : Promise<Hypothesis> {
        return await DISKAPI.post(DISKAPI.url + "hypotheses", hypothesis) as Hypothesis;
    }

    public static async getHypothesis (id:string) : Promise<Hypothesis> {
        return await DISKAPI.get(DISKAPI.url + "hypotheses/" + id) as Hypothesis;
    }

    public static async updateHypothesis (hypothesis:Hypothesis|HypothesisRequest) : Promise<Hypothesis> {
        return await DISKAPI.put(DISKAPI.url + "hypotheses/" + hypothesis.id, hypothesis) as Hypothesis;
    }

    public static async deleteHypothesis (hypothesisId:string) : Promise<boolean> {
        return await DISKAPI.delete(DISKAPI.url + "hypotheses/" + hypothesisId) as boolean;
    }

    public static async queryHypothesis (hypothesisId:string) : Promise<TriggeredLineOfInquiry[]> {
        return await DISKAPI.get(DISKAPI.url + "hypotheses/" + hypothesisId + '/query') as TriggeredLineOfInquiry[];
    }

    // QUESTIONS
    //=======================
    public static async getQuestions (username?:string) : Promise<Question[]> {
        const question =  await DISKAPI.get(DISKAPI.url + "questions") as Question[];
        return question.map(q => { 
            q.name = q.name.endsWith('?') ? q.name : `${q.name}?`;
            return q; 
        });
    }

    public static async getVariableOptions (id:string, username?:string) : Promise<VariableOption[]> {
        return await DISKAPI.get(DISKAPI.url + "question/" + id + "/options") as VariableOption[];
    }

    public static async getDynamicOptions (cfg:QuestionOptionsRequest) : Promise<{[name:string]:VariableOption[]}> {
        return await DISKAPI.post(DISKAPI.url + "question/options", cfg) as {[name:string]:VariableOption[]};
    }

    // LINES OF INQUIRY
    //=======================

    public static async getLOIs (username?:string) : Promise<LineOfInquiry[]> {
        return await DISKAPI.get(DISKAPI.url + "lois") as LineOfInquiry[];
    }

    public static async createLOI (loi:LineOfInquiry) : Promise<LineOfInquiry> {
        return await DISKAPI.post(DISKAPI.url + "lois", cleanLOI(loi)) as LineOfInquiry;
    }

    public static async getLOI (id:string, username?:string) : Promise<LineOfInquiry> {
        return await DISKAPI.get(DISKAPI.url + "lois/" + id) as LineOfInquiry;
    }

    public static async updateLOI (loi:LineOfInquiry) : Promise<LineOfInquiry> {
        return await DISKAPI.put(DISKAPI.url + "lois/" + loi.id, cleanLOI(loi)) as LineOfInquiry;
    }

    public static async deleteLOI (id:string) : Promise<boolean> {
        return await DISKAPI.delete(DISKAPI.url + "lois/" + id) as boolean;
    }

    // TRIGGERED LINES OF INQUIRY
    //=======================

    public static async getTLOIs (username?:string) : Promise<TriggeredLineOfInquiry[]> {
        return await DISKAPI.get(DISKAPI.url + "tlois") as TriggeredLineOfInquiry[]
    }

    public static async getTLOI (id:string, username?:string) : Promise<TriggeredLineOfInquiry> {
        return await DISKAPI.get(DISKAPI.url + "tlois/" + id) as TriggeredLineOfInquiry;
    }

    public static async deleteTLOI (id:string) : Promise<boolean> {
        return await DISKAPI.delete(DISKAPI.url + "tlois/" + id) as boolean;
    }

    public static async createTLOI (tloi:TriggeredLineOfInquiry) : Promise<TriggeredLineOfInquiry> {
        return await DISKAPI.post(DISKAPI.url + "tlois", cleanTLOI(tloi)) as TriggeredLineOfInquiry;
    }

    public static async updateTLOI (tloi:TriggeredLineOfInquiry) : Promise<TriggeredLineOfInquiry> {
        return await DISKAPI.put(DISKAPI.url + "tlois/" + tloi.id, cleanTLOI(tloi)) as TriggeredLineOfInquiry;
    }

    // OTHER STUFF
    //=======================

    public static async getEndpoints () : Promise<DataEndpoint[]> {
        return await DISKAPI.get(DISKAPI.url + "server/endpoints") as DataEndpoint[];
    }

    public static async getWorkflows () : Promise<Method[]> {
        return await DISKAPI.get(DISKAPI.url + "workflows") as Method[];
    }

    public static async getWorkflowVariables (source:string, id:string) : Promise<MethodInput[]>{
        return await DISKAPI.get(DISKAPI.url + "workflows/" + source + "/" + id) as MethodInput[];
    }

    public static async testQuery (dataSource:string, query:string, variables:string[]) : Promise<{[varName:string] : string[]}> {
        return await DISKAPI.get(DISKAPI.url + "externalQuery?" + new URLSearchParams({
            endpoint: dataSource,
            query: query,
            variables: variables.length === 0 ? "*" : variables.join(" ")
        })) as {[varName:string] : string[]};
    }

    public static async getVocabulary () : Promise<Vocabularies> {
        return await DISKAPI.get(DISKAPI.url + "vocabulary") as Vocabularies;
    }

    public static async getData (dataSource:string, dataId:string) : Promise<string> {
        return await DISKAPI.post(DISKAPI.url + "getData", {'source': dataSource, 'dataId': dataId.replace(/.*#/,"")}, true) as string;
    }

    public static async getPublic (path:string) : Promise<string> {
        return await DISKAPI.get("https://s3.mint.isi.edu/neurodisk/" + path, true) as string;
    }
}