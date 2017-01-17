function start(x, y, intervalID) {
  return { type: 'START', x, y, intervalID };
}

export function startInterval(x, y) {
  return function(dispatch, getState) {
    let state = getState();
    if (state.intervalID) {
      clearInterval(state.intervalID);
    }
    let intervalID = setInterval(() => {
      dispatch(save());
    }, 200);
    dispatch(start(x, y, intervalID));
  };
}

export function tickSave() {
  return { type: 'TICK' };
}

export function stop() {
  return { type: 'STOP' };
}

export function rewind(frame) {
  return { type: 'REWIND', frame };
}

export function saveStart() {
  return { type: 'SAVE_START' };
}

export function addStamp(x, y) {
  return { type: 'ADD_STAMP', x, y };
}

function restore(bitmap) {
  return { type: 'RESTORE', bitmap };
}

function saveFinish(savedStateHashKey) {
  return { type: 'SAVE_FINISH', savedStateHashKey };
}

export function save() {
  return function(dispatch, state) {
    let { grid, bitmap, records } = state();
    if (records.includes(bitmap)) {
      return dispatch(restore(bitmap));
    } else {
      dispatch(tickSave());
    }
    let options = {
      body: JSON.stringify({ data: Array.from(grid), timestamp: Date.now(), key: bitmap }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    return fetch('http://localhost:4567/update-state', options)
      .then(response => response.json(), () => {})
      .then(json => json.key ? dispatch(saveFinish(json.key)) : null, () => {});
  };
}
