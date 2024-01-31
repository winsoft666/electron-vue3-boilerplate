/* eslint-disable */
export class Singleton{
  static instance<T extends {}>(this: new() => T): T{
    if(!(<any> this)._instance)
      (<any> this)._instance = new this()

    return (<any> this)._instance
  }
}
