/* @flow */

declare class _PreviewEditor extends atom$TextEditor {
  openPreview: (
    notePath: string,
    content: ?string,
    searchRegexps: RegExp[]
  ) => Promise<PreviewEditor>;
}

export type PreviewEditor = _PreviewEditor;
