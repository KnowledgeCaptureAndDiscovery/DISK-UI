export const downloadJSON = (str:string, name:string) => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(str);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", name + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export const downloadPlainText = (str:string, name:string) => {
    var dataStr = "data:text;charset=utf-8," + encodeURIComponent(str);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", name);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}