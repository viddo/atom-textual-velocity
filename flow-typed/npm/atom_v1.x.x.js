declare var atom: Object
declare var emit: Function // only available in Task context https://atom.io/docs/api/latest/Task
declare type atom$Panel = Object
declare interface atom$IDisposable {
  dispose (): void
}

declare module 'atom' {
  declare class Disposable {
    constructor (...values: Array<atom$IDisposable | Function>): void,
    dispose (): void,
    static isDisposable (object: Object): boolean
  }
  declare class CompositeDisposable extends Disposable {
    add (...values: Array<atom$IDisposable>): void
  }
  declare var Directory: Class<Object>
  declare var Task: any
}
