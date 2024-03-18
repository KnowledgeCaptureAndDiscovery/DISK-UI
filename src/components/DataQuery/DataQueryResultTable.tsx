import { DataQueryResult } from "DISK/interfaces";
import { SimpleTable } from "components/SimpleTable";
import { useEffect, useState } from "react";

interface DataQueryResultTableProps {
    result: DataQueryResult
}

export const DataQueryResultTable = ({result}:DataQueryResultTableProps) => {
    console.log(result.variablesToShow);
    const [csv, setCSV] = useState<{[varName: string]: string[]}>({});

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
                            csvMap[indexToName[i]].push(cells[i]);
                        }
                    }
                }
            }
            console.log(csvMap);
            setCSV(csvMap);
            //FIXME:  we are missing some variables of the query here, we need to fix it server side.
        } else {
            setCSV({});
        }
    }, [result])

    if (Object.keys(csv).length === 0)
        return <></>;
    
    return <SimpleTable data={csv}/>
}