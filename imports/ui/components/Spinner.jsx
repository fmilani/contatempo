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
      <div className="top" />
      <div className="button" />
      <div className="clock">
        <div className="center" />
        <div className="hand" />
      </div>
    </div>
  </div>
);

export default Spinner;
