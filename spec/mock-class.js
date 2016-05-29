'use babel'

export default function mockClass (Klass) {
  const MockedClass = function () {}

  Object
    .getOwnPropertyNames(Klass.prototype)
    .map(name => {
      const descriptor = Object.getOwnPropertyDescriptor(Klass.prototype, name)

      if (descriptor && !descriptor.enumerable && typeof descriptor.value === 'function') {
        MockedClass.prototype[name] = jasmine.createSpy(name)
      }
    })

  return MockedClass
}
