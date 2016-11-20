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
    grid.push(row.slice())
  }
  return grid;
}

const initialState = {
  grid: makeGrid(),
  didStart: false,
  intervalId: null
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

function updateState(prevState) {
  let { grid } = prevState;
  let newGrid = grid.map((row, x) => {
    return row.map((cell, y) => {
      let { live, dead } = getNeighboringCells(grid, x, y);
      if (!cell) {
        return live === 3 ? 1 : 0;
      } else if (live < 2) {
        return 0;
      } else if (live < 4) {
        return 1;
      } else {
        return 0;
      }
    });
  });

  return Object.assign({}, prevState, { grid: newGrid });
}

function raiseDeadCell(state, {x, y, cell}) {
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

export function gameState(state, action) {
  switch (action.type) {
    case '@@redux/INIT':
      return initialState;
    case 'STOP':
      return Object.assign({}, state, { didStart: false });
    case 'TICK':
      return updateState(state, action.cell);
    case 'START':
      return raiseDeadCell(state, action);
    default: return state;
  }
}

export function gameProps(state, props) {
  if (props.x > -1) {
    return state;
  }

  return { grid: state.grid, didStart: state.didStart, intervalId: state.intervalId };
}

export function gameDispatch(dispatch, props) {
  return {
    onMouseClick: (x, y, cell, didStart) => {
      dispatch(actions.raiseDeadCell(x, y, cell, didStart));
    },

    tick: () => {
      dispatch(actions.updateState());
    },

    stopGame: () => {
      dispatch(actions.stop());
    }
  };
}
