import { Box, Card, Divider, IconButton, Skeleton, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { Hypothesis, idPattern } from "DISK/interfaces";
import React, { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { PATH_HYPOTHESES } from "constants/routes";

const TypographyLabel = styled(Typography)(({ theme }) => ({
    color: 'gray',
    display: "inline",
    fontWeight: "bold",
    fontSize: ".9em"
}));

const TypographyInline = styled(Typography)(({ theme }) => ({
    display: "inline",
}));

const TypographySubtitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1.2em"
}));

export const HypothesisView = () => {
    const location = useLocation();

    const [hypothesis, setHypothesis] = React.useState<Hypothesis>();
    const [loadingHypothesis, setLoadingHypothesis] = React.useState<boolean>(true);
    const [error, setError] = React.useState<boolean>(false);

    const loadHypothesis = () => {
        setLoadingHypothesis(true);
        setError(false);
        let id : string = location.pathname.replace(idPattern, '');
        let hypP : Promise<Hypothesis> = DISKAPI.getHypothesis(id);
        hypP.then((hypothesis:Hypothesis) => {
            setHypothesis(hypothesis);
            setLoadingHypothesis(false);
        });
        hypP.catch(() => {
            setLoadingHypothesis(false);
            setError(true);
        });
    }

    useEffect(loadHypothesis, []);

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)"}}>
        {loadingHypothesis ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <Typography variant="h5">
                    {error ? "Error loading hypothesis" : hypothesis?.name}
                </Typography>
                <IconButton component={Link} to={PATH_HYPOTHESES + "/" + hypothesis?.id + "/edit"}>
                    <EditIcon />
                </IconButton>
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            <Box>
                <TypographyLabel>Description: </TypographyLabel>
                <TypographyInline>
                    {!loadingHypothesis && !!hypothesis ? hypothesis.description : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
                </TypographyInline>
            </Box>
            {!!hypothesis && hypothesis.notes ? <Box>
                <TypographyLabel>Notes: </TypographyLabel>
                <TypographyInline>{hypothesis.notes}</TypographyInline>
            </Box> : ""}

            <TypographySubtitle>
                Hypothesis question:
            </TypographySubtitle>

        </Box>
        
    </Card>
}