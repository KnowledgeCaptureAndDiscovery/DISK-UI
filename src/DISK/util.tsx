import { url } from "inspector";
import { DISKAPI } from "./API";
import { LineOfInquiry, TriggeredLineOfInquiry, Workflow } from "./interfaces";
import { LineOfInquiryRequest } from "./requests";

const RE_LINKS = /\[(.*?)\]\((.*?)\)/g;

export const renderDescription = (text:string) => {
    return text.replaceAll(RE_LINKS, '<a target="_blank" href="$2">$1</a>');
}

export const downloadFile = (source:string, fileId:string, name:string) => {
    DISKAPI.getData(source, fileId)
            .then((r:string) => {
                let element = document.createElement('a');

                let datatype = "text/plain;charset=utf-8,";
                if (r[0] === '[' || r[0] === '{') {
                    datatype = "text/json;charset=utf-8,";
                } else {
                    if (r.startsWith("%PDF")) {
                        //var blob=new Blob([data]);
                        datatype = "application/pdf;charset=utf-8,";
                    }
                }
                element.setAttribute('href', 'data:' + datatype + encodeURIComponent(r));
                element.setAttribute('download', name);
                
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            });
}

export const cleanLOI : (loi:LineOfInquiry) => LineOfInquiry = (loi:LineOfInquiry) => {
    return { 
        ...loi,
        workflows: loi.workflows.map(cleanWorkflow),
        metaWorkflows: loi.metaWorkflows.map(cleanWorkflow)
    };
}

export const cleanWorkflow : (wf:Workflow) => Workflow = (wf) => {
    return {
        ...wf,
        bindings: wf.bindings.map(b => {return {
            ...b,
            collection: undefined,
            bindingAsArray: undefined,
        }}),
    }
}