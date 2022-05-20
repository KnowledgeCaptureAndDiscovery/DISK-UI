import { Box, Card, Divider, IconButton, Skeleton, Typography } from "@mui/material";
import { DISKAPI } from "DISK/API";
import { LineOfInquiry, idPattern } from "DISK/interfaces";
import { useEffect } from "react";
import { Link, useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { PATH_LOIS } from "constants/routes";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { setSelectedLOI, setLoadingSelected, setErrorSelected } from 'redux/lois';

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

export const LOIView = () => {
    const location = useLocation();

    const LOI = useAppSelector((state:RootState) => state.lois.selectedLOI);
    const selectedId = useAppSelector((state:RootState) => state.lois.selectedId);
    const loading = useAppSelector((state:RootState) => state.lois.loadingSelected);
    const error = useAppSelector((state:RootState) => state.lois.errorSelected);
    const dispatch = useAppDispatch();

    const loadLOI = () => {
        let id : string = location.pathname.replace(idPattern, '');
        if (!!id && !loading && !error && selectedId !== id) {
            dispatch(setLoadingSelected(id));
            DISKAPI.getLOI(id)
                .then((LOI:LineOfInquiry) => {
                    dispatch(setSelectedLOI(LOI));
                })
                .catch(() => {
                    dispatch(setErrorSelected());
                });
        }
    }

    useEffect(loadLOI);

    return <Card variant="outlined" sx={{height: "calc(100vh - 112px)"}}>
        {loading ? 
            <Skeleton sx={{height:"40px", margin: "8px 12px", minWidth: "250px"}}/>
        :
            <Box sx={{padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <Typography variant="h5">
                    {error ? "Error loading LOI" : LOI?.name}
                </Typography>
                <IconButton component={Link} to={PATH_LOIS + "/" + LOI?.id + "/edit"}>
                    <EditIcon />
                </IconButton>
            </Box>
        }
        <Divider/>
        <Box sx={{padding:"10px"}}>
            <Box>
                <TypographyLabel>Description: </TypographyLabel>
                <TypographyInline>
                    {!loading && !!LOI ? LOI.description : <Skeleton sx={{display:"inline-block", width: "200px"}} />}
                </TypographyInline>
            </Box>
            {!!LOI && LOI.notes ? <Box>
                <TypographyLabel>Notes: </TypographyLabel>
                <TypographyInline>{LOI.notes}</TypographyInline>
            </Box> : ""}

            <TypographySubtitle>
                LOI question:
            </TypographySubtitle>

        </Box>
        
    </Card>
}