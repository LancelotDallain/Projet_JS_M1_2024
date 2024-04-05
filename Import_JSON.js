import fs from 'fs';
import { tryCatch, always } from 'ramda';

// A function that reads data from a file and returns it
const readFile = (filePath) => fs.readFileSync(filePath, 'utf8');

// A safe parse function that doesn't throw an error for invalid JSON
const safeParse = (data) => tryCatch(JSON.parse, always(null))(data);

// A function that composes reading and parsing in a safe way
const loadJSON = (filePath) => safeParse(readFile(filePath));

export default loadJSON;

const result = loadJSON('./aapl_data.json');
