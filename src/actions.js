export function raiseDeadCell(x, y, cell, didStart) {
  return {
    type: 'START',
    x, y, cell, didStart
  };
}

export function updateState() {
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
