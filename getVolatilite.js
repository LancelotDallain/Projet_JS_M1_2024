import * as R from 'ramda';
import loadJSON from './Import_JSON.js';

const data = loadJSON('./aapl_data.json');

// Function to calculate volatility
const calculateVolatility = R.pipe(
  R.map(entry => ({
    date: new Date(entry.timestamp * 1000).toLocaleDateString(),
    volatility: entry.high - entry.low
  })),
  R.sortBy(R.prop('volatility')),
  R.juxt([R.head, R.last]) // Get the entry with the lowest and highest volatility
);

// Main function to load and process the data
const calculateAndPrintVolatility = data => {
  const meanVolatility = R.pipe(
    R.map(entry => entry.high - entry.low),
    R.mean
  )(data);

  const [lowestVolatility, highestVolatility] = calculateVolatility(data);

  console.log("Moyenne Volatility:", meanVolatility);
  console.log("Lowest Volatility:", lowestVolatility);
  console.log("Highest Volatility:", highestVolatility);
};

// Logging the result of processing the file
calculateAndPrintVolatility(data);
