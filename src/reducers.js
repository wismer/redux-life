import * as actions from './actions';
import BitWise from './bitwise';

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
  stepCount: 0,
  intervalId: null,
  savedHash: window.location.hash.replace('#', ''),
  isFetching: false,
  isLoading: false,
  didError: false,
  errorMsg: null,
  records: []
};

function updateInt(int, isAlive, livingCells, bitPosition) {
  if (isAlive) {
    if (livingCells < 2 || livingCells > 3) {
      return int ^ (1 << bitPosition);
    } else {
      return int;
    }
  } else {
    return livingCells === 3 ? int ^ (1 << bitPosition) : int;
  }
}

function nthBit(int, position, flag) {
  return (int >> position) & flag;
}

function tallyBits(int, flag, position) {
  return flag & (int >> position);
}

function countBits(n) {
  let count = 0;

  while (n != 0) {
    n &= n - 1;
    count++;
  }

  return count;
}

function evaluateInt(prevInt, nextInt, currentInt) {
  let n = 0;
  for (var i = 30; i > 0; i--) {
    let p = prevInt >>> i;
    let m = currentInt >>> i;
    let currentCell = (m >>> 1) & 1;
    let next = nextInt >>> i;
    let count = countBits(p & 7) + countBits(next & 7) + countBits(m & 5);
    if (currentCell && count === 2) {
      n |= 1;
    } else if (!currentCell && count === 3) {
      n |= 1;
    }
    if (n) {
      n <<= 1;
    }
  }

  return n;
}

function tick(prevState) {
  let { grid } = prevState;
  let newGrid = [];

  for (var int = 0; int < 32; int++) {
    let bits = BitWise([grid[int - 1] || 0, grid[int], grid[int + 1] || 0]);
    let n = 0;
    for (var i = 0; i < 32; i++) {
      let c = bits.count(7, 5);
      if (bits.isAlive(i)) {
        if (c < 2 || c > 3) {
          // dies
        } else {
          n = n ^ (1 << i);
          // lives
        }
      } else if (c === 3) {
        n = n ^ (1 << i);
        // cell becomes alive
      }

      bits = bits.shift(i === 0 || i === 31 ? 0 : 1);
    }
    newGrid.push(n);

  }
  return Object.assign({}, prevState, { grid: newGrid });
}

function flipbit(n, y, x, flag) {
  // TODO - some weird behavior if you click on the right or leftmost edges
  // when starting the animation
  let modifier = 1;
  if (y === 31) {
    flag >>= 1;
  } else if (y === 0) {
    modifier = 0;
    flag = flag === 7 ? 3 : 2;
  }
  return Math.abs(n ^ (flag << y - modifier));
}

function start(state, {x, y}) {
  let grid = Array.from(state.grid).map((n, i) => {
    if (i === x) {
      return flipbit(n, y, x, 0b101);
    } else if (i === x - 1 || i === x + 1) {
      return flipbit(n, y, x, LIVE_CELLS);
    } else {
      return n;
    }
  });
  return Object.assign({}, state, {
    didStart: true,
    grid
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
  return Object.assign({}, state, {
    records: [...state.records, savedStateHashKey],
    isLoading: false
  });
}

export function gameState(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }

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
    stepCount: state.stepCount,
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
    },

    stepForward: () => {
      dispatch(actions.tickSave());
    }
  };
}
