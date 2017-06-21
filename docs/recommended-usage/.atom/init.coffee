# Init script to register global shortcut and hide tree-view when session is started
atom.packages.onDidActivatePackage (pkg) ->
  return if pkg.name isnt 'textual-velocity'

  # Try register the global shortcut
  remote = require 'remote'
  globalShortcut = remote.require 'global-shortcut'
  # note that key combo syntax is _not_ the same as for keymaps!
  # see https://github.com/atom/electron/blob/master/docs/api/global-shortcut.md for details
  keyCombo = 'cmd+shift+space'
  ret = globalShortcut.register keyCombo, ->
    target = document.body.querySelector('atom-workspace')
    atom.commands.dispatch(target, 'textual-velocity:toggle-atom-window')
  if ret
    atom.notifications.addSuccess "Registered #{keyCombo} to toggle this Atom window", {
      description: ''
      dismissable: true
    }
  else
    atom.notifications.addWarning "Could not register #{keyCombo} as shortcut", {
      description: 'Probably already registered by another app or window, try restarted atom completely'
      dismissable: true
    }

  # Hide tree-view when package is activated
  try
    treeViewMainModule = atom.packages.getActivePackage('tree-view').mainModule
    treeViewMainModule.createOrDestroyTreeViewIfNeeded()
    treeViewMainModule.getTreeViewInstance().hide()
  catch err
    console.error(err)
    atom.notifications.addWarning 'Could not hide tree view', {
      detail: 'See the console for the error'
      dismissable: true
    }

# Activate package right away
target = document.body.querySelector('atom-workspace')
atom.commands.dispatch(target, 'textual-velocity:start-session')
