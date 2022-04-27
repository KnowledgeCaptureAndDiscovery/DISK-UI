import { Hypothesis, Question } from "./interfaces";

export class DISKAPI {
    private static url : string = "http://localhost:9090/disk-project-server/";


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
}