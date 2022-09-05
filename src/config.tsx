export {};

declare global {
  interface Window {
    REACT_APP_DISK_API: string;
  }
}


const REACT_APP_DISK_API: string = window.REACT_APP_DISK_API || "";


export { REACT_APP_DISK_API };
