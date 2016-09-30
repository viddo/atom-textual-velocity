declare var atom: Object

declare type Atom$CompositeDisposable = any
declare type Atom$Disposable = any

declare module 'atom' {
  declare var CompositeDisposable: Atom$CompositeDisposable
  declare var Disposable: Atom$Disposable
  declare var Directory: Class<Object>
}
