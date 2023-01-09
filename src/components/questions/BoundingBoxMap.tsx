import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import GoogleMapReact, { ClickEventValue } from 'google-map-react';
import { Question, QuestionVariable } from "DISK/interfaces";
import { useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";

interface MapPoint {
    lat: number,
    lng: number,
}

interface Option {
    id: string,
    name: string
}

export interface OptionBinding {
    variable: QuestionVariable,
    value: Option,
}

interface BoundingBoxMapProps {
    variable: QuestionVariable,
    bindings: {
        minLat: number,
        minLng: number,
        maxLat: number,
        maxLng: number
    } | null,
    onChange?: (bindings:OptionBinding[]) => void
}

export const BoundingBoxMap = ({variable}: BoundingBoxMapProps) => {
    const [open, setOpen] = useState(false);
    const [map, setMap] = useState<any>();
    const [maps, setMaps] = useState<any>();
    const bindings = useAppSelector((state:RootState) => state.forms.questionBindings);

    const [pointA, setPointA] = useState<MapPoint|null>(null);
    const [pointB, setPointB] = useState<MapPoint|null>(null);
    const [boundingBox, setBoundingBox] = useState<any>();
    const [marker, setMarker] = useState<any>();
    const [simpleBox, setSimpleBox] = useState<{minLat:number,minLng:number,maxLat?:number,maxLng?:number}|null>(null);

    const [pristine, setPristine] = useState<boolean>(true);

    //useEffect(() => {
    //    if (variable && bindings variable.maxLat, variable.minLng, variable.maxLng&& & && && variable.minLatt &&
    //        [, ].forEach((expVar:QuestionVariable) => {
    //        });
    //    }
    //}, [variable, bindings]);

    /*useEffect(() => {
        if (initialBindings) {
            setSimpleBox(initialBindings);
            setPointA({lat:initialBindings.minLat, lng:initialBindings.minLng});
            setPointB({lat:initialBindings.maxLat, lng:initialBindings.maxLng});
            if (onChange) onChange([
                {variable:variable.minLat, value:{id: initialBindings.minLat.toFixed(6), name: initialBindings.minLat.toFixed(2)}},
                {variable:variable.minLng, value:{id: initialBindings.minLng.toFixed(6), name: initialBindings.minLng.toFixed(2)}},
                {variable:variable.maxLat, value:{id: initialBindings.maxLat.toFixed(6), name: initialBindings.maxLat.toFixed(2)}},
                {variable:variable.maxLng, value:{id: initialBindings.maxLng.toFixed(6), name: initialBindings.maxLng.toFixed(2)}},
            ]);
        }
    }, [initialBindings]);*/

    /*useEffect(() => {
        if (initialBindings) {
            setSimpleBox(initialBindings);
            setPointA({lat:initialBindings.minLat, lng:initialBindings.minLng});
            setPointB({lat:initialBindings.maxLat, lng:initialBindings.maxLng});
            if (onChange) onChange([
                {variable:variable.minLat, value:{id: initialBindings.minLat.toFixed(6), name: initialBindings.minLat.toFixed(2)}},
                {variable:variable.minLng, value:{id: initialBindings.minLng.toFixed(6), name: initialBindings.minLng.toFixed(2)}},
                {variable:variable.maxLat, value:{id: initialBindings.maxLat.toFixed(6), name: initialBindings.maxLat.toFixed(2)}},
                {variable:variable.maxLng, value:{id: initialBindings.maxLng.toFixed(6), name: initialBindings.maxLng.toFixed(2)}},
            ]);
        }
    }, [initialBindings]);*/

    const defaultProps = {
        center: {
            lat: 35.0,
            lng: -40.0
        },
        zoom: 1
    };

    const onOpenDialog = () => {
        setOpen(true);
    }

    const onCloseDialog = () => {
        setOpen(false);
    }

    const onSelect = () => {
        if (simpleBox && simpleBox.maxLat && simpleBox.maxLng) {
            let bindings : OptionBinding[] = [
                {variable:variable.minLat, value:{id: simpleBox.minLat.toFixed(6), name: simpleBox.minLat.toFixed(2)}},
                {variable:variable.minLng, value:{id: simpleBox.minLng.toFixed(6), name: simpleBox.minLng.toFixed(2)}},
                {variable:variable.maxLat, value:{id: simpleBox.maxLat.toFixed(6), name: simpleBox.maxLat.toFixed(2)}},
                {variable:variable.maxLng, value:{id: simpleBox.maxLng.toFixed(6), name: simpleBox.maxLng.toFixed(2)}},
            ];
            //if (onChange) onChange(bindings);
            onCloseDialog();
        } else {
            //TODO: show some error;
        }
    }

    const onClick = (value: ClickEventValue) => {
        let clickedPoint : MapPoint = {lat: value.lat, lng: value.lng};
        if (pointA == null && pointB == null) {
            // Set first point
            setPointA(clickedPoint);
        } else if (pointA != null && pointB == null) {
            // Set second point
            setPointB(clickedPoint);
        } else {
            // Nothing happens?
        }
    }

    const clearMap = () => {
        setPointA(null);
        setPointB(null);
    }

    useEffect(() => {
        if (map && maps) {
            if (pointA) {
                if (pointB) {
                    // Draws the bounding box
                    let minLat = pointA.lat < pointB.lat ? pointA.lat : pointB.lat;
                    let maxLat = pointA.lat > pointB.lat ? pointA.lat : pointB.lat;
                    let minLng = pointA.lng < pointB.lng ? pointA.lng : pointB.lng;
                    let maxLng = pointA.lng > pointB.lng ? pointA.lng : pointB.lng;
                    let BBCoords : MapPoint[] = [
                        {lat:minLat, lng:minLng},
                        {lat:maxLat, lng:minLng},
                        {lat:maxLat, lng:maxLng},
                        {lat:minLat, lng:maxLng},
                        {lat:minLat, lng:maxLng},
                    ]
                    setSimpleBox({minLat:minLat,maxLat:maxLat,minLng:minLng,maxLng:maxLng});

                    let box = new maps.Polygon({
                        paths: BBCoords,
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#FF0000",
                        fillOpacity: 0.35
                    });
                    box.setMap(map);

                    setBoundingBox(box);
                    console.log(box);
                    if (marker) marker.setMap(null);
                } else {
                    // Draws dot
                    let newMarker = new maps.Marker({
                        position: pointA,
                    });
                    newMarker.setMap(map);
                    setSimpleBox({minLat:pointA.lat,minLng:pointA.lng});

                    setMarker(newMarker);
                    if (boundingBox) boundingBox.setMap(null);
                }
            } else {
                // Clear bounding box
                if (boundingBox) boundingBox.setMap(null);
                if (marker) marker.setMap(null);
                setSimpleBox(null);
            }
        }

    }, [pointA, pointB, map, maps])

    const handleApiLoaded = (map:any, maps:any) => {
        setMap(map);
        setMaps(maps);
    };

    return (
        <Fragment>
            <Button onClick={onOpenDialog} sx={{p:'4px'}}>
                {simpleBox && simpleBox.maxLat && simpleBox.maxLng ? 
                "(" + simpleBox.minLat.toFixed(2) + ", " + simpleBox.minLng.toFixed(2) + ") - (" + simpleBox.maxLat.toFixed(2) + ", " + simpleBox.maxLng.toFixed(2) + ")"
                : "Set bounding box"}
                <TravelExploreIcon sx={{color: "gray", ml: "4px"}}/>
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ m: 0, p: '8px 16px'}}>
                    Bounding Box selection
                    <IconButton aria-label="close" onClick={onCloseDialog}
                            sx={{ position: 'absolute', right: 5, top: 5, color: 'grey'}} >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{height: '60vh', width: '100%', position:'relative'}}>
                        <Button style={{position: 'absolute', zIndex: 1000, margin: '10px', background: 'white'}} onClick={clearMap}>Clear</Button>
                        <GoogleMapReact
                            bootstrapURLKeys={{ key: "" }}
                            defaultCenter={pointA ? (pointB ? {lat: (pointA.lat + pointB.lat)/2, lng: (pointA.lng + pointB.lng)/2} : pointA) : defaultProps.center}
                            defaultZoom={defaultProps.zoom}
                            yesIWantToUseGoogleMapApiInternals
                            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                            onClick={onClick}
                        >
                        </GoogleMapReact>
                    </Box>
                    <Box>
                    <TableContainer sx={{display: "flex", justifyContent: "center"}}>
                        <Table sx={{width:"unset"}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}}></TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>Lat</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>Lng</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}}><b>Min</b></TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>{simpleBox ? simpleBox.minLat.toFixed(3) : '-'}</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>{simpleBox ? simpleBox.minLng.toFixed(3) : '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}}><b>Max</b></TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>{simpleBox && pointB ? simpleBox.maxLat?.toFixed(3) : '-'}</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>{simpleBox && pointB ? simpleBox.maxLng?.toFixed(3) : '-'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={onSelect} disabled={!pointB}>
                        Select
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

