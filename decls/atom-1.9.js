/* @flow */
/* eslint-disable */

declare module 'atom' {
  declare class CompositeDisposable extends Disposable {}
  declare class Disposable {
    static isDisposable(obj: any): boolean,
    add(...args: Array<any>): void,
    dispose(): void
  }
}

declare var atom: Object
