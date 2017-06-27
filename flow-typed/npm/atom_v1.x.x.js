declare var atom: Object
declare var emit: Function // only available in Task context https://atom.io/docs/api/latest/Task
declare type Atom$Panel = Object
declare interface IDisposable {
  dispose (): void
}

declare module 'atom' {
  declare class Disposable {
    constructor (...values: Array<IDisposable | Function>): void,
    dispose (): void,
    static isDisposable (object: Object): boolean
  }
  declare class CompositeDisposable extends Disposable {
    add (...values: Array<IDisposable>): void
  }
  declare var Directory: Class<Object>
  declare var Task: any
}
