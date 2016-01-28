'use babel'

import receiveMessagesFrom from '../lib/receive-messages-from'

describe('receiveMessagesFrom', () => {
  let [process, messageReceiver] = []

  beforeEach(() => {
    process = jasmine.createSpyObj('process', ['on'])
    messageReceiver = receiveMessagesFrom(process)
  })

  it('creates a receiver object', () => {
    expect(messageReceiver).toBeDefined()
  })

  describe('.createStream', () => {
    let [onValueSpy, stream] = []

    beforeEach(() => {
      onValueSpy = jasmine.createSpy('side-effects')
      stream = messageReceiver.createStream('foobar')
      stream.onValue(onValueSpy)
      process.on.calls[0].args[1]({
        name: 'wtf',
        payload: '1st'
      })
      process.on.calls[0].args[1]({
        name: 'foobar',
        payload: '2nd'
      })
    })

    it('return a new stream', () => {
      expect(stream).toBeDefined()
    })

    it('stream gets data only for its given name', () => {
      expect(onValueSpy).toHaveBeenCalled()
      expect(onValueSpy.calls.length).toEqual(1)
      expect(onValueSpy).toHaveBeenCalledWith('2nd')
    })
  })
})
