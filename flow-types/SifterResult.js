/* @flow */

import type { Notes } from "./Note";
import type { SearchResult } from "sifter";

export type SifterResult = SearchResult<$Keys<Notes>>;
