'use babel'
/* global process, emit */

import PathsWatcher from './paths-watcher'
import receiveMessagesFrom from './receive-messages-from'

export default function () {
  const terminate = this.async()
  const messageReceiver = receiveMessagesFrom(process)

  const pathsWatcher = new PathsWatcher({
    openProjectPathStream: messageReceiver.createStream('openProjectPath'),
    closeProjectPathStream: messageReceiver.createStream('closeProjectPath'),
    paginateLastQueryStream: messageReceiver.createStream('paginateLastQuery'),
    queryStream: messageReceiver.createStream('query')
  })

  const unsubResults = pathsWatcher.resultsStream.onValue(r => emit('results', r))

  messageReceiver.createStream('dispose').onValue(() => {
    unsubResults()
    pathsWatcher.dispose()
    terminate()
  })
}
