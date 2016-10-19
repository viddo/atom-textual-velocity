# Recommended usage
This assumes some technical knowledge of Atom and your OS. If you're already using Atom you should be fine though. :)

While the plugin can be run in any Atom window, it's recommended to run it in a separate instance (e.g. [Atom beta](https://atom.io/beta), or vice versa) to not interfere with your normal developer workflow (open/closing Atom, changing between app windows etc.).

It's also recommended to run this instance using a custom `ATOM_HOME` folder, for windows settings, init script, custom keymappings etc. not to interfere with your default Atom. See the [mac-atom-beta.sh](mac-atom-beta.sh) for an example of how that can be achieved. 

Here you also can find my [custom init script](.atom/init.coffee#L10), that contains some code to activate this package on startup, and to register a global keyboard shortcut to easily toggle/access that particular instance window from anywhere.

## Caveat: Using MacOSX?
By default the package would have an idle CPU usage of 50%, due to some unresolved issues in lower-level node libraries - While unfortunate it does have an easy solution! Simply make sure that there's no space in the path to the application, most likely it's enough to rename the app to "AtomBeta.app" and re-install this package again. Now the idle CPU usage should be around 0-0.5%.

See [this report](https://github.com/atom/apm/issues/499#issuecomment-254695325) for more technical details.
