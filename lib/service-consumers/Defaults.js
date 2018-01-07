/* @flow */

import Disposables from "../Disposables";
import FileIconColumn from "../columns/FileIconColumn";
import StatsDateColumn from "../columns/StatsDateColumn";
import SummaryColumn from "../columns/SummaryColumn";
import statsFileReader from "../file-readers/StatsFileReader";
import ContentFileReader from "../file-readers/ContentFileReader";
import StatsDateNoteField from "../note-fields/StatsDateNoteField";
import ParsedPathNoteField from "../note-fields/ParsedPathNoteField";
import type { ServiceAPI } from "../flow-types/ServiceAPI";

const NAME_FIELD = "name";
const EXT_FIELD = "ext";
const LAST_UPDATE_FIELD = "lastupdate";
const BIRTHTIME_FIELD = "birthtime";

export default {
  consumeService(service: ServiceAPI, summaryEditCellName: string) {
    service.registerFileReaders(statsFileReader, ContentFileReader);

    service.registerFields(
      ContentFileReader,
      new ParsedPathNoteField({
        notePropName: NAME_FIELD,
        parsedPathPropName: "name"
      }),
      new ParsedPathNoteField({
        notePropName: EXT_FIELD,
        parsedPathPropName: "ext"
      }),
      new StatsDateNoteField({
        notePropName: LAST_UPDATE_FIELD,
        statsPropName: "mtime"
      }),
      new StatsDateNoteField({
        notePropName: BIRTHTIME_FIELD,
        statsPropName: "birthtime"
      })
    );

    service.registerColumns(
      new FileIconColumn({ sortField: EXT_FIELD }),
      new SummaryColumn({
        sortField: NAME_FIELD,
        editCellName: summaryEditCellName
      }),
      new StatsDateColumn({
        title: "Last updated",
        description: "Last updated date",
        notePropName: "mtime",
        sortField: LAST_UPDATE_FIELD
      }),
      new StatsDateColumn({
        title: "Created",
        description: "Created date",
        notePropName: "birthtime",
        sortField: BIRTHTIME_FIELD
      })
    );

    return new Disposables();
  }
};
