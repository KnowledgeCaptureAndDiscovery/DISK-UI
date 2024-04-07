import { Card, FormHelperText, TableContainer, Table, TableBody, TableRow, TableCell } from "@mui/material"
import { Question, Triple } from "DISK/interfaces"
import { getId } from "DISK/util";

const displayURI = (uri: string) => {
    if (uri.startsWith("http") || uri.startsWith("www"))
        uri = getId({id:uri})

    //WIKI Specific 
    if (uri.startsWith("Property-3A"))
        uri = uri.replace("Property-3A", "").replace("-28E-29", "");

    uri = uri.replaceAll("_", "");
    return uri.replaceAll(/.*?#/g, '');
}

const displayObj = (obj: Triple["object"]) => {
    return obj.type === 'URI' ? displayURI(obj.value) : obj.value;
}


interface FormalExpressionViewProps {
    triplePattern: Triple[],
    question: Question | null,
}
export const FormalExpressionView = ({triplePattern, question}:FormalExpressionViewProps) => {
    return <Card variant="outlined" sx={{mt: "8px", p: "0px 10px 10px;", position:"relative", overflow:"visible"}}>
        <FormHelperText sx={{position: 'absolute', background: 'white', padding: '0 4px', margin: '-9px 0 0 0'}}> Formal expression: </FormHelperText>
        <TableContainer sx={{mt:"6px", fontFamily:"monospace", display: "flex", justifyContent: "center"}}>
            <Table aria-label="Hypothesis graph" sx={{width: "auto"}}>
                <TableBody>
                    {triplePattern.map((triple:Triple, index:number) => <TableRow key={`row_${index}`}>
                        <TableCell sx={{padding: "2px 10px"}}> {triple.subject ? displayURI(triple.subject) : ":effectSize" } </TableCell>
                        <TableCell sx={{padding: "2px 10px"}}> {displayURI(triple.predicate)} </TableCell>
                        <TableCell sx={{padding: "2px 10px"}}> {displayObj(triple.object)} </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>
    </Card>
}