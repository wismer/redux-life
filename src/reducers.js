import * as actions from './actions';

const adjacent = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1], [1, -1],
  [1, 0], [1, 1]
];

function makeRow() {
  let row = [];
  for (var i = 0; i < 50; i++) {
    row.push(0);
  }
  return row;
}

function makeGrid() {
  let grid = [];
  let row = makeRow();
  for (var i = 0; i < 50; i++) {
    grid.push(row.slice());
  }
  return grid;
}

const initialState = {
  grid: makeGrid(),
  didStart: false,
  intervalId: null,
  savedHash: window.location.hash.replace('#', ''),
  isFetching: false,
  isLoading: false,
  didError: false,
  errorMsg: null,
  records: []
};

function getNeighboringCells(grid, x, y) {
  let count = { dead: 0, live: 0 };
  adjacent.forEach(n => {
    let cx = x + n[0];
    let cy = y + n[1];
    if ((cy > -1 && cy < 50) && (cx > -1 && cx < 50)) {
      if (grid[cx][cy]) {
        count.live += 1;
      } else {
        count.dead += 1;
      }
    }
  });

  return count;
}

function tick(prevState) {
  let { grid } = prevState;
  let newGrid = grid.map((row, x) => {
    return row.map((cell, y) => {
      let { live } = getNeighboringCells(grid, x, y);
      if (!cell) {
        cell = live === 3 ? 1 : 0;
      } else if (live < 2) {
        cell = 0;
      } else if (live < 4) {
        cell = 1;
      } else {
        cell = 0;
      }
      return cell;
    });
  });



  return Object.assign({}, prevState, { grid: newGrid });
}

function start(state, {x, y}) {
  return Object.assign({}, state, {
    grid: state.grid.map((row, cx) => {
      if (cx >= (x - 1) && cx <= (x + 1)) {
        return row.map((c, cy) => {
          if (cy >= (y - 1) && cy <= (y + 1)) {
            return cy === y && cx === x ? 0 : 1;
          } else {
            return c;
          }
        });
      }
      return row;
    }),
    didStart: true
  });
}

function rewind(prevState, frame) {
  let step = prevState.records[frame];
  if (!step) {
    // probably missing something, here...
    return prevState;
  }

  return Object.assign({}, prevState, {
    grid: prevState.grid.map((row, cx) => {
      if (!step[cx]) {
        return row;
      }

      return row.map((cell, cy) => {
        if (step[cx][cy]) {
          return 1;
        }
        return 0;
      });
    }),
    didStart: false
  });
}

function saveStart(prevState) {
  return Object.assign({}, prevState, { isLoading: true });
}

function padChunk(chunk) {
  if (chunk.length < 16) {
    return ('0'.repeat(16 - chunk.length) + chunk);
  } else {
    return chunk;
  }
}

function restore(prevState) {
  let blocks = [];
  let chunks = [];

  prevState.savedHash.split('+').forEach((data, idx) => {
    if (idx % 2 === 0) {
      // block #
      blocks.push(parseInt(data, 16));
    } else {
      let chunk = parseInt(data, 16).toString(2);
      chunks.push(chunk);
    }
  });
  let i = 0;
  let str = '';
  let block = blocks.shift();
  let chunk;
  while (i < 2500) {
    if (i === (block * 16)) {
      chunk = padChunk(chunks.shift());
      block = blocks.shift();
    } else {
      chunk = '0'.repeat(16);
    }

    str += chunk;
    i += 16;
  }
  let grid = [];
  for (i = 0; i < 2500; i += 50) {
    grid.push(str.slice(i, i + 50).split('').map(n => +n));
  }

  return Object.assign({}, prevState, {
    grid: grid
  });
}

function saveFinish(state, hash) {
  return Object.assign({}, state, {
    records: [...state.records, hash],
    isLoading: false
  });
}

export function gameState(state, action) {
  switch (action.type) {
    case '@@redux/INIT':
      return restore(state || initialState, action);
    case 'STOP':
      return Object.assign({}, state, { didStart: false });
    case 'TICK':
      return tick(state);
    case 'START':
      return start(state, action);
    case 'REWIND':
      return rewind(state, action.frame);
    case 'RESTORE':
      return restore(state, action);
    case 'SAVE_START':
      return saveStart(state, action);
    case 'SAVE_FINISH':
      return saveFinish(state, action.hash);
    default: return state;
  }
}

export function gameProps(state, props) {
  if (props.x > -1) {
    return state;
  }

  return {
    grid: state.grid,
    didStart: state.didStart,
    intervalId: state.intervalId,
    records: state.records,
    savedHash: state.savedHash
  };
}

export function gameDispatch(dispatch) {
  return {
    onMouseClick: (x, y, cell, didStart) => {
      dispatch(actions.start(x, y, cell, didStart));
    },

    tick: (gameState) => {
      dispatch(actions.save(gameState));
    },

    stopGame: () => {
      dispatch(actions.stop());
    },

    rewind: (frame) => {
      dispatch(actions.rewind(frame));
    },

    saveGame: (gameState) => {
      dispatch(actions.save(gameState));
    }
  };
}
