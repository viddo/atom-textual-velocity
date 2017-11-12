declare var atom: Object
declare var emit: Function // only available in Task context https://atom.io/docs/api/latest/Task
declare type atom$Panel = Object
declare interface atom$IDisposable {
  dispose (): void
}
declare type atom$PathWatcher = {
  getStartPromise (): Promise<void>;
  onDidError (err: Error): atom$IDisposable;
  dispose (): void;
}

declare type atom$PathWatcherEvent =
  | atom$PathWatcherCreatedEvent
  | atom$PathWatcherDeletedEvent
  | atom$PathWatcherModifiedEvent
  | atom$PathWatcherRenamedEvent
  ;
type atom$PathWatcherCreatedEvent = {
  action: 'created',
  path: string
}
type atom$PathWatcherDeletedEvent = {
  action: 'deleted',
  path: string
}
type atom$PathWatcherModifiedEvent = {
  action: 'modified',
  path: string
}
type atom$PathWatcherRenamedEvent = {
  action: 'renamed',
  path: string,
  oldPath: string
}


// https://atom.io/docs/api/v1.22.0/PathWatcher
declare module 'atom' {
  declare class Disposable {
    constructor (...values: Array<atom$IDisposable | Function>): void,
    dispose (): void,
    static isDisposable (object: Object): boolean
  }
  declare class CompositeDisposable extends Disposable {
    add (...values: Array<atom$IDisposable>): void
  }
  declare var Directory: Class<Object>;
  declare var Task: any;
  declare var watchPath: (dir: string, options: {}, handler: (events: atom$PathWatcherEvent[]) => void) => Promise<atom$PathWatcher> | atom$PathWatcher
}
