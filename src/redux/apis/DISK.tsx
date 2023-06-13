import { REACT_APP_DISK_API } from "config";

export interface DownloadFileRequest {
    source: string;
    dataId: string;
}

export class DISK {
    public static headers : RequestInit["headers"] = {
        "Content-Type": "application/json;charset=UTF-8",
    };

    public static setToken (tkn:string) {
        if (tkn) {
            DISK.headers = {
                "Content-Type": "application/json;charset=UTF-8",
                "Authorization": `Bearer ${tkn}`,
            }
        } else {
            DISK.headers = {
                "Content-Type": "application/json;charset=UTF-8",
            }
        }
    }

    public static downloadPrivateFile (req:DownloadFileRequest) {
        return fetch(
            REACT_APP_DISK_API + 'getData', 
            {
                method: 'POST',
                headers: DISK.headers,
                body: JSON.stringify(req)
            }
        );
    }


}