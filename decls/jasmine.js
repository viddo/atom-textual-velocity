declare function advanceClock (ms: number): void
declare function beforeEach (): void
declare function afterEach (): void
declare function describe (desc: string, fn: JasmineFn): void
declare function it (desc: string, fn: JasmineFn): void
declare function expect (actual: Object): Object
declare function spyOn (actual: Object): Object

declare function JasmineFn (done?: Function): void

declare var jasmine: Object
