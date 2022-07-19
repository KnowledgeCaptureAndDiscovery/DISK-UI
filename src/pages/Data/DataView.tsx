import { Box, Typography, Skeleton, Card, Button, Divider } from "@mui/material"
import { DataEndpoint } from "DISK/interfaces";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { loadDataEndpoints } from "redux/loader";
import { RootState } from "redux/store";
import StorageIcon from '@mui/icons-material/Storage';
import { renderDescription } from "DISK/util";
import { QueryTester } from "components/QueryTester";

export const DataView = () => {
    const dispatch = useAppDispatch();
    const endpoints : DataEndpoint[] = useAppSelector((state:RootState) => state.server.endpoints);
    const loadingEndpoints : boolean = useAppSelector((state:RootState) => state.server.loadingEndpoints);
    const initEndpoints : boolean    = useAppSelector((state:RootState) => state.server.initializedEndpoints);

    useEffect(() => {
        if (!initEndpoints)
            loadDataEndpoints(dispatch);
    }, []);

    return <Box>
        <Typography variant="h5">Data sources:</Typography>
        <Typography>
            The DISK System can read information stored on the following systems:
        </Typography>
        {loadingEndpoints ? 
            <Skeleton/>
            : (endpoints.map((d:DataEndpoint) => 
            <Card variant="outlined" sx={{mb:"5px",p: "0 5px"}} key={`data_${d.url}`}>
                <Box sx={{display:'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Box sx={{display:'flex', alignItems: 'center'}}>
                        <StorageIcon  sx={{color: 'blue', mr: "5px"}}/>
                        <Typography variant="h6">
                            {d.name}
                        </Typography>
                    </Box>
                    <QueryTester name="Query" initSource={d.url} initQuery={"SELECT ?a ?b ?c {\n  ?a ?b ?c .\n} LIMIT 10"}/>
                </Box>
                <Divider/>
                <Typography>
                    {renderDescription(d.description)}
                </Typography>

                {false && d.prefix && d.namespace && <Typography sx={{fontFamily: "monospace"}}>
                    PREFIX {d.prefix}: &lt;{d.namespace}&gt;
                </Typography>}

            </Card> ))
        }
    </Box>
}
