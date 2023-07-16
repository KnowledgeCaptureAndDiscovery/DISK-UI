import { Box, Card, Divider, Skeleton } from "@mui/material"
import { useEffect, useState } from "react";
import { DISK } from "redux/apis/DISK";
import { useAuthenticated } from "redux/hooks";

interface ImagePreviewProps {
    name: string,
    source: string,
    url: string,
}

export const ImagePreview = ({name, url, source}:ImagePreviewProps) => {
    const [blob, setBlob] = useState<string>("");
    const [cType, setCType] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const auth = useAuthenticated();

    useEffect(() => {
        if (auth) {
            setLoading(true);
            DISK.downloadPrivateFile({source:source, dataId: url.replace(/.*#/,"")})
                .then((response) => {
                    if (response.status === 200) {
                        let contentType = response.headers.has('content-type') ? response.headers.get('content-type') as string: "";
                        setCType(contentType);
                        response.blob().then((file) => {
                            if (contentType.startsWith('application')) {
                                file.text().then(setBlob);
                            } else {
                                setBlob(window.URL.createObjectURL(file));
                            }
                        });
                    } else {
                        setBlob("");
                        setCType("");
                    }
                    setLoading(false);
                })
        }
    }, [source, url, auth])

    if (loading)
        return <Skeleton style={{minWidth:"80%"}}/>

    if (!cType || !auth)
        return <></>;

    return <Card style={{maxWidth:"85%", display:"flex", flexDirection:"column", alignItems:"center", marginTop: "5px"}} variant="outlined">
        {cType && blob && cType.startsWith("image") && <img src={blob} style={{maxWidth:"100%"}} alt={`Generated output ${name}`}/> }
        <Divider style={{width: "100%"}}/>
        <Box> {name} </Box>
    </Card>
}