'use babel'

import {Disposable} from 'atom'
import NewUserRepository from './new-user-repository'

export default {

  consumeNotationalServiceV0 (service) {
    service.setRepository(new NewUserRepository())
    return new Disposable(() => {})
  }
}
