import { BitWise, BitMap } from '../bitwise';
import * as actions from '../actions';

const initialState = {
  grid: Array.from(new Array(32)).map(() => 0),
  didStart: false,
  stepCount: 0,
  intervalId: null,
  savedHash: window.location.hash.replace('#', ''),
  isFetching: false,
  isLoading: false,
  didError: false,
  errorMsg: null,
  bitmap: null,
  intervalID: null,
  records: []
};

function bitfield(nums) {
  let bitmap = 0;
  let hash = [];
  nums.forEach((num, idx) => {
    if (num) {
      bitmap ^= (1 << idx);
      hash.push(num.toString(32));
    }
  });

  return bitmap ? `${bitmap.toString(32)}#${hash.join('-')}` : null;
}

function tick(prevState) {
  let grid = BitMap(prevState.grid).map(nums => {
    return BitWise(nums).reduce((left, right, index) => left ^ (right << index), 0);
  });

  if (BitMap(grid).isMoving()) {
    grid.shift();
    grid.push(0);
  }

  return Object.assign({}, prevState, {
    grid, bitmap: bitfield(grid)
  });
}

function start(state, {x, y, intervalID, stamp}) {
  let grid = BitMap(state.grid).stamp(x, y, stamp);
  let bitmap = bitfield(grid);
  return Object.assign({}, state, {
    didStart: true,
    bitmap,
    intervalID,
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

function restore(prevState, bitmap) {
  let grid = prevState.grid.slice();
  let [bitfield, body] = bitmap.split('#');
  let ints = body.split('-').map(n => parseInt(n, 32));
  let i = 32;
  let field = parseInt(bitfield, 32);
  while (i > 0) {
    if (1 & (field >>> i)) {
      grid[i] = ints.pop();
    }

    i--;
  }

  let state = Object.assign({}, prevState, { grid });
  return tick(state);
}

function saveFinish(state, savedStateHashKey) {
  let newState = {
    records: [...state.records, savedStateHashKey],
    isLoading: false
  };
  return Object.assign({}, state, newState);
}

function stopGame(prevState) {
  return Object.assign({}, prevState, { intervalID: null, didStart: false });
}

export function game(state = initialState, action) {
  switch (action.type) {
    case 'STOP':
      return stopGame(state);
    case 'TICK':
      return tick(state);
    case 'START':
      return start(state, action);
    case 'REWIND':
      return rewind(state, action.frame);
    case 'RESTORE':
      return restore(state, action.bitmap);
    case 'SAVE_START':
      return saveStart(state, action);
    case 'ADD_STAMP':
      return start(state, action);
    case 'SAVE_FINISH':
      return saveFinish(state, action.savedStateHashKey);
    default: return state;
  }
}

export function gameProps(state) {
  return state.game;
}

export function bitfieldProps(state) {
  return { bitfield: state.bitfield };
}

export function gameDispatch(dispatch) {
  return {
    onMouseClick: (x, y) => {
      dispatch(actions.startInterval(x, y));
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
