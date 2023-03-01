import { useEffect, useRef, useState } from "react";

import { Canvas, useThree } from "@react-three/fiber";
import { BufferGeometry, DirectionalLight, Mesh, MeshLambertMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { VTKParser } from "VTKParser";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Box } from "@mui/material";
import { useAppDispatch, useBrainVisualization } from "redux/hooks";
import { addMesh, setFilelist, setFullyDone } from "redux/brain";
import { useGetPublicFileQuery, useLazyGetPublicFileQuery } from "redux/apis/server";

export interface BrainCfgItem {
    name: string,
    pval: number
}

interface BrainVisualizationProps {
    configuration?: BrainCfgItem[],
}

const BrainViz = () => {
    const { gl } = useThree();
    gl.setSize(800, 600);
    gl.autoClear = false;
    return <></>
}

export const BrainVisualization = ({configuration}: BrainVisualizationProps) => {
    const dispatch = useAppDispatch();
    const {data:jsonString, isLoading:loading, isError} = useGetPublicFileQuery("files.json");
    const [getPublicFile] = useLazyGetPublicFileQuery();
    const [done, filelist, meshesStr] = useBrainVisualization();
    const [meshes, setMeshes] = useState<Mesh<BufferGeometry,MeshLambertMaterial>[]>([]); // Brain parts

    //Download data and prepare meshes
    useEffect(() => {
        if (jsonString && !done) {
            dispatch(setFilelist(JSON.parse(jsonString)));
        }
    }, [jsonString, done])

    useEffect(() => {
        //Download all brain models 
        if (filelist && !done) {
            let allRequests = Object.keys(filelist.filename)
                    .filter((id:string) => !meshesStr[id] )
                    .map((id:string) => {
                getPublicFile("models/" + filelist.filename[id])
                    .unwrap()
                    .then((vtkMesh: string) => {
                        dispatch(addMesh([id, vtkMesh]));
                    });
            });
            Promise.all(allRequests)
                .finally(() => {
                    console.log("All models downloaded");
                    dispatch(setFullyDone(true));
                })
        }
    }, [filelist, done]);

    useEffect(() => {
        // Transform raw mesh to three js Mesh
        if (filelist && Object.keys(filelist.filename).length === Object.keys(meshesStr).length) {  //This is the same as "done";
            let newMeshes : Mesh<BufferGeometry,MeshLambertMaterial>[] = Object.keys(meshesStr).map((id:string) => {
                let name = filelist.name[id];
                let bufferGeo: BufferGeometry = VTKParser.parse(meshesStr[id]);
                bufferGeo.computeVertexNormals();
                let material = new MeshLambertMaterial({ color: 0xdddddd });

                let mesh = new Mesh(bufferGeo, material);
                mesh.material.transparent = true;
                mesh.material.opacity = 0.1;
                mesh.rotation.y = (Math.PI * 1.01);
                mesh.rotation.x = (Math.PI * 0.5);
                mesh.rotation.z = (Math.PI * 1.5 * (name.indexOf("rh_") == -1 ? 1 : -1));
                mesh.name = name;
                return mesh
            });
            setMeshes(newMeshes);
        }
    }, [meshesStr]);

    useEffect(() => {
        // Set mesh opacity depending of configuration file.
        if (done && meshes.length > 0 && configuration && configuration.length > 0) {
            let map : {[name:string] : number} = {};
            configuration.forEach((item:BrainCfgItem) => {
                map[item.name] = item.pval;
            });
            meshes.forEach((mesh:Mesh<BufferGeometry,MeshLambertMaterial>) => {
                if (map[mesh.name]) {
                    let value : number = map[mesh.name];
                    mesh.material.opacity = .75;
                    mesh.material.color.setRGB(1,(.86*value),(.86*value));
                } else {
                    mesh.material.opacity = 0.05;
                    mesh.material.color.setHex(0xdddddd);
                }
            });
        }
    }, [meshes, done, configuration]);

    // Render stuff
    const [scene, setScene] = useState<Scene|undefined>();
    const [camera, setCamera]= useState<null|PerspectiveCamera>(null);
    const [controls, setControls]= useState<null|OrbitControls>(null);
    const [renderer, setRenderer]= useState<null|WebGLRenderer>(null);
    const canvas = useRef<null|HTMLCanvasElement>(null);

    //const renderer = new WebGLRenderer({antialias:true, alpha:true});

   useEffect(() => {
       if (canvas && canvas.current) {
           let newCamera = new PerspectiveCamera(50, 8/6, 0.1, 1e10);
           newCamera.position.z = 1;

           let orbitControl = new OrbitControls(newCamera, canvas.current);
           orbitControl.enableDamping = true;
           orbitControl.dampingFactor = .25;
           orbitControl.minDistance = 200;
           orbitControl.maxDistance = 500;
           orbitControl.maxPolarAngle = Math.PI;
           setControls(orbitControl);

           canvas.current.width = 800;
           canvas.current.height = 600;
           canvas.current.addEventListener(
               'webglcontextlost',
               function (event) {
                   event.preventDefault();
                   //setContextLost(true);
               },
               false
           );

           let dirLight = new DirectionalLight(0xffffff);
           dirLight.position.set(200,200,1000).normalize();

           newCamera.add(dirLight);
           newCamera.add(dirLight.target);
           setCamera(newCamera);

           let newScene = new Scene();
           newScene.add(newCamera);

           setScene(newScene);


           let newRenderer = new WebGLRenderer({canvas:canvas.current, antialias:true, alpha:true});
           newRenderer.setPixelRatio(devicePixelRatio)
           newRenderer.setSize(800,600);
           newRenderer.autoClear = false;
           if (newRenderer.getContext() === null) newRenderer.forceContextRestore();
           setRenderer(newRenderer);

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


    return (
        <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center'}}>
            <Canvas ref={canvas} style={{width: "840px", height: "620px"}}>
                <BrainViz />
            </Canvas>
        </Box>
    );
}
