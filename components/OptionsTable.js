import React, { useState } from 'react';
import "../styles.css";

function OptionsTable({ data }) {
  // State to manage which table is visible for each expiration date
  const [visibleTables, setVisibleTables] = useState({});

  const toggleVisibility = (expirationDate, tableType) => {
    setVisibleTables(prevState => ({
      ...prevState,
      [expirationDate]: prevState[expirationDate] !== tableType ? tableType : null
    }));
  };

  // ~~~~ Function to get the appropriate table style ~~~~
  const getTableStyle = (expirationDate, tableType) => {
    return visibleTables[expirationDate] === tableType
      ? "option-table-transition option-table-visible"
      : "option-table-transition";
  };

  return (
    <div>
      {Object.keys(data).map((expirationDate) => (
        <div key={expirationDate} className="expiration-container">
          <div className="centered-container">
            <h2>{expirationDate}</h2>
          </div>
          <div className="buttons-container">
            <button onClick={() => toggleVisibility(expirationDate, 'Calls')}>
              Calls
            </button>
            <button onClick={() => toggleVisibility(expirationDate, 'Puts')}>
              Puts
            </button>
          </div>
          {/* ~~~~ Apply dynamic style for transition ~~~~ */}
          <div className={getTableStyle(expirationDate, 'Calls')}>
            <OptionTableForType options={data[expirationDate].calls} type="Calls" />
          </div>
          <div className={getTableStyle(expirationDate, 'Puts')}>
            <OptionTableForType options={data[expirationDate].puts} type="Puts" />
          </div>
        </div>
      ))}
    </div>
  );
}


function OptionTableForType({ options, type }) {
  return (
    <div className='table-container'>
      {/* The table is now always visible when this component is rendered */}
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Strike Price</th>
          </tr>
        </thead>
        <tbody>
          {options.map((option) => (
            <tr key={option.ticker}>
              <td><div className='ticker-div'>{option.ticker}</div></td>
              <td><div className='strike-price-div'>{option.strike_price}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OptionsTable;


