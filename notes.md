# Log

## Known Problems

1. Not sure why the ticking stops after restoring...

ahh here's why.
```javascript
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
```

restore gets called, but the ticking event doesn't trigger anymore, so it just continues to find
the previous record. Here was the fix, but it feels like it's not the best way...

```javascript
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
```

2. Use Bitfield as a way to describe payloads & how useful they can be.
3. Animate the bits being entered, maybe?
