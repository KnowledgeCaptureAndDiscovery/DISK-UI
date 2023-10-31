import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material"
import { Fragment, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { BoundingBoxQuestionVariable } from "DISK/interfaces";
import { useAppDispatch, useQuestionBindings } from "redux/hooks";
import { MapContainer, TileLayer, useMap, Rectangle} from 'react-leaflet'
import { setQuestionBindings } from "redux/slices/forms";
import { LatLngExpression } from "leaflet";

interface Option {
    id: string,
    name: string
}

export interface OptionBinding {
    variable: BoundingBoxQuestionVariable,
    value: Option,
}

interface BoundingBoxMapProps {
    variable: BoundingBoxQuestionVariable,
}

export const BoundingBoxMap = ({variable}: BoundingBoxMapProps) => {
    const dispatch = useAppDispatch();
    const bindings = useQuestionBindings();

    const [open, setOpen] = useState(false);
    const [boundingBox, setBoundingBox] = useState<[number, number, number, number]|null>(null); //MinLat, MinLng, MaxLat, MaxLng
    const [initBB, setInitBB] = useState<[[number,number],[number,number]]|null>(null); //[[MinLat, MinLng], [MaxLat, MaxLng]]

    useEffect(() => {
        let initVal : [[number,number],[number,number]] | null = null;
        if (variable && bindings) {
            let minLat = bindings[variable.minLat.id];
            let minLng = bindings[variable.minLng.id];
            let maxLat = bindings[variable.maxLat.id];
            let maxLng = bindings[variable.maxLng.id];
            if (minLat && minLng && maxLat && maxLng) {
                initVal = [[Number(minLat), Number(minLng)], [Number(maxLat), Number(maxLng)]];
            }
        }
        setInitBB(initVal);
        setBoundingBox(initVal ? 
            [initVal[0][0], initVal[0][1], initVal[1][0],initVal[1][1]]
            : null);
    }, [variable, bindings]);

    const onOpenDialog = () => {
        setOpen(true);
    }

    const onCloseDialog = () => {
        setOpen(false);
    }

    const onSelect = () => {
        let newBindings = { ...bindings };
        if (boundingBox && variable) {
            newBindings[variable.minLat.id] = [boundingBox[0].toFixed(6)];
            newBindings[variable.minLng.id] = [boundingBox[1].toFixed(6)];
            newBindings[variable.maxLat.id] = [boundingBox[2].toFixed(6)];
            newBindings[variable.maxLng.id] = [boundingBox[3].toFixed(6)];
            onCloseDialog();
        } else {
            delete newBindings[variable.minLat.id];
            delete newBindings[variable.minLng.id];
            delete newBindings[variable.maxLat.id];
            delete newBindings[variable.maxLng.id];
        }
        dispatch(setQuestionBindings(newBindings));
    }

    const onBoundingBoxChange : (geometry:[number, number, number, number]|null) => void = (geometry) => {
        setBoundingBox(geometry);
    }

    const getMapCenter :  (box: [[number,number],[number,number]] | null) => LatLngExpression = (box) => {
        if (box) {
            return [
                (box[0][0] + box[1][0])/2,
                (box[0][1] + box[1][1])/2
            ]
        }
        return [47, -101];
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
                    <MapContainer center={getMapCenter(initBB)} zoom={3} scrollWheelZoom={false} style={{ height: '400px' }}>
                        <MapController onChange={onBoundingBoxChange} />
                        {initBB && (
                            <Rectangle bounds={initBB}/>
                        )}
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
            }

            // Remove all layers except the last one
            let layers = shapes.getLayers();
            layers.forEach((l, index) => {
                if (index !== layers.length -1) {
                    map.removeLayer(l);
                }
            });
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
        //editMode: !!geometry,
        //dragMode: !!geometry,
        //removalMode: !!geometry,
    });

    map.pm.setGlobalOptions({
        snapDistance: 15,
        allowSelfIntersection: false,
    });

    return <></>;
}