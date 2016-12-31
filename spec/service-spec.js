/* @flow */

import R from 'ramda'
import Service from '../lib/service'

describe('service', function () {
  let spies, service

  beforeEach(function () {
    spies = {
      columnsP: jasmine.createSpy('columnsP'),
      fieldsP: jasmine.createSpy('fieldsP'),
      fileReadersP: jasmine.createSpy('fileReadersP'),
      fileWritersP: jasmine.createSpy('fileWritersP')
    }

    service = new Service()
    service.columnsP.onValue(spies.columnsP)
    service.fieldsP.onValue(spies.fieldsP)
    service.fileReadersP.onValue(spies.fileReadersP)
    service.fileWritersP.onValue(spies.fileWritersP)

    spies.columnsP.reset()
    spies.fieldsP.reset()
    spies.fileReadersP.reset()
    spies.fileWritersP.reset()
  })

  afterEach(function () {
    service.dispose()
  })

  describe('.v0', function () {
    let v0

    beforeEach(function () {
      v0 = service.v0()
    })

    describe('.registerColumns', function () {
      let column

      beforeEach(function () {
        column = {
          title: 'Custom column',
          description: 'Just for testing',
          sortField: 'custom',
          width: 33,
          cellContent: (file, res) => 'cellContent'
        }
        v0.registerColumns(column)
      })

      it('should register a new column', function () {
        expect(spies.columnsP).toHaveBeenCalledWith([column])
        expect(spies.fieldsP).not.toHaveBeenCalled()
        expect(spies.fileReadersP).not.toHaveBeenCalled()
        expect(spies.fileWritersP).not.toHaveBeenCalled()
      })

      it('should throw error on invalid input', function () {
        const column = {
          title: 'valid',
          sortField: {
            value: 'valid',
            description: 'Valid'
          },
          width: 100,
          cellContent: () => ''
        }

        spyOn(console, 'warn')
        spyOn(console, 'error')
        v0.registerColumns(R.omit('title', column))
        expect(console.error).toHaveBeenCalled()

        console.error.reset()
        v0.registerColumns(R.omit('sortField', column))
        expect(console.error).toHaveBeenCalled()

        console.error.reset()
        v0.registerColumns(R.omit('cellContent', column))
        expect(console.error).toHaveBeenCalled()

        expect(console.warn).not.toHaveBeenCalled()
      })
    })

    describe('.registerFields', function () {
      it('should register a new field', function () {
        const field = {
          notePropName: 'test',
          value: file => 'val'
        }
        v0.registerFields(field)
        expect(spies.columnsP).not.toHaveBeenCalled()
        expect(spies.fieldsP).toHaveBeenCalledWith([field])
        expect(spies.fileReadersP).not.toHaveBeenCalled()
        expect(spies.fileWritersP).not.toHaveBeenCalled()
      })
    })

    describe('.registerFileReaders', function () {
      let fileReader

      it('should register a new file reader', function () {
        fileReader = {
          notePropName: 'test',
          read: (path, callback) => {}
        }
        v0.registerFileReaders(fileReader)
        expect(spies.columnsP).not.toHaveBeenCalled()
        expect(spies.fieldsP).not.toHaveBeenCalled()
        expect(spies.fileReadersP).toHaveBeenCalledWith([fileReader])
        expect(spies.fileWritersP).not.toHaveBeenCalled()
      })

      describe('.deregisterFileReaders', function () {
        it('should deregister an existing file reader', function () {
          v0.deregisterFileReaders(fileReader)
          expect(spies.fileReadersP).toHaveBeenCalledWith([])
        })
      })
    })

    describe('.registerFileWriters', function () {
      it('should register a new file writer', function () {
        const fileWriter = {
          editCellName: 'test',
          write: (path, str, callback) => {}
        }
        v0.registerFileWriters(fileWriter)
        expect(spies.columnsP).not.toHaveBeenCalled()
        expect(spies.fieldsP).not.toHaveBeenCalled()
        expect(spies.fileReadersP).not.toHaveBeenCalled()
        expect(spies.fileWritersP).toHaveBeenCalledWith([fileWriter])
      })
    })
  })
})
