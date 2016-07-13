'use babel'

export default class Summary {

  get id () {
    return 'summary'
  }

  get title () {
    return 'Summary'
  }

  get width () {
    return 70
  }

  get field () {
    return 'name'
  }

  cellContent (file) {
    const content = file.content
    return [file.path, '-', content.slice(0, 100)]
  }
}
