/*
* This code can be used in both renderer and main process.
*/

import { v4 as uuidv4 } from "uuid";

class Options{
  /**
  The unique id for each download, can use this uuid to cancel download.
  */
  uuid: string = uuidv4();

  /**
  The file url.
  */
  url: string = "";

  /**
  The path to save the file in.
  The downloader will automatically create directories.
  */
  savePath: string = "";

  /**
  Specify file size to avoid missing a "Content-Length" in the response header.
  This value only used in progress callback.
  */
  fileSize: number = 0;

  /**
  Whether send download pogress to renderer process or not.
  If set true, will send 'file-download-progress-feedback' to renderer.
  */
  feedbackProgressToRenderer: boolean = false;

  /**
  The MD5 value of target file.
  */
  md5: string = "";

  /**
  Whether skip download when target file exist.
  */
  skipWhenFileExist: boolean = false;

  /**
  Whether skip download when target file exist and the md5 is same.
  */
  skipWhenMd5Same: boolean = false;

  /**
  Whether verify target file md5 after download finished.
  */
  verifyMd5: boolean = false;
}

class CancelError extends Error{}
  
interface Result{
  uuid: string;
  success: boolean;
  canceled: boolean;
  error: string;
  fileSize: number;
}

interface ProgressCallback {
  (uuid: string, bytesDone: number, bytesTotal: number): void;
}

export {
  CancelError,
  Options,
  type Result,
  type ProgressCallback,
};