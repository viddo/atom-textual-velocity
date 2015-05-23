h = require 'virtual-dom/h'

module.exports = (width, content = '') ->
  h 'th', {
    style:
      width: "#{width}%"
  }, content
