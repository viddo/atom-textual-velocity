/* @flow */

import logError from "./log-error";

export function name(column: { title: string }) {
  return column.title.toLowerCase().replace(/\s/, "-");
}

export default class Columns {
  _columns: Column[];

  constructor() {
    this._columns = [];
  }

  add(column: Column) {
    if (typeof column !== "object")
      return logError("column object is required", column);
    if (typeof column.sortField !== "string")
      return logError("column.sortField string is required", column);
    if (typeof column.title !== "string")
      return logError("column.title string is required", column);
    if (typeof column.cellContent !== "function")
      return logError("column.cellContent function is required, was", column);

    if (typeof column.position === "number") {
      const start = parseInt(column.position) || 0;
      this._columns.splice(start, 0, column);
    } else {
      this._columns.push(column);
    }

    updateConfigSchema(this._columns);
  }

  filter(predicate: (column: Column) => boolean): Column[] {
    return this._columns.filter(predicate);
  }

  map<T>(mapper: (column: Column) => T): Array<T> {
    return this._columns.map(mapper);
  }

  some(predicate: (column: Column) => boolean): boolean {
    return this._columns.some(predicate);
  }

  dispose() {
    this._columns = [];
  }
}

function updateConfigSchema(columns: Column[]) {
  const schema = atom.config.getSchema("textual-velocity.sortField");
  schema.default = columns[0].sortField;

  const currentVal = atom.config.get("textual-velocity.sortField");
  let hasCurrentValInEnum = false;

  schema.enum = columns.map(column => {
    if (column.sortField === currentVal) {
      hasCurrentValInEnum = true;
    }
    return {
      value: column.sortField,
      description: column.title
    };
  });

  if (!hasCurrentValInEnum) {
    schema.enum.push({
      value: currentVal,
      description: currentVal
    });
  }

  atom.config.setSchema("textual-velocity.sortField", schema);
  atom.config.set("textual-velocity.sortField", currentVal);
}
