import * as R from 'ramda';
import loadJSON from './Import_JSON.js';

// Assuming the JSON data file is named 'aapl_data.json' and is located in the same directory.
const data = loadJSON('./aapl_data.json');

// Function to calculate average using Ramda
const calculateAverageVolume = R.compose(R.mean, R.pluck('volume'));

// Main function to load and process the data
const calAveVol = R.pipe(
  R.ifElse(
    R.isNil,
    R.always(null),
    calculateAverageVolume
  )
)(data);


// Logging the result of processing the file
console.log(calAveVol);
