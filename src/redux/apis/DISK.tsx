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
}