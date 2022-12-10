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

    // HYPOTHESES
    //=======================
    public static async getDynamicOptions (cfg:QuestionOptionsRequest) : Promise<{[name:string]:VariableOption[]}> {
        return await DISKAPI.post(DISKAPI.url + "question/options", cfg) as {[name:string]:VariableOption[]};
    }

    // OTHER STUFF
    //=======================
    public static async getData (dataSource:string, dataId:string) : Promise<string> {
        return await DISKAPI.post(DISKAPI.url + "getData", {'source': dataSource, 'dataId': dataId.replace(/.*#/,"")}, true) as string;
    }

    public static async getPublic (path:string) : Promise<string> {
        return await DISKAPI.get("https://s3.mint.isi.edu/neurodisk/" + path, true) as string;
    }
}