import { connect } from 'react-redux';
import { stampProps, stampDispatch } from '../reducers/stamp';
import React from 'react';

function Row({ num, size, onClick, x }) {
  let bits = [];
  for (var i = size - 1; i >= 0; i--) {
    bits.push((num >>> i) & 1);
  }

  let bitRow = bits.map((cell, idx) => {
    let className = cell ? 'cell cell-alive' : 'cell cell-dead';
    return (
      <div onClick={() => onClick(x, idx)} className={`stamp ${className}`} key={idx}>
        {cell}
      </div>
    );
  });

  return (
    <div className='stamp stamp-row'>
      {bitRow}
    </div>
  );
}

function StampContainer({ pattern, size, editStamp }) {
  let rows = pattern.map((n, x) => {
    return <Row size={size} x={x} onClick={editStamp} num={n} key={x} />;
  });
  return (
    <div className='stamp'>
      {rows}
    </div>
  );
}

export default connect(stampProps, stampDispatch)(StampContainer);
