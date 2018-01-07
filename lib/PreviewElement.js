/* @flow */

const LINE_BREAKS_REGEX = /(?:\r\n|\r|\n)/g;

export default document.registerElement("textual-velocity-preview", {
  prototype: Object.assign(Object.create(HTMLElement.prototype), {
    attachedCallback() {},
    attributeChangedCallback() {},
    createdCallback() {},
    detachedCallback() {},

    updatePreview(path: string, content: string, searchRegex?: RegExp) {
      this._path = path;

      if (typeof content === "string") {
        if (searchRegex) {
          const globalRegex = new RegExp(searchRegex, "gi");
          content = content.replace(
            globalRegex,
            match => `<span class="highlight-success">${match}</span>`
          );
        }

        this.innerHTML = content.replace(LINE_BREAKS_REGEX, "<br />");
      }
    },

    getTitle() {
      return "Preview (Textual Velocity)";
    },

    getLongTitle() {
      return this.getTitle();
    },

    getPath() {
      return this._path;
    },

    scrollToFirstHighlightedItem() {
      const el = this.querySelector("span");
      if (el) {
        el.scrollIntoViewIfNeeded();
      }
    },

    dispose() {
      this.remove();
    }
  })
});
