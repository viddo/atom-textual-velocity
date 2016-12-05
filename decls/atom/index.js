declare var atom: Object
declare var emit: Function // only available in Task context https://atom.io/docs/api/latest/Task

declare module 'atom' {
  declare class Disposable {
    dispose (): void,
    static isDisposable (): boolean,
  }
  declare class CompositeDisposable extends Disposable {
    add (): void
  }
  declare var Directory: Class<Object>
  declare var Task: any
}
