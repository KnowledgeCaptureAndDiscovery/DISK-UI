import { Link as MuiLink } from "@mui/material"
import { useState } from "react";
import { DISK } from "redux/apis/DISK";

interface PrivateLinkProp {
    filename: string,
    url: string,
    source: string,
    preview?: boolean,
}

export const PrivateLink = ({filename, url, source, preview}:PrivateLinkProp) => {
    //const [getPrivateFile] = useLazyGetPrivateFileQuery();
    const [blob, setBlob] = useState<string>("");
    const [cType, setCType] = useState<string>("");

    const downloadFile = () => {
        DISK.downloadPrivateFile({source:source, dataId: url.replace(/.*#/,"")})
            .then((response) => {
                if (response.status === 200) {
                    let contentType = response.headers.has('content-type') ? response.headers.get('content-type') as string: "";
                    setCType(contentType);
                    response.blob().then((file) => {
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(file);

                        if (contentType.startsWith('application')) {
                            file.text().then(setBlob);
                        } else {
                            setBlob(link.href);
                        }
                        link.setAttribute('download', filename);
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
                } else {
                    setBlob("");
                    setCType("");
                }
            })
    }

    console.log(cType);

    return <div>
        <MuiLink color="inherit" onClick={downloadFile} sx={{cursor:"pointer"}}>
            {filename}
        </MuiLink>
        {preview && cType && blob && 
            (cType.startsWith("image") ? 
                <img src={blob} style={{maxWidth: "400px", display:"block"}}/>
                : (cType.startsWith("application") ? <div style={{whiteSpace: 'pre-line'}}>{blob}</div> : null)
            )
        }
    </div>
}