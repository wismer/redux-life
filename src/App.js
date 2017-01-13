import React, { Component } from 'react';
import logo from './logo.svg';
import { connect } from 'react-redux';
import { gameProps, gameDispatch } from './reducers';
import './App.css';

function RowContainer(props) {
  const { x, cells, onMouseClick } = props;
  let z = [];
  for (var i = 0; i < 32; i++) {
    let bit = 1 << i;
    if (cells & bit) {
      z.push(1);
    } else {
      z.push(0);
    }
  }
  let bits = z.map((cell, y) => {
    let className = cell ? 'cell cell-alive' : 'cell cell-dead';
    return (
      <div
        onClick={() => onMouseClick(x, y, cell)}
        key={`${x}${y}`}
        className={className}>{cell}
      </div>
    );
  });
  return (
    <div className='row'>
      {bits}
    </div>
  );
}

const Row = connect(gameProps)(RowContainer);

class Grid extends React.Component {
  constructor() {
    super(...arguments);
    this.state = { intervalID: null };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.didStart && !this.state.intervalID) {
      this.setState(prevState => ({
        stepCount: prevState.stepCount + 1,
        intervalID: setInterval(() => {
          nextProps.tick(nextProps.grid, nextProps.bitmap, nextProps.records);
        }, 200)
      }));
    } else if (this.state.intervalID && !nextProps.didStart) {
      clearInterval(this.state.intervalID);
      this.setState({ intervalID: null });
    }
  }

  render() {
    const { props } = this;
    let grid = Array.from(props.grid).map((n, x) => {
      return <Row cells={n} x={x} key={x} onMouseClick={props.onMouseClick} />;
    });
    const savedHash = props.savedHash ? <a href={`/#${props.savedHash}`}>RESTORE</a> : '';
    const len = (props.records.length - 1).toString();
    return (
      <div className='game-of-life'>
        <button onClick={() => props.saveGame(props.grid)}>SAVE GAME</button>
        <button onClick={() => props.stopGame()}>STOP GAME</button>
        <button onClick={() => props.stepForward()}>Advance one step</button>
        <button onClick={() => props.stepBackward()}>Go Back A Step</button>
        {savedHash}
        <div>
          STEP 0
          <input type='range' defaultValue={len} min='0' max={len} onChange={(e) => props.rewind(e.target.value)} />
          STEP {len}
        </div>
        <div className='grid'>
          {grid}
        </div>
      </div>
    );
  }
}

const GameOfLife = connect(gameProps, gameDispatch)(Grid);

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <article>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <GameOfLife />
        </article>
      </div>
    );
  }
}

export default App;
