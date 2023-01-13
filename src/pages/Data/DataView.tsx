import { Box, Typography, Skeleton, Card, Divider } from "@mui/material"
import { DataEndpoint } from "DISK/interfaces";
import StorageIcon from '@mui/icons-material/Storage';
import { renderDescription } from "DISK/util";
import { QueryTester } from "components/QueryTester";
import { useGetEndpointsQuery } from "redux/apis/server";

export const DataView = () => {
    const {data:endpoints, isLoading:loadingEndpoints} = useGetEndpointsQuery();

    return <Box>
        <Typography variant="h5">Data sources:</Typography>
        <Typography>
            This DISK portal can access the data and information described in the following systems:
        </Typography>
        {loadingEndpoints ? 
            <Skeleton/>
            : ((endpoints||[]).map((d:DataEndpoint) => 
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
                {renderDescription(d.description)}

                {false && d.prefix && d.namespace && <Typography sx={{fontFamily: "monospace"}}>
                    PREFIX {d.prefix}: &lt;{d.namespace}&gt;
                </Typography>}

            </Card> ))
        }
    </Box>
}
