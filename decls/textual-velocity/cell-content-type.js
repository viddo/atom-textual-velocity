declare type CellContentType =
  | string
  | {
      attrs: Object,
      content: CellContentType
    }
  | Array<CellContentType>
