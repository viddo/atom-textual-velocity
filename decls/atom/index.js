declare var atom: Object

declare module 'atom' {
  declare class Disposable {
    dispose (): void,
    static isDisposable (): boolean,
  }
  declare class CompositeDisposable extends Disposable {
    add (): void
  }
  declare var Directory: Class<Object>
}
