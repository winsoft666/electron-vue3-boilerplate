import fs from "fs";
import path from "path";
import { IsPathExist, GetFileMd5, GetFileSize, CreateDirectories } from "./file-util";
import { Singleton } from "./singleton";
import * as fdTypes from "../../shared/file-download-types";
import { BrowserWindow } from "electron";
import { GetErrorMessage } from "../../shared/error-utils";

class DownloadManager extends Singleton{
  public readerMap = new Map();
  public cancelFlagMap = new Map();
}

function checkParam(options: fdTypes.Options) : boolean{
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

async function checkWhetherHasDownloaded(options: fdTypes.Options) : Promise<boolean>{
  if(options.skipWhenFileExist){
    if(IsPathExist(options.savePath)){
      return true;
    }
  }
        
  if(options.skipWhenMd5Same && options.md5){
    if(IsPathExist(options.savePath)){
      try {
        const curMd5 = await GetFileMd5(options.savePath);
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

// Public: Download a file and store it on a file system using streaming with appropriate progress callback.
// Returns a {Promise} that will accept when complete.
async function Download(options: fdTypes.Options, browserWindow : BrowserWindow | null): Promise<fdTypes.Result>{
  const result : fdTypes.Result = {
    success: false,
    canceled: false,
    error: "",
    uuid: options.uuid,
    fileSize: 0,
  };

  if(!checkParam(options)){
    throw Error("Param error");
  }

  if(await checkWhetherHasDownloaded(options)){
    result.success = true;
    result.fileSize = GetFileSize(options.savePath);
    if(options.feedbackProgressToRenderer && browserWindow){
      browserWindow.webContents.send("file-download-progress-feedback", options.uuid, result.fileSize, result.fileSize);
    }
    return result;
  }

  const dir = path.dirname(options.savePath);
  if(dir && !IsPathExist(dir)){
    if(!CreateDirectories(dir)){
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

  DownloadManager.instance().readerMap.set(options.uuid, reader);
  DownloadManager.instance().cancelFlagMap.set(options.uuid, false);

  await streamWithProgress(finalLength, reader, writer, options, browserWindow);

  writer.end();

  if(options.verifyMd5 && options.md5){
    try {
      const actualMd5 = await GetFileMd5(options.savePath);
      if(actualMd5.toLowerCase() != options.md5.toLowerCase()){
        throw Error(`${actualMd5} is not equal to ${options.md5}`);
      }
    } catch (e){
      throw Error(`Hash verification not pass: ${GetErrorMessage(e)}`);
    }
  }

  result.success = true;
  result.fileSize = GetFileSize(options.savePath);
  return result;
}

// Stream from a {ReadableStreamReader} to a {WriteStream} with progress callback.
// Returns a {Promise} that will accept when complete.
async function streamWithProgress(
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
        browserWindow.webContents.send("file-download-progress-feedback", options.uuid, bytesDone, finalLength);
      }

      if(DownloadManager.instance().cancelFlagMap.get(options.uuid)){
        DownloadManager.instance().cancelFlagMap.delete(options.uuid);
        DownloadManager.instance().readerMap.delete(options.uuid);
        throw new fdTypes.CancelError();
      }
      
      DownloadManager.instance().cancelFlagMap.delete(options.uuid);
      DownloadManager.instance().readerMap.delete(options.uuid);
      return;
    }

    const chunk = result.value;
    if(chunk == null){
      throw Error("Empty chunk received during download");
    }else{
      writer.write(Buffer.from(chunk));
      if(options.feedbackProgressToRenderer && browserWindow){
        bytesDone += chunk.byteLength;
        browserWindow.webContents.send("file-download-progress-feedback", options.uuid, bytesDone, finalLength);
      }
    }
  }
}

function Cancel(uuid: string){
  if(uuid){
    if(DownloadManager.instance().readerMap.has(uuid) && DownloadManager.instance().cancelFlagMap.has(uuid)){
      const reader = DownloadManager.instance().readerMap.get(uuid);
      if(reader){
        DownloadManager.instance().cancelFlagMap.set(uuid, true);
        reader.cancel();
      }
    }
  }
}

export {
  Download,
  Cancel
};
