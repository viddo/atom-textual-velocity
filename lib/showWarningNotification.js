/* @flow */

export function showWarningNotification(message: string, error: Error) {
  atom.notifications.addWarning(`Textual-Velocity: ${message}:`, {
    detail: error.message,
    dismissable: true,
  });
}
