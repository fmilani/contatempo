import React from 'react';

const Spinner = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '70px',
    }}
  >
    <div className="clock-wrapper">
      <div className="top"></div>
      <div className="button"></div>
      <div className="clock">
        <div className="center"></div>
        <div className="hand"></div>
      </div>
    </div>
  </div>
);

export default Spinner;
