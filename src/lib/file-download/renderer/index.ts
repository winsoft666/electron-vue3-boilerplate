/* eslint-disable @typescript-eslint/no-explicit-any */

/*
* This code can only be used in the renderer process.
*/
import { Options, ProgressCallback } from "../shared";

class FileDownload{
  public async download(options: Options, progressCb : ProgressCallback){
    if(progressCb && options.uuid){
      this._callbackMap.set(options.uuid, progressCb);
    }
    return (window as any).__ElectronFileDownload__.asyncDownloadFile(options);
  }

  public cancel(uuid: string){
    if(uuid){
      (window as any).__ElectronFileDownload__.cancelDownloadFile(uuid);
    }
  }

  public emitCallback(uuid: string, bytesDone: number, bytesTotal: number){
    if(this._callbackMap.has(uuid)){
      const cb = this._callbackMap.get(uuid) as ProgressCallback;
      if(cb){
        cb(uuid, bytesDone, bytesTotal);
      }
    }
  }

  protected _callbackMap = new Map();
}

(window as any).__ElectronFileDownload__.onDownloadFilePrgressFeedback((uuid: string, bytesDone: number, bytesTotal: number) => {
  console.log("onDownloadFilePrgressFeedback", uuid, bytesDone);
  fd.emitCallback(uuid, bytesDone, bytesTotal);
});

const fd = new FileDownload();

export default fd;