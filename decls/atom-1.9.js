/* @flow */
/* eslint-disable */

declare module atom {
  declare class CompositeDisposable extends Disposable {}
  declare class Disposable {
    static isDisposable(obj: any): boolean,
    add(...args: Array<any>): void,
    dispose(): void
  }
}

declare class AtomPanel {
  destroy(): void,
  onDidChangeVisible(fn: (visible: boolean) => void): atom.Disposable,
  onDidDestroy(fn: (panel: AtomPanel) => void): atom.Disposable,
  getItem(): HTMLElement,
  getPriority(): number,
  isVisible(): boolean,
  hide(): void,
  show(): void
}

declare var atom: Object & {
  workspace: {
    addTopPanel(params: {
      item: HTMLElement,
      visible?: boolean,
      priority?: number
    }): AtomPanel
  }
}
