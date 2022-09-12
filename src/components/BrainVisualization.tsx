import { Canvas, ThreeElements } from "@react-three/fiber";
import { RootState } from "@react-three/fiber/dist/declarations/src/core/store";
import { DISKAPI } from "DISK/API";
import { useEffect, useRef, useState } from "react";
import { BufferGeometry, DirectionalLight, Float32BufferAttribute, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { VTKParser } from "VTKParser";
//import { OrbitControls } from 'three-stdlib';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Box, CircularProgress } from "@mui/material";
import { visitLexicalEnvironment } from "typescript";


interface BrainFiles {
    colors: {[id:string] : [number, number, number]},
    filename: {[id:string] : string},
    name: {[id:string] : string},
}

export interface BrainCfgItem {
    name: string,
    pval: number
}

interface BrainVisualizationProps {
    configuration?: BrainCfgItem[],
}

export const BrainVisualization = ({configuration}: BrainVisualizationProps) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const canvas = useRef<null|HTMLCanvasElement>(null);
    const [meshes, setMeshes] = useState<Mesh<BufferGeometry,MeshLambertMaterial>[]>([]); // Brain parts
    const [scene, setScene] = useState<Scene|undefined>();
    const [camera, setCamera]= useState<null|PerspectiveCamera>(null);
    const [controls, setControls]= useState<null|OrbitControls>(null);
    const [renderer, setRenderer]= useState<null|WebGLRenderer>(null);
    
    useEffect(() => {
        if (canvas && canvas.current) {
            console.log("canvas set:", canvas.current);

            canvas.current.width = 800;
            canvas.current.height = 600;

            let renderer = new WebGLRenderer({canvas:canvas.current, antialias:true, alpha:true});
            renderer.setPixelRatio(devicePixelRatio)
            renderer.setSize(800,600);
            renderer.autoClear = false;
            setRenderer(renderer);

            let camera = new PerspectiveCamera(50, 8/6, 0.1, 1e10);
            camera.position.z = 1;

            let orbitControl = new OrbitControls(camera, canvas.current);
            orbitControl.enableDamping = true;
            orbitControl.dampingFactor = .25;
            orbitControl.minDistance = 200;
            orbitControl.maxDistance = 500;
            orbitControl.maxPolarAngle = Math.PI;
            setControls(orbitControl);

            let dirLight = new DirectionalLight(0xffffff);
            dirLight.position.set(200,200,1000).normalize();

            camera.add(dirLight);
            camera.add(dirLight.target);
            setCamera(camera);

            let scene = new Scene();
            scene.add(camera);

            setScene(scene);
        }
    }, [canvas])

    useEffect(() => {
        if (!loading && !!scene && meshes.length > 0 && !!renderer && !!camera&& !!controls) {
            meshes.forEach((mesh) => {
                scene.add(mesh);
            });
            renderer.setAnimationLoop(() => {
                controls.update();
                renderer.render(scene, camera);
            })
        }
    }, [scene, meshes, renderer, camera, controls, loading])

    useEffect(() => {
        if (!loading && meshes.length > 0 && configuration && configuration.length > 0) {
            let map : {[name:string] : number} = {};
            configuration.forEach((item:BrainCfgItem) => {
                map[item.name] = item.pval;
            });
            console.log(map);
            meshes.forEach((mesh:Mesh<BufferGeometry,MeshLambertMaterial>) => {
                if (map[mesh.name]) {
                    let value : number = map[mesh.name];
                    //mesh.material.opacity = 0.1 + map[mesh.name] * 0.9;
                    //mesh.material.color.setHex(0xff0000);
                    mesh.material.opacity = .75;
                    //mesh.material.color.setRGB(1,.875 + (.125 * value),.875 + (.125 * value));
                    mesh.material.color.setRGB(1,(.86*value),(.86*value));
                    //mesh.material.color.setHex(0xff0000);
                    console.log(value);
                } else {
                    mesh.material.opacity = 0.05;
                    mesh.material.color.setHex(0xdddddd);
                }
            });
        }
    }, [meshes, loading, configuration]);

    useEffect(() => {
        setLoading(true);
        DISKAPI.getPublic("files.json")
            .then((text:string) => {
                let ok : boolean = text.startsWith('{');
                setError(!ok)
                if (ok) {
                    // Now load all the brain meshes 
                    let files : BrainFiles = JSON.parse(text);
                    let allRequests = Object.keys(files.filename).map((id:string) => {
                        DISKAPI.getPublic("models/" + files.filename[id])
                            .then((vtkMesh:string) => {
                                let name = files.name[id];
                                let bufferGeo : BufferGeometry = VTKParser.parse(vtkMesh);
                                bufferGeo.computeVertexNormals();
                                let material = new MeshLambertMaterial({color: 0xdddddd});

                                let mesh = new Mesh(bufferGeo, material);
                                mesh.material.transparent = true;
                                mesh.material.opacity = 0.1;
                                mesh.rotation.y = (Math.PI * 1.01);
                                mesh.rotation.x = (Math.PI * 0.5);
                                mesh.rotation.z = (Math.PI * 1.5 * (name.indexOf("rh_") == -1 ? 1 : -1));
                                mesh.name = name;

                                setMeshes((cur) => {
                                    let next = [ ...cur ];
                                    next.push(mesh);
                                    return next;
                                })
                            });
                    });
                    Promise.all(allRequests)
                        .finally(() => {
                            console.log("All models downloaded");
                            setLoading(false);
                        })
                }
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            })
    }, [])

    return (
        <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center'}}>
            <Canvas ref={canvas} style={{width: "840px", height: "620px"}}> </Canvas>
        </Box>
    );
}