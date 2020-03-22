/* @flow */

import Disposables from "./Disposables";

export default class RestartSessionForNewConfigToTakeEffect {
  _disposables: Disposables;

  constructor() {
    const title = "Textual Velocity";

    const createNotificationHandler = (desc: string) => () => {
      // until https://github.com/eslint/eslint/issues/12117 is resolved:
      // eslint-disable-next-line no-unused-vars
      for (let notification of atom.notifications
        .getNotifications()
        .reverse()) {
        if (notification.isDismissed()) {
          break; // stop when reaching a dismissed notification
        }
        const opts = notification.getOptions();
        if (opts && opts.description === desc && !notification.isDismissed()) {
          return false; // there is already a notification of this desc, don't open a new one
        }
      }
      atom.notifications.addInfo(title, {
        buttons: [
          {
            text: "Restart session",
            onDidClick: () => {
              // until https://github.com/eslint/eslint/issues/12117 is resolved:
              // eslint-disable-next-line no-unused-vars
              for (let notification of atom.notifications
                .getNotifications()
                .reverse()) {
                if (notification.isDismissed()) {
                  break; // stop when reaching a dismissed notification
                }
                const opts = notification.getOptions();
                if (
                  opts &&
                  opts.description === desc &&
                  !notification.isDismissed()
                ) {
                  notification.dismiss();
                }
              }
              atom.commands.dispatch(
                atom.views.getView(atom.workspace),
                "textual-velocity:restart-session"
              );
            },
          },
        ],
        description: desc,
        dismissable: true,
      });
    };

    this._disposables = new Disposables(
      atom.config.onDidChange(
        "textual-velocity.path",
        createNotificationHandler(
          "Restart session to load notes from the new notes path"
        )
      ),
      atom.config.onDidChange(
        "textual-velocity.ignoredNames",
        createNotificationHandler(
          "Restart session to ignore/unignore notes by the changed ignored names"
        )
      ),
      atom.config.onDidChange(
        "textual-velocity.excludeVcsIgnoredPaths",
        createNotificationHandler(
          "Restart session to exclude VCS ignored paths"
        )
      )
    );
  }

  dispose() {
    this._disposables.dispose();
  }
}
