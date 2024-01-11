import React, { useState } from 'react';

function TickerInput({ fetchData }) {
  // State for the ticker input
  const [ticker, setTicker] = useState('');

  // Function to handle the submission of the ticker
  const handleSubmit = async () => {
    fetchData(ticker); // Call fetchData passed from MainContainer
  };

  return (
    <div className="ticker-input-container">
      {/* Ticker input field */}
      <input
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="underlying_ticker"
      />

      {/* Button to initiate data fetching */}
      <button className="fetch-data-btn" onClick={handleSubmit}>
        Fetch Data
      </button>
    </div>
  );
}

export default TickerInput;

