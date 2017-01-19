import React, { Component } from 'react';
import logo from './logo.svg';
import { connect } from 'react-redux';
import { gameProps, gameDispatch } from './reducers/game';
import { bitfieldProps } from './reducers/stamp';
import Stamp from './components/stamp';
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
        onClick={() => onMouseClick(x, y)}
        key={`${x}${y}`}
        className={className}>
      </div>
    );
  });
  return (
    <div className='row'>
      {bits}
    </div>
  );
}

const Row = connect()(RowContainer);

class Grid extends React.Component {
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

        <div className='stamp-container'>
          {this.props.children}
        </div>
      </div>
    );
  }
}

class BitFieldContainer extends Component {
  render() {
    let { bitfield } = this.props;
    let bits = [];
    for (var i = 0; i < 8; i++) {
      bits.push((bitfield >>> i) & 1);
    }

    bits = bits.map(bit => {
      let msg = 'I do not have this piece!';
      if (bit) {
        msg = 'I have this piece!';
      }

      return (
        <div className='bit-box'>
          <div className='bit'>{bit}</div>
          <div className='bit-msg'>{msg}</div>
        </div>
      );
    });
    return (
      <div className='bitfield'>
        {bits}
      </div>
    );
  }
}

const BitField = connect(bitfieldProps)(BitFieldContainer);

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
          <GameOfLife>
            <Stamp />
          </GameOfLife>

          <BitField />

        </article>
      </div>
    );
  }
}

export default App;
