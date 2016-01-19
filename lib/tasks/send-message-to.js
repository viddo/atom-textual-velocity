'use babel'

export default function (task, name, payload) {
  task.send({
    name: name,
    payload: payload
  })
}
