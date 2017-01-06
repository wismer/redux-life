import * as actions from './actions';

const cellBits = {
  '0': 0,
  '1': 1,
  '2': 1,
  '3': 2,
  '4': 1,
  '5': 2,
  '6': 2,
  '7': 3
};

const ALIVE_CELL = 0b010;
const LIVE_CELLS = 0b111;

const initialState = {
  grid: Array.from(new Array(32)).map(n => 0),
  didStart: false,
  intervalId: null,
  savedHash: window.location.hash.replace('#', ''),
  isFetching: false,
  isLoading: false,
  didError: false,
  errorMsg: null,
  records: []
};

function flipBits(n, aliveCells, position, isAlive) {
  if (isAlive) {
    if (aliveCells < 2 || aliveCells > 4) {
      // dies (not enough cells nearby)
      return n ^ (1 << position);
    } else {
      // survives (enough cells nearby)
      return n;
    }
  } else {
    return aliveCells === 3 ? n ^ (1 << position) : n;
  }
}

function tick(prevState) {
  let { grid } = prevState;

  let newGrid = grid.map((n, x) => {
    let leftCol = grid[x - 1] || 0;
    let rightCol = grid[x + 1] || 0;
    let middleCol = n;
    for (let i = 31; i > 0; i--) {
      let modifier;
      if (i > 29) {
        modifier = -1;
      } else if (i < 2) {
        modifier = 1;
      } else {
        modifier = 0;
      }
      let l = leftCol >>> i + modifier;
      let r = rightCol >>> i + modifier;
      let m = middleCol >>> i + modifier;

      let count = cellBits[r & LIVE_CELLS] + cellBits[l & LIVE_CELLS];
      let mid = m & LIVE_CELLS;
      let currentCellIsAlive = (mid & ALIVE_CELL) === 2;

      if (currentCellIsAlive) {
        count += cellBits[mid] - 1;
      } else {
        count += cellBits[mid];
      }

      n = flipBits(n, count, i, currentCellIsAlive);
    }
    return n;
  });



  return Object.assign({}, prevState, { grid: newGrid });
}

function flipbit(n, position, flag) {
  return n ^ (flag << position);
}

function start(state, action) {
  return Object.assign({}, state, {
    didStart: true,
    grid: Array.from(state.grid).map((n, x) => {
      if (x === action.x) {
        return flipbit(n, action.y, ALIVE_CELL);
      } else if (x === action.x - 1 || x === action.x + 1) {
        return flipbit(n, action.y, LIVE_CELLS);
      } else {
        return n;
      }
    })
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

function restore(prevState) {
  return Object.assign({}, prevState, {
    grid: []
  });
}

function saveFinish(state, savedStateHashKey) {
  console.log(savedStateHashKey);
  return Object.assign({}, state, {
    records: [...state.records, savedStateHashKey],
    isLoading: false
  });
}

export function gameState(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }

  console.log(state.grid, 'action:', action.type);

  switch (action.type) {
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
      return saveFinish(state, action.savedStateHashKey);
    default: return state;
  }
}

export function gameProps(state, props) {
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
