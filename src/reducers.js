import * as actions from './actions';
import { BitWise, BitMap } from './bitwise';

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

function bitfield(nums) {
  let bitmap = 0;
  let hash = [];
  nums.forEach((num, idx) => {
    if (num) {
      bitmap ^= 1 << idx;
      hash.push(num.toString(32));
    }
  });

  return bitmap ? `${bitmap.toString(32)}#${hash.join('-')}` : null;
}

function tick(prevState) {
  let grid = BitMap(prevState.grid).map(nums => {
    return BitWise(nums).reduce((left, right, index) => left ^ (right << index), 0);
  });

  return Object.assign({}, prevState, {
    grid, bitmap: bitfield(grid)
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
  let grid = BitMap(state.grid).stamp(x, y);
  let bitmap = bitfield(grid);
  return Object.assign({}, state, {
    didStart: true,
    bitmap,
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

export function gameProps(state) {
  return state;
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
