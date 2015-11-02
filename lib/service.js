'use babel'

// Gives semantic interface for which external services can interact with the Repositories
// Intentionally limited to bare minimum functions, services should not modify the repositories directly
class Service {

  constructor (repositories) {
    this._repositories = repositories
  }

  setRepository (repository) {
    this._repositories.add(repository)
  }

  dispose () {
    this._repositories = null
  }
}

export default Service
