import * as actions from './actions';
import { BitWise, BitMap } from './bitwise';

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
  bitmap: null,
  records: []
};

function tick(prevState) {
  let { grid } = prevState;

  return Object.assign({}, prevState, {
    grid: grid.map((n, x) => {
      let bitwise = BitWise([grid[x - 1] || 0, n, grid[x + 1] || 0]);
      return bitwise.reduce((left, right, index) => left ^ (right << index), 0);
    })
  });
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
  let { bitmap, grid } = BitMap(state.grid).map((n, i) => {
    if (i === x) {
      return flipbit(n, y, x, 0b101);
    } else if (i === x - 1 || i === x + 1) {
      return flipbit(n, y, x, LIVE_CELLS);
    } else {
      return n;
    }
  }).bitmap(n => n.toString(32));

  return Object.assign({}, state, {
    didStart: true,
    grid,
    bitmap
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

export function gameProps(state) {
  return state;
  // return {
  //   grid: state.grid,
  //   stepCount: state.stepCount,
  //   didStart: state.didStart,
  //   intervalId: state.intervalId,
  //   records: state.records,
  //   bitmap: state.bitmap
  // };
}

export function gameDispatch(dispatch) {
  return {
    onMouseClick: (x, y, cell, didStart) => {
      dispatch(actions.start(x, y, cell, didStart));
    },

    tick: (gameState, bitmap, records) => {
      dispatch(actions.save(gameState, bitmap));
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
