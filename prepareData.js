import * as R from 'ramda';
import * as fs from 'fs';

// Function to read and parse the JSON file with error handling
const readJsonFile = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading or parsing the file: ${error.message}`);
    return null;
  }
};

// Load candle data from the JSON file
const candlesData = readJsonFile('./aapl_data.json');

if (!candlesData) {
  console.error('Failed to load candle data.');
  process.exit(1);
}

// Create CandleData objects from JSON data
const createCandleData = R.curry((data) => ({
  ...data,
  trends: Object.freeze(data.trends),
  toString: () => `<CandleData (${data.timestamp}: ${data.close})>`
}));

const candles = R.map(createCandleData, candlesData);

// Function to calculate the moving average with Ramda
const computeMA = R.curry((period, data) => {
  const getClose = R.prop('close');
  const isValid = R.both(R.is(Number), R.complement(R.isNil));

  const initialMAs = R.pipe(
    R.map(getClose),
    R.filter(isValid),
    R.splitEvery(period),
    R.map(R.mean)
  )(R.take(period, data));

  const maReducer = (acc, idx) => {
    const currClose = getClose(data[idx]);
    const prevClose = getClose(data[idx - period]);

    const newMA = isValid(currClose) && isValid(prevClose)
      ? (acc[acc.length - 1] * period + currClose - prevClose) / period
      : null;

    return R.append(newMA, acc);
  };

  return R.reduce(
    maReducer,
    R.concat(R.times(R.always(null), period - 1), initialMAs),
    R.range(period, data.length)
  );
});

// Example usage
const ma7 = computeMA(7, candles);

// Prepare data for the chart
const timestamps = candles.map(candle => candle.timestamp);
const closePrices = candles.map(candle => candle.close);

const ctx = document.getElementById('maChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: timestamps,
    datasets: [
      {
        label: 'Close Prices',
        data: closePrices,
        borderColor: 'blue',
        borderWidth: 1,
        fill: false
      },
      {
        label: '7-day MA',
        data: ma7,
        borderColor: 'red',
        borderWidth: 1,
        fill: false
      }
    ]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        }
      }
    }
  }
});
