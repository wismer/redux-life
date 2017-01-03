import React, { Component } from 'react';
import logo from './logo.svg';
import { connect } from 'react-redux';
import { gameProps, gameDispatch } from './reducers';
import './App.css';


function RowContainer(props) {
  const cells = props.cells.map((cell, i) => {
    let className = cell === 0 ? 'cell cell-dead' : 'cell cell-alive';
    return (
      <div
        onClick={() => props.onMouseClick(props.x, i, cell)}
        key={i}
        className={className}>
      </div>
    );
  });
  return (
    <div className='row'>
      {cells}
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
      this.setState({
        intervalID: setInterval(() => {
          nextProps.tick(nextProps.grid);
        }, 10)
      });
    } else if (this.state.intervalID && !nextProps.didStart) {
      clearInterval(this.state.intervalID);
      this.setState({ intervalID: null });
    }
  }

  render() {
    const { props } = this;
    const rows = props.grid.map((row, i) => {
      return (
        <Row
          didStart={props.didStart}
          onMouseClick={props.onMouseClick}
          key={i}
          x={i}
          cells={row}
        />
      );
    });
    const savedHash = props.savedHash ? <a href={`/#${props.savedHash}`}>RESTORE</a> : '';
    const len = (props.records.length - 1).toString();
    return (
      <div className='game-of-life'>
        <button onClick={() => props.saveGame(this.props.grid)}>SAVE GAME</button>
        <button onClick={() => props.stopGame()}>STOP GAME</button>
        {savedHash}
        <div>
          STEP 0
          <input type='range' defaultValue={len} min='0' max={len} onChange={(e) => props.rewind(e.target.value)} />
          STEP {len}
        </div>
        <div className='grid'>
          {rows}
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
