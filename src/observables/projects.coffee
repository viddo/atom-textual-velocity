Bacon = require 'baconjs'

# @param {Stream} watchedProjectsStream objects containing a path {String} and a task {Task}
# @param {Stream} removedStream paths that are removed
# @return {Property} array of projects
module.exports = (watchedProjectsStream, removedStream) ->
  Bacon.update [],
    [watchedProjectsStream], (projects, project) ->
      projects.concat(project)
    [removedStream], (projects, removedPath) ->
      [removedProject] = projects.filter ({ path }) ->
        path is removedPath
      removedProject.task.send('finish') if removedProject
      projects.filter ({ path }) ->
        path isnt removedPath
