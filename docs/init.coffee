# ~/.atom/init.coffee
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
  unless ret
    atom.notifications.addWarning "Could not register #{keyCombo} as shortcut", {
      detail: 'Probably already registered by another app or window, try restarted atom completely'
      dismissable: true
    }

  # Hide tree-view
  try
    treeView = atom.packages.getActivePackage('tree-view').mainModule.createView()
    if treeView.isVisible()
      treeView.toggle() # i.e. hide it
  catch err
    console.error(err)
    atom.notifications.addWarning 'Could not hide tree view', {
      detail: 'See the console for the error'
      dismissable: true
    }
