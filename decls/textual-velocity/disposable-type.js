declare type DisposableType = {
  add: (obj: Function | {dispose: Function}) => void,
  dispose: Function
}
