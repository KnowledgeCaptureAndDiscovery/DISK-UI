import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material"
import React, { Fragment, useEffect, useState, useRef } from "react";
import CloseIcon from '@mui/icons-material/Close';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Question, QuestionVariable } from "DISK/interfaces";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";

import { MapContainer, TileLayer, useMap, Marker, Popup, LayersControl} from 'react-leaflet'
import { setQuestionBindings } from "redux/slices/forms";

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
    onChange?: (bindings:OptionBinding[]) => void
}

export const BoundingBoxMap = ({variable}: BoundingBoxMapProps) => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [boundingBox, setBoundingBox] = useState<[number, number, number, number]|null>(null); //MinLat, MinLng, MaxLat, MaxLng
    const bindings = useAppSelector((state:RootState) => state.forms.questionBindings);

    useEffect(() => {
        console.log(variable)
    }, [variable]);

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
            onChange([
                {variable:variable.minLat, value:{id: initialBindings.minLat.toFixed(6), name: initialBindings.minLat.toFixed(2)}},
                {variable:variable.minLng, value:{id: initialBindings.minLng.toFixed(6), name: initialBindings.minLng.toFixed(2)}},
                {variable:variable.maxLat, value:{id: initialBindings.maxLat.toFixed(6), name: initialBindings.maxLat.toFixed(2)}},
                {variable:variable.maxLng, value:{id: initialBindings.maxLng.toFixed(6), name: initialBindings.maxLng.toFixed(2)}},
            ]);
        }
    }, [initialBindings]);*/

    const onOpenDialog = () => {
        setOpen(true);
    }

    const onCloseDialog = () => {
        setOpen(false);
    }

    const onSelect = () => {
        let newBindings = { ...bindings };
        if (boundingBox && variable) {
            newBindings[variable.minLat.id] = boundingBox[0].toFixed(6);
            newBindings[variable.minLng.id] = boundingBox[1].toFixed(6);
            newBindings[variable.maxLat.id] = boundingBox[2].toFixed(6);
            newBindings[variable.maxLng.id] = boundingBox[3].toFixed(6);
            //let bindings : OptionBinding[] = [
            //    {variable:variable.minLat, value:{id: boundingBox[0].toFixed(6), name: boundingBox[0].toFixed(2)}},
            //    {variable:variable.minLng, value:{id: boundingBox[1].toFixed(6), name: boundingBox[1].toFixed(2)}},
            //    {variable:variable.maxLat, value:{id: boundingBox[2].toFixed(6), name: boundingBox[2].toFixed(2)}},
            //    {variable:variable.maxLng, value:{id: boundingBox[3].toFixed(6), name: boundingBox[3].toFixed(2)}},
            //];
            //if (onChange) onChange(bindings);
            onCloseDialog();
        } else {
            delete newBindings[variable.minLat.id];
            delete newBindings[variable.minLng.id];
            delete newBindings[variable.maxLat.id];
            delete newBindings[variable.maxLng.id];
            //TODO: show some error;
        }
        dispatch(setQuestionBindings({
            map: newBindings
        }));
    }

    /*useEffect(() => {
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

    }, [pointA, pointB, map, maps])*/

    const onBoundingBoxChange : (geometry:[number, number, number, number]|null) => void = (geometry) => {
        setBoundingBox(geometry);
    }

    return (
        <Fragment>
            <Button onClick={onOpenDialog} sx={{p:'4px'}}>
                {boundingBox ? 
                "(" + boundingBox[0].toFixed(2) + ", " + boundingBox[1].toFixed(2) + ") - (" + boundingBox[2].toFixed(2) + ", " + boundingBox[3].toFixed(2) + ")"
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
                    <MapContainer center={[47, -101]} zoom={3} scrollWheelZoom={false} style={{ height: '400px' }}>
                        <MapController onChange={onBoundingBoxChange} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </MapContainer>
                    
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
                                    <TableCell sx={{padding: "0 10px"}}>{boundingBox ? boundingBox[0].toFixed(3) : '-'}</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>{boundingBox ? boundingBox[1].toFixed(3) : '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{padding: "0 10px"}}><b>Max</b></TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>{boundingBox ? boundingBox[2].toFixed(3) : '-'}</TableCell>
                                    <TableCell sx={{padding: "0 10px"}}>{boundingBox ? boundingBox[3].toFixed(3) : '-'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={onSelect} disabled={!boundingBox}>
                        Select
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

interface SpatialExtendMapProps {
    onChange?: (geometry:[number, number, number, number]|null) => void
}

const MapController = ({onChange}:SpatialExtendMapProps) => {
    const map = useMap();
    const [geometry, setGeometry] = useState<[number, number, number, number]|null>(null); //MinLat, MinLng, MaxLat, MaxLng

    map.on('pm:create', (e) => {
        let shapes = map.pm.getGeomanLayers(true);
        let json = shapes.toGeoJSON();
        let curBB : [number, number, number, number]|null = null;

        if (json.type === 'FeatureCollection' && json.features.length > 0) {
            let firstGeo = json.features[0].geometry;
            if (firstGeo.type === 'Polygon' && firstGeo.coordinates.length === 1 && firstGeo.coordinates[0].length === 5) { // X = lng, Y = lat,
                let firstLng = (firstGeo.coordinates[0][0] as [number, number])[0];
                let fistLat = (firstGeo.coordinates[0][0] as [number, number])[1];
                let minLng = firstLng;
                let minLat = fistLat;
                let maxLng = firstLng;
                let maxLat = fistLat;
                firstGeo.coordinates[0].forEach((pos) => {
                    let lng = (pos as [number, number])[0];
                    let lat = (pos as [number, number])[1];
                    if (lng < minLng) minLng = lng;
                    if (lng > maxLng) maxLng = lng;
                    if (lat < minLat) minLat = lat;
                    if (lat > maxLat) maxLat = lat;
                });
                curBB = [minLat, minLng, maxLat, maxLng];
                setGeometry(curBB);
                console.log(curBB);
            } else {
                setGeometry(null);
            }
        } else {
            setGeometry(null);
        }

        if (onChange) onChange(curBB);
    });

    map.pm.addControls({
        drawMarker: false,
        drawText: false,
        drawPolyline: false,
        drawCircleMarker: false,
        drawPolygon: false,
        drawCircle: false,
        cutPolygon: false,
        rotateMode: false,
        //drawRectangle: !geometry,
        editMode: !!geometry,
        dragMode: !!geometry,
        removalMode: !!geometry,
    });

    map.pm.setGlobalOptions({
        snapDistance: 15,
        allowSelfIntersection: false,
    });

    return <></>;
}