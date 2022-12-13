import { Link as MuiLink } from "@mui/material"
import { useLazyGetPrivateFileQuery } from "redux/apis/server";

interface PrivateLinkProp {
    filename: string,
    url: string,
    source: string,
}

export const PrivateLink = ({filename, url, source}:PrivateLinkProp) => {
    const [getPrivateFile] = useLazyGetPrivateFileQuery();

    const downloadFile = () => {
        getPrivateFile({ dataSource: source, dataId: url })
            .unwrap()
            .then((r: string) => {
                console.log(r);
                let element = document.createElement('a');

                let datatype = "text/plain;charset=utf-8,";
                if (r[0] === '[' || r[0] === '{') {
                    datatype = "text/json;charset=utf-8,";
                } else {
                    if (r.startsWith("%PDF")) {
                        //var blob=new Blob([data]);
                        datatype = "application/pdf;charset=utf-8,";
                    }
                }
                element.setAttribute('href', 'data:' + datatype + encodeURIComponent(r));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            });
    }

    return <MuiLink color="inherit" onClick={downloadFile} sx={{cursor:"pointer"}}>
        {filename}
    </MuiLink>
}