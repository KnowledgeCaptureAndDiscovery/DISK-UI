import { Link as MuiLink } from "@mui/material"
import { REACT_APP_DISK_API } from "config";
import { useState } from "react";
import { DISK } from "redux/apis/DISK";
import { useLazyGetPrivateFileQuery } from "redux/apis/server";

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
        const requestOptions = {
            method: 'POST',
            //headers: { 'Content-Type': 'application/json' },
            headers: DISK.headers,
            body: JSON.stringify( {'source':source, 'dataId': url.replace(/.*#/,"")},)
        };
        fetch(REACT_APP_DISK_API + 'getData', requestOptions)
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

        //getPrivateFile({ dataSource: source, dataId: url })
        //    .unwrap()
        //    .then((r: string) => {
        //        console.log(r);
        //        let element = document.createElement('a');

        //        let datatype = "text/plain;charset=utf-8,";
        //        if (r[0] === '[' || r[0] === '{') {
        //            datatype = "text/json;charset=utf-8,";
        //        } else {
        //            if (r.startsWith("%PDF")) {
        //                //var blob=new Blob([data]);
        //                datatype = "application/pdf;charset=utf-8,";
        //            }
        //        }
        //        element.setAttribute('href', 'data:' + datatype + encodeURIComponent(r));
        //        element.setAttribute('download', filename);

        //        element.style.display = 'none';
        //        document.body.appendChild(element);
        //        element.click();
        //        document.body.removeChild(element);
        //    });
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