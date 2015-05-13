h = require('virtual-dom/h')

module.exports = (width, content = '') ->
  return h 'th', {
    style:
      width: "#{width}%"
  }, content
