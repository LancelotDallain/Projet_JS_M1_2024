import * as R from 'ramda';
import loadJSON from './Import_JSON.js';

const data = loadJSON('./aapl_data.json');

// Function to calculate volatility
const calculateOpenClose = R.pipe(
  R.map(entry => ({
    date: new Date(entry.timestamp * 1000).toLocaleDateString(),
    volatility: entry.close - entry.open
  })),
  R.sortBy(R.prop('DiffOpenClose')),
  R.juxt([R.last, R.head]) // Get the entry with the lowest and highest volatility
);

// Main function to load and process the data
const calculateAndPrintDiffOpCl = data => {
  const meanVolatility = R.pipe(
    R.map(entry => entry.close - entry.open),
    R.mean
  )(data);

  const [lowestVolatility, highestVolatility] = calculateOpenClose(data);

  console.log("Moyenne Difference Open and close :", meanVolatility);
  console.log("Lowest Difference Open and close:", lowestVolatility);
  console.log("Highest Difference Open and close:", highestVolatility);
};

// Logging the result of processing the file
calculateAndPrintDiffOpCl(data);
