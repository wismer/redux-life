export function start(x, y, cell, didStart) {
  return {
    type: 'START',
    x, y, cell, didStart
  };
}

export function tick() {
  return {
    type: 'TICK'
  };
}

export function stop() {
  return {
    type: 'STOP'
  };
}

export function rewind(frame) {
  return {
    type: 'REWIND',
    frame
  };
}

export function save() {
  return {
    type: 'SAVE'
  };
}
