declare function advanceClock(ms: number): void;
declare function afterEach(fn: typeof JasmineFn): void;
declare function beforeEach(fn: typeof JasmineFn): void;
declare function describe(desc: string, fn: typeof JasmineFn): void;
declare function xdescribe(desc: string, fn: typeof JasmineFn): void;
declare function expect(actual: any): Object;
declare function it(desc: string, fn: typeof JasmineFn): void;
declare function runs(fn: () => void): void;
declare function spyOn(actual: Object, method: string): Object;
declare function waitsFor(fn: () => boolean): void;
declare function waitsForPromise(fn: () => Promise<any>): void;

declare function JasmineFn(done?: () => void): void;

declare var jasmine: Object;
