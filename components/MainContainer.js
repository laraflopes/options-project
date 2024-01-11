import React, { useState } from 'react';
import TickerInput from './TickerInput';
import OptionsTable from './OptionsTable';
import { BarLoader } from 'react-spinners';

function MainContainer() {
  const [optionsData, setOptionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tickerLastFetched, setTickerLastFetched] = useState({});

  const fetchData = async (ticker) => {
    setIsLoading(true);
    const today = new Date().toDateString();

    // Check if this ticker was fetched today
    const wasFetchedToday = tickerLastFetched[ticker] === today;

    try {
      const response = await fetch(`http://localhost:5000/fetch/${ticker}`);
      const data = await response.json();
      setOptionsData(data); // Set the fetched data
      setTickerLastFetched({ ...tickerLastFetched, [ticker]: today }); // Update last fetched time

      // Determine the timeout duration
      const timeoutDuration = wasFetchedToday ? 2000 : 0;

      // Wait for at least 2 seconds if the data was fetched today
      setTimeout(() => {
        setIsLoading(false);
      }, timeoutDuration);

    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <TickerInput fetchData={fetchData} />
      <div className="loader-container">
        {isLoading && <BarLoader size={50} color="white" />}
      </div>
      {/* Display the table only when data is available and not loading */}
      {!isLoading && optionsData && <OptionsTable data={optionsData} />}
    </div>
  );
}

export default MainContainer;



