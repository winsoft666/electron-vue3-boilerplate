/**
 * @file 与文件处理相关的通用方法
 */
import crypto from "crypto";
import fs from "fs";

// Synchronous check file or directory exist.
function IsPathExist(path: string) : boolean{
  let exist = false;
  try {
    if(path){
      fs.accessSync(path, fs.constants.F_OK);
      exist = true;
    }
  } catch (err){
    exist = false;
  }
  return exist;
}

// Synchronous get file size
function GetFileSize(filePath: string) : number{
  let fileSize = -1;
  try {
    if(filePath){
      const stat = fs.statSync(filePath);
      fileSize = stat.size;
    }
  } catch (err){
    fileSize = -1;
  }

  return fileSize;
}

// Syncronous recursive create directories.
function CreateDirectories(path: string) : boolean{
  let result = false;
  try {
    if(path){
      fs.mkdirSync(path, { recursive: true });
      result = true;
    }
  } catch (err){
    result = false;
  }
  return result;
}

// Asynchronous computation of file md5
function GetFileMd5(filePath: string) : Promise<string>{
  return new Promise((resolve, reject) => {
    if(!filePath){
      reject("File path is empty");
      return;
    }

    if(IsPathExist(filePath)){
      const stream = fs.createReadStream(filePath);
      const hash = crypto.createHash("md5");
      stream.on("data", (chunk) => {
        hash.update(chunk);
      });
      stream.on("end", () => {
        const md5 = hash.digest("hex").toLowerCase();
        resolve(md5);
      });
      stream.on("error", function(err){
        reject(err);
      });
    }else{
      reject("File not exist");
    }
  });
}

export {
  GetFileMd5,
  GetFileSize,
  IsPathExist,
  CreateDirectories,
};