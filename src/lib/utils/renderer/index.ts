/* eslint-disable @typescript-eslint/no-explicit-any */

class Utils{
  public openDevTools(){
    (window as any).__ElectronUtils__.openDevTools();
  }

  public openExternalLink(url : string){
    (window as any).__ElectronUtils__.openExternalLink(url);
  }

  public checkPathExist(path : string) : boolean{
    return (window as any).__ElectronUtils__.checkPathExist(path) as boolean;
  }
}

const utils = new Utils();

export default utils;