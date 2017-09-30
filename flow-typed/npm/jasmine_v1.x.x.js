declare function advanceClock (ms: number): void
declare function afterEach (fn: JasmineFn): void
declare function beforeEach (fn: JasmineFn): void
declare function describe (desc: string, fn: JasmineFn): void
declare function xdescribe (desc: string, fn: JasmineFn): void
declare function expect (actual: any): Object
declare function it (desc: string, fn: JasmineFn): void
declare function runs (fn: Function): void
declare function spyOn (actual: Object, method: string): Object
declare function waitsFor (fn: Function): void
declare function waitsForPromise (fn: Function): void

declare function JasmineFn (done?: Function): void

declare var jasmine: Object
