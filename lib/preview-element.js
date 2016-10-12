/* @flow */

const LINE_BREAKS_REGEX = /(?:\r\n|\r|\n)/g

export default document.registerElement('textual-velocity-preview', {
  prototype: Object.assign(Object.create(HTMLElement.prototype), {

    setNote (path: string, content: string) {
      this._path = path
      this.innerHTML = content.replace(LINE_BREAKS_REGEX, '<br />')
    },

    attachedCallback () {
      this._clickListener = () => {
        if (this._path) {
          atom.workspace.open(this._path)
        }
      }
      this.addEventListener('click', this._clickListener)
    },

    detachedCallback () {
      this.removeEventListener('click', this._clickListener)
    },

    setNot (path: string, content: string) {
      this._path = path
      this.innerHTML = content.replace(LINE_BREAKS_REGEX, '<br />')
    },

    clear () {
      this._path = null
      this.innerHTML = ''
    },

    getTitle () {
      return 'Preview (Textual Velocity)'
    },

    getLongTitle () {
      return this.getTitle()
    },

    getPath () {
      return this._path
    },

    dispose () {
      this.remove()
    }
  })
})
