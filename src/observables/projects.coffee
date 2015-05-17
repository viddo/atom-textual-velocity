Bacon = require 'baconjs'

module.exports = (watchedProjectsStream, removedStream) ->
  return Bacon.update [],
    [watchedProjectsStream], (projects, project) ->
      projects.concat(project)
    [removedStream], (projects, removedPath) ->
      [removedProject] = projects.filter ({ path }) ->
        path is removedPath
      removedProject.task.send('finish') if removedProject
      projects.filter ({ path }) ->
        path isnt removedPath
