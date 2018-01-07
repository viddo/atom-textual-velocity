/* @flow */

import Disposables from "../disposables";
import FileIconColumn from "../columns/FileIconColumn";
import StatsDateColumn from "../columns/StatsDateColumn";
import SummaryColumn from "../columns/SummaryColumn";
import statsFileReader from "../file-readers/stats-file-reader";
import contentFileReader from "../file-readers/content-file-reader";
import StatsDateField from "../fields/stats-date-field";
import ParsedPathField from "../fields/parsed-path-field";
import type { ServiceAPI } from "../flow-types/ServiceAPI";

const NAME_FIELD = "name";
const EXT_FIELD = "ext";
const LAST_UPDATE_FIELD = "lastupdate";
const BIRTHTIME_FIELD = "birthtime";

export default {
  consumeService(service: ServiceAPI, summaryEditCellName: string) {
    service.registerFileReaders(statsFileReader, contentFileReader);

    service.registerFields(
      contentFileReader,
      new ParsedPathField({
        notePropName: NAME_FIELD,
        parsedPathPropName: "name"
      }),
      new ParsedPathField({
        notePropName: EXT_FIELD,
        parsedPathPropName: "ext"
      }),
      new StatsDateField({
        notePropName: LAST_UPDATE_FIELD,
        statsPropName: "mtime"
      }),
      new StatsDateField({
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
