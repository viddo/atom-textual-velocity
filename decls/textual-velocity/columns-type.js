declare type ColumnsType = DisposableType & {
  prop: Bacon.Property,
  register (column: ColumnType): void
}
