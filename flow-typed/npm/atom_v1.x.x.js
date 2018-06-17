declare var emit: Function; // only available in Task context https://atom.io/docs/api/latest/Task
declare interface atom$IDisposable {
  dispose(): void;
}
declare type atom$Point = {
  row: number,
  column: number,
}
declare type atom$ChangeCursorPositionEvent = {
  newBufferPosition: atom$Point,
  textChanged: boolean,
}
declare type atom$PathWatcher = {
  getStartPromise(): Promise<void>,
  onDidError(fn: (error: Error) => void): atom$IDisposable,
  dispose(): void
};

declare type atom$PathWatcherEvent =
  | atom$PathWatcherCreatedEvent
  | atom$PathWatcherDeletedEvent
  | atom$PathWatcherModifiedEvent
  | atom$PathWatcherRenamedEvent;
type atom$PathWatcherCreatedEvent = {
  action: "created",
  path: string
};
type atom$PathWatcherDeletedEvent = {
  action: "deleted",
  path: string
};
type atom$PathWatcherModifiedEvent = {
  action: "modified",
  path: string
};
type atom$PathWatcherRenamedEvent = {
  action: "renamed",
  path: string,
  oldPath: string
};

type SetTextOptions = {
  bypassReadOnly?: boolean
};

type TextEditorParams = {
  // only added the ones used
  // https://github.com/atom/atom/blob/v1.27.2/src/text-editor.js#L135-L167
  readOnly?: boolean
};

declare class atom$TextEditor {
  onDidDestroy(callback: () => mixed): atom$IDisposable,
  onDidChangeCursorPosition(callback: (event: atom$ChangeCursorPositionEvent) => mixed): atom$IDisposable,
  onWillInsertText(callback: (cancel: Function) => mixed): atom$IDisposable,

  isAlive(): boolean,
  cursorMoved(event: atom$ChangeCursorPositionEvent): void,
  destroy(): void,
  getFileName(): string,
  setText(text: string, options?: SetTextOptions): void,
  getText(): void,

  // define as invariants so we can override them in preview
  isModified: () => boolean,
  getLongTitle:() => string,
  getPath:() => ?string,
  getTitle: () => string,
  getURI: () => ?string,
  setPath: (filePath: string) => void
}

type WorkspaceOpenParams = {
  activatePane?: boolean,
  searchAllPanes?: boolean
}

declare class atom$Panel {
  getItem(): HTMLElement,
  destroyItem(item: mixed): void,
  isVisible(): boolean,
  hide(): void,
  show(): void,
  destroy(): void
}

declare class atom$Workspace {
  buildTextEditor: (params: TextEditorParams) => atom$TextEditor,
  closeActivePaneItemOrEmptyPaneOrWindow(): void,
  getPaneItems(): HTMLElement[],
  open(filePath: string, params?: ?WorkspaceOpenParams): Promise<*>,
  addOpener(callback: (uri: string) => mixed): atom$IDisposable,
  addTopPanel(params: {item: HTMLElement}): atom$Panel,
  getTopPanels(): atom$Panel[],
  getTextEditors(): atom$TextEditor[],
  getActiveTextEditor(): atom$TextEditor,
  paneForItem(item: mixed): atom$Panel
}
declare var atom: {
  workspace: atom$Workspace
} & Object;

// https://atom.io/docs/api/v1.22.0/PathWatcher
declare module "atom" {
  declare export type Panel = atom$Panel;

  declare class Disposable {
    constructor(...values: Array<atom$IDisposable | Function>): void;
    dispose(): void;
    static isDisposable(object: Object): boolean;
  }
  declare class CompositeDisposable extends Disposable {
    add(...values: Array<atom$IDisposable>): void;
  }
  declare var Directory: Class<Object>;
  declare var Task: any;
  declare var watchPath: (
    rootPath: string,
    options: {},
    eventCallback: (events: atom$PathWatcherEvent[]) => void
  ) => Promise<atom$PathWatcher>;
}
