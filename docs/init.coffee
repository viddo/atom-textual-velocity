# ~/.atom/init.coffee
# Init script to start textual-velocity on startup if one of project folders matches a specific dir
# Change this to where you have your notes, and what key combo to toggle Atom window:
pathToMyNotes = '/Users/username/my-notes'
keyCombo = 'cmd+shift+space'

isMyNotesPath = !!atom.project.getPaths().find (p) ->
  p.startsWith(pathToMyNotes)
if isMyNotesPath
  # Start textual-velocity package on startup
  workspaceView = atom.views.getView(atom.workspace)
  atom.commands.dispatch(workspaceView, 'textual-velocity:start-session')

  # Hide tree-view, since we want to use the textual-velocity to find/select files
  atom.packages.onDidActivatePackage (pkg) ->
    if pkg.name is 'tree-view'
      treeView = atom.packages.getActivePackage('tree-view').mainModule.createView()
      if treeView.isVisible()
        treeView.toggle()

  # Try register the global shortcut
  remote = require 'remote'
  globalShortcut = remote.require 'global-shortcut'
  ret = globalShortcut.register keyCombo, ->
    target = document.body.querySelector('atom-workspace')
    atom.commands.dispatch(target, 'textual-velocity:toggle-atom-window')
  unless ret
    atom.notifications.addWarning("Could not register #{keyCombo} as shortcut")
