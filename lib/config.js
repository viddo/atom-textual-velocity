/* @flow */

const restartExplanation =
  "_Changing this setting requires restarting the session._";

export const defaultConfig = (cfg => {
  // workaround for flow: set the order prop to make sure settings are listed in the same order as here
  Object.keys(cfg).forEach((key, i) => {
    (cfg[key]: any).order = i;
  });
  return cfg;
})({
  path: {
    description: `${restartExplanation}<br/>Path to folder where to find notes. Can be an absolute path or a relative path to \`~/.atom\` (defaults to \`~/.atom/notes\`)`,
    type: "string",
    default: ""
  },
  ignoredNames: {
    type: "array",
    default: ["Notes & Settings"],
    items: { type: "string" },
    description: `${restartExplanation}<br/>List of [glob patterns](https://en.wikipedia.org/wiki/Glob_%28programming%29). Files matching these patterns will be ignored, in addition to the ignoredNames defined in core settings`
  },
  excludeVcsIgnoredPaths: {
    type: "boolean",
    default: true,
    title: "Exclude VCS Ignored Paths",
    description: `${restartExplanation}<br/>Files ignored by the the notes path's VCS system will be ignored. For example, projects using Git have these paths defined in the .gitignore file.`
  },
  sortField: {
    default: "name",
    type: "string"
  },
  sortDirection: {
    type: "string",
    default: "desc",
    enum: [
      { value: "asc", description: "Ascending order" },
      { value: "desc", description: "Descending order" }
    ]
  },
  hiddenColumns: {
    type: "array",
    default: [],
    items: { type: "string" },
    description:
      "These columns will not be visible. Right-click on header to see options, or use commands panel (`textual-velocity:toggle-column-name-of-column`)"
  },
  defaultExt: {
    title: "Default file extension",
    description:
      "Will be used for new files, unless the text string contains a custom file extension already",
    type: "string",
    default: ".md"
  },
  listHeight: {
    description:
      "Height of panel, can also be changed by dragging the bottom of panel",
    type: "number",
    default: 150,
    minimum: 0
  },
  rowHeight: {
    description: "Internal cached value, used to calculate pagination size",
    type: "number",
    default: 20,
    minimum: 8,
    maximum: 80
  }
});
