import { Hypothesis, LineOfInquiry, Method, MethodInput, Question, TriggeredLineOfInquiry } from "./interfaces";

export class DISKAPI {
    //private static url : string = "http://localhost:9090/disk-project-server/";
    private static url : string = "http://localhost:8080/disk-project-server-2.5.2/";


    private static async get (url:string) : Promise<any> {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                //"Authorization": `Bearer ${token}`,
            }
        });

        if (!response.ok) 
            throw new Error(response.statusText);
        return response.json();
    }

    public static async getHypotheses (username?:string) : Promise<Hypothesis[]> {
        return await DISKAPI.get(DISKAPI.url + "hypotheses") as Hypothesis[];
    }

    public static async getHypothesis (id:string, username?:string) : Promise<Hypothesis> {
        return await DISKAPI.get(DISKAPI.url + "hypotheses/" + id) as Hypothesis;
    }

    public static async getQuestions (username?:string) : Promise<Question[]> {
        return await DISKAPI.get(DISKAPI.url + "questions") as Question[];
    }

    public static async getVariableOptions (id:string, username?:string) : Promise<string[][]> {
        return await DISKAPI.get(DISKAPI.url + "question/" + id + "/options") as string[][];
    }

    public static async getLOIs (username?:string) : Promise<LineOfInquiry[]> {
        return await DISKAPI.get(DISKAPI.url + "lois") as LineOfInquiry[];
    }

    public static async getLOI (id:string, username?:string) : Promise<LineOfInquiry> {
        return await DISKAPI.get(DISKAPI.url + "lois/" + id) as LineOfInquiry;
    }

    public static async getTLOIs (username?:string) : Promise<TriggeredLineOfInquiry[]> {
        return await DISKAPI.get(DISKAPI.url + "tlois") as TriggeredLineOfInquiry[];
    }

    public static async getTLOI (id:string, username?:string) : Promise<TriggeredLineOfInquiry> {
        return await DISKAPI.get(DISKAPI.url + "tlois/" + id) as TriggeredLineOfInquiry;
    }

    public static async getEndpoints () : Promise<{[name:string] : string }> {
        return await DISKAPI.get(DISKAPI.url + "server/endpoints") as {[name:string] : string };
    }

    public static async getWorkflows () : Promise<Method[]> {
        return await DISKAPI.get(DISKAPI.url + "workflows") as Method[];
    }

    public static async getWorkflowVariables (id:string) : Promise<MethodInput[]>{
        let inputsRaw = await DISKAPI.get(DISKAPI.url + "workflows/" + id);
        let inputs : MethodInput[] = inputsRaw.map((i:any) => {return {
            name: i.name,
            type: i["input"] ? "input" : (i["param"] ? "parameter" : "none"),
        }})
        console.log(inputs);
        return inputs;
    }
}