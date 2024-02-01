/*
* This code can only be used in the main process.
*/

import { app, session, BrowserWindow, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { FileUtils } from "../../utils/main";
import { GetErrorMessage } from "../../utils/shared";
import * as fdTypes from "../shared";

class FileDownload{
  public initialize(){
    this._preloadFilePath = path.join(__dirname, "file-download-preload.js");
    // console.log("File download preload path: " + this._preloadFilePath);
    this.setPreload(session.defaultSession);

    app.on("session-created", (session) => {
      this.setPreload(session);
    });
  }
  
  // Public: Download a file and store it on a file system using streaming with appropriate progress callback.
  // Returns a {Promise} that will accept when complete.
  public async download(options: fdTypes.Options, browserWindow : BrowserWindow | null): Promise<fdTypes.Result>{
    const result : fdTypes.Result = {
      success: false,
      canceled: false,
      error: "",
      uuid: options.uuid,
      fileSize: 0,
    };
  
    if(!this.checkParam(options)){
      throw Error("Param error");
    }
  
    if(await this.checkWhetherHasDownloaded(options)){
      result.success = true;
      result.fileSize = FileUtils.GetFileSize(options.savePath);
      if(options.feedbackProgressToRenderer && browserWindow){
        browserWindow.webContents.send("file-download-progress-feedback", options.uuid, result.fileSize, result.fileSize);
      }
      return result;
    }
  
    const dir = path.dirname(options.savePath);
    if(dir && !FileUtils.IsPathExist(dir)){
      if(!FileUtils.CreateDirectories(dir)){
        throw Error(`Unable to create directory ${dir}`);
      }
    }
    
    const request = new Request(options.url, {
      headers: new Headers({ "Content-Type": "application/octet-stream" })
    });
  
    const response = await fetch(request);
    if(!response.ok){
      throw Error(`Unable to download, server returned ${response.status} ${response.statusText}`);
    }
  
    const body = response.body;
    if(body == null){
      throw Error("No response body");
    }
  
    const finalLength = options.fileSize || parseInt(response.headers.get("Content-Length") || "0", 10);
    const reader = body.getReader();
    const writer = fs.createWriteStream(options.savePath);
  
    this._readerMap.set(options.uuid, reader);
    this._cancelFlagMap.set(options.uuid, false);
  
    await this.streamWithProgress(finalLength, reader, writer, options, browserWindow);
  
    writer.end();
  
    if(options.verifyMd5 && options.md5){
      try {
        const actualMd5 = await FileUtils.GetFileMd5(options.savePath);
        if(actualMd5.toLowerCase() != options.md5.toLowerCase()){
          throw Error(`${actualMd5} is not equal to ${options.md5}`);
        }
      } catch (e){
        throw Error(`Hash verification not pass: ${GetErrorMessage(e)}`);
      }
    }
  
    result.success = true;
    result.fileSize = FileUtils.GetFileSize(options.savePath);
    return result;
  }

  public cancel(uuid: string){
    if(uuid){
      if(this._readerMap.has(uuid) && this._cancelFlagMap.has(uuid)){
        const reader = this._readerMap.get(uuid);
        if(reader){
          this._cancelFlagMap.set(uuid, true);
          reader.cancel();
        }
      }
    }
  }

  protected checkParam(options: fdTypes.Options) : boolean{
    if(!options.uuid)
      return false;
  
    if(!options.url)
      return false;
  
    if(!options.savePath)
      return false;
  
    if(options.verifyMd5 && !options.md5)
      return false;
  
    return true;
  }
  
  protected async checkWhetherHasDownloaded(options: fdTypes.Options) : Promise<boolean>{
    if(options.skipWhenFileExist){
      if(FileUtils.IsPathExist(options.savePath)){
        return true;
      }
    }
          
    if(options.skipWhenMd5Same && options.md5){
      if(FileUtils.IsPathExist(options.savePath)){
        try {
          const curMd5 = await FileUtils.GetFileMd5(options.savePath);
          if(curMd5.toLowerCase() == options.md5.toLowerCase()){
            return true;
          }
        } catch (e){
          (e);
        }
      }
    }
  
    return false;
  }
  
  // Stream from a {ReadableStreamReader} to a {WriteStream} with progress callback.
  // Returns a {Promise} that will accept when complete.
  protected async streamWithProgress(
    finalLength: number,
    reader: ReadableStreamReader<Uint8Array>,
    writer: fs.WriteStream,
    options : fdTypes.Options,
    browserWindow: BrowserWindow | null
  ): Promise<void>{
    let bytesDone = 0;
  
    for (;;){
      const result = await reader.read(new Uint8Array());
      if(result.done){
        if(options.feedbackProgressToRenderer && browserWindow){
          browserWindow.webContents.send("electron-file-download-download-file-progress-feedback", options.uuid, bytesDone, finalLength);
        }
  
        if(this._cancelFlagMap.get(options.uuid)){
          this._cancelFlagMap.delete(options.uuid);
          this._readerMap.delete(options.uuid);
          throw new fdTypes.CancelError();
        }
        
        this._cancelFlagMap.delete(options.uuid);
        this._readerMap.delete(options.uuid);
        return;
      }
  
      const chunk = result.value;
      if(chunk == null){
        throw Error("Empty chunk received during download");
      }else{
        writer.write(Buffer.from(chunk));
        if(options.feedbackProgressToRenderer && browserWindow){
          bytesDone += chunk.byteLength;
          browserWindow.webContents.send("electron-file-download-download-file-progress-feedback", options.uuid, bytesDone, finalLength);
        }
      }
    }
  }
  
  protected setPreload(session){
    session.setPreloads([ ...session.getPreloads(), this._preloadFilePath ]);
  }

  protected _preloadFilePath : string = "";
  protected _readerMap = new Map();
  protected _cancelFlagMap = new Map();
}

const fd = new FileDownload();

// According to bug https://github.com/electron/electron/issues/25196
// Electron can not pass rejected promise to renderer correctly.
// So we do not throw exception in handle function.
ipcMain.handle("electron-file-download-async-download-file", async(event, options: fdTypes.Options) => {
  const win = BrowserWindow.getFocusedWindow();
  try {
    const result = await fd.download(options, win);
    return result;
  } catch (err){
    const result : fdTypes.Result = {
      uuid: options.uuid,
      success: false,
      canceled: false,
      error: GetErrorMessage(err),
      fileSize: 0,
    };
    return result;
  }
});

ipcMain.on("electron-file-download-cancel-download-file", (event, uuid) => {
  if(uuid){
    fd.cancel(uuid);
  }
});

export default fd;