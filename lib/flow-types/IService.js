/* @flow */

import type { IColumn } from "./IColumn";
import type { IFileReader } from "../flow-types/IFileReader";
import type { IFileWriter } from "../flow-types/IFileWriter";
import type { INoteField } from "./INoteField";

export interface IService {
  registerColumns(...items: IColumn[]): void;
  registerFields(...items: INoteField[]): void;
  registerFileReaders(...items: IFileReader[]): void;
  deregisterFileReaders(...items: IFileReader[]): void;
  registerFileWriters(...items: IFileWriter[]): void;
}
