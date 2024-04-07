import { DataQueryResult } from "DISK/interfaces";
import { SimpleTable } from "components/SimpleTable";
import { useEffect, useState } from "react";
import { useGetEndpointsQuery, useGetVocabulariesQuery } from "redux/apis/server";

interface DataQueryResultTableProps {
    result: DataQueryResult
}

export const DataQueryResultTable = ({result}:DataQueryResultTableProps) => {
    const [csv, setCSV] = useState<{[varName: string]: string[]}>({});
    const {data:endpoints, isLoading:loadingEndpoints} = useGetEndpointsQuery();

    useEffect(() => {
        if (result.results && result.variablesToShow && result.variablesToShow.length > 0) {
            let lines = result.results.split('\n');
            let header = true;
            let csvMap : {[varName: string]: string[]} = {};
            let indexToName : {[index:number]: string} = {};
            for (const line of lines) {
                let cells = line.split(/,\s*/);
                if (header) {
                    header = false;
                    for (let i = 0; i < cells.length; i++) {
                        if (result.variablesToShow.some(v => v === "?" + cells[i]) ) {
                            indexToName[i] = cells[i];
                            csvMap[cells[i]] = [];
                        }
                    }
                } else {
                    for (let i = 0; i < cells.length; i++) {
                        if (!!indexToName[i]) {
                            let toAdd = cells[i];
                            let source = (endpoints || []).find(e => e.url === result.endpoint.url);
                            if (source && source.namespace && source.prefixResolution) {
                                toAdd = toAdd.replaceAll(source.namespace, source.prefixResolution);
                            }
                            csvMap[indexToName[i]].push(toAdd);
                        }
                    }
                }
            }
            setCSV(csvMap);
        } else {
            setCSV({});
        }
    }, [result, endpoints])

    if (Object.keys(csv).length === 0)
        return <></>;
    
    return <SimpleTable data={csv}/>
}