/* @flow */

import R from 'ramda'
import Service from '../lib/service'

describe('service', function () {
  let spies, service

  beforeEach(function () {
    spies = {
      columnsProp: jasmine.createSpy('columnsProp'),
      fieldsProp: jasmine.createSpy('fieldsProp'),
      fileReadersProp: jasmine.createSpy('fileReadersProp'),
      fileWritersProp: jasmine.createSpy('fileWritersProp')
    }

    service = new Service()
    service.columnsProp.onValue(spies.columnsProp)
    service.fieldsProp.onValue(spies.fieldsProp)
    service.fileReadersProp.onValue(spies.fileReadersProp)
    service.fileWritersProp.onValue(spies.fileWritersProp)

    spies.columnsProp.reset()
    spies.fieldsProp.reset()
    spies.fileReadersProp.reset()
    spies.fileWritersProp.reset()
  })

  afterEach(function () {
    service.dispose()
  })

  describe('.publicAPI', function () {
    let publicAPI

    beforeEach(function () {
      publicAPI = service.publicAPI()
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
        publicAPI.registerColumns(column)
      })

      it('should register a new column', function () {
        expect(spies.columnsProp).toHaveBeenCalledWith([column])
        expect(spies.fieldsProp).not.toHaveBeenCalled()
        expect(spies.fileReadersProp).not.toHaveBeenCalled()
        expect(spies.fileWritersProp).not.toHaveBeenCalled()
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
        publicAPI.registerColumns(R.omit('title', column))
        expect(console.error).toHaveBeenCalled()

        console.error.reset()
        publicAPI.registerColumns(R.omit('sortField', column))
        expect(console.error).toHaveBeenCalled()

        console.error.reset()
        publicAPI.registerColumns(R.omit('cellContent', column))
        expect(console.error).toHaveBeenCalled()

        expect(console.warn).not.toHaveBeenCalled()
      })
    })

    describe('.registerFields', function () {
      it('should register a new field', function () {
        const field = {
          filePropName: 'test',
          value: file => 'val'
        }
        publicAPI.registerFields(field)
        expect(spies.columnsProp).not.toHaveBeenCalled()
        expect(spies.fieldsProp).toHaveBeenCalledWith([field])
        expect(spies.fileReadersProp).not.toHaveBeenCalled()
        expect(spies.fileWritersProp).not.toHaveBeenCalled()
      })
    })

    describe('.registerFileReaders', function () {
      it('should register a new file reader', function () {
        const fileReader = {
          filePropName: 'test',
          read: (path, callback) => {}
        }
        publicAPI.registerFileReaders(fileReader)
        expect(spies.columnsProp).not.toHaveBeenCalled()
        expect(spies.fieldsProp).not.toHaveBeenCalled()
        expect(spies.fileReadersProp).toHaveBeenCalledWith([fileReader])
        expect(spies.fileWritersProp).not.toHaveBeenCalled()
      })
    })

    describe('.registerFileWriters', function () {
      it('should register a new file writer', function () {
        const fileWriter = {
          editCellName: 'test',
          write: (path, str, callback) => {}
        }
        publicAPI.registerFileWriters(fileWriter)
        expect(spies.columnsProp).not.toHaveBeenCalled()
        expect(spies.fieldsProp).not.toHaveBeenCalled()
        expect(spies.fileReadersProp).not.toHaveBeenCalled()
        expect(spies.fileWritersProp).toHaveBeenCalledWith([fileWriter])
      })
    })
  })
})
