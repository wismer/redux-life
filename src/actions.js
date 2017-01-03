export function start(x, y, cell, didStart) {
  return {
    type: 'START',
    x, y, cell, didStart
  };
}

export function tickSave() {
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

export function saveStart() {
  return {
    type: 'SAVE_START'
  };
}

function saveFinish(gameHash) {
  return {
    type: 'SAVE_FINISH',
    gameHash
  };
}

export function save(gameState) {
  return function(dispatch) {
    let data = '';
    gameState.forEach(row => data += row.join(''));
    dispatch(tickSave());
    let options = {
      body: JSON.stringify({ data }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    return fetch('http://localhost:4567/update-state', options)
      .then(response => response.json())
      .then(json => {
        if (json.key) {
          dispatch(saveFinish(json.key));
        }
      });
  };
}
