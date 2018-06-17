/* @flow */

export type PreviewEditor = atom$TextEditor & {
  openPreview: (
    notePath: string,
    content: ?string,
    searchRegex?: ?RegExp
  ) => Promise<PreviewEditor>
};
