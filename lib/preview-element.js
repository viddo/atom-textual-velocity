/* @flow */

const LINE_BREAKS_REGEX = /(?:\r\n|\r|\n)/g

export default document.registerElement('textual-velocity-preview', {
  prototype: Object.assign(Object.create(HTMLElement.prototype), {

    updatePreview (path: string, content: string, searchRegex?: RegExp) {
      this._path = path

      if (searchRegex) {
        const globalRegex = new RegExp(searchRegex, 'gi')
        content = content.replace(globalRegex, match => `<span class="highlight-success">${match}</span>`)
      }

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

    scrollToFirstHighlightedItem () {
      const el = this.querySelector('span')
      if (el) {
        el.scrollIntoViewIfNeeded()
      }
    },

    dispose () {
      this.remove()
    }

  })
})
