const RE_LINKS = /\[(.*?)\]\((.*?)\)/g;

export const renderDescription = (text:string) => {
    return text.replaceAll(RE_LINKS, '<a target="_blank" href="$2">$1</a>');
}