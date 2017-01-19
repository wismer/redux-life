import * as actions from '../actions';


const initialState = {
  size: 3,
  pattern: [7, 5, 7],
  editMode: false
};

function editStamp(state, {x, y}) {
  let { pattern } = state;

  return Object.assign({}, state, {
    pattern: pattern.map((n, i) => {
      if (i === x) {
        if ((n >>> y) === 1) {
          return n ^ 1 << (2 - y);
        } else {
          return n ^ 1 << (2 - y);
        }
      } else {
        return n;
      }
    })
  });
}

export function stamp(state = initialState, action) {
  console.log(state.pattern);
  switch (action.type) {
    case 'EDIT_STAMP':
      return editStamp(state, action);
    default: return state;
  }
}

export function stampProps(state) {
  return state.stamp;
}

export function stampDispatch(dispatch) {
  return {
    editStamp: (x, y) => dispatch(actions.editStamp(x, y)),
    save: () => {}
  };
}
