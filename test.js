import fs from 'fs'
import * as R from 'ramda';

// Fonction pour charger un fichier JSON à partir d'un chemin donné
const loadJSONFile = filePath => {
  try {
    // Lecture du fichier JSON
    const jsonData = fs.readFileSync(filePath, 'utf8');
    // Conversion de la chaîne JSON en objet JavaScript
    const parsedData = JSON.parse(jsonData);
    return parsedData;
  } catch (error) {
    console.error('Une erreur est survenue lors de la lecture du fichier :', error);
    return null;
  }
};

// Exemple d'utilisation
const dataFilePath = 'C:\\Users\\toto\\WebstormProjects\\Projet_JS\\aapl_data.json';
const jsonData = loadJSONFile(dataFilePath);

if (jsonData) {
  console.log('Fichier JSON chargé avec succès :', jsonData);
} else {
  console.log('Erreur lors du chargement du fichier JSON.');
}

const calculateAverageVolume = (data) => {
  // Extraire les volumes
  const volumes = R.pluck('volume', data);
  // Calculer la moyenne des volumes
  const averageVolume = R.mean(volumes);
  return averageVolume;
};

// Utilisation de la fonction pour calculer la moyenne des volumes
const averageVolume = calculateAverageVolume(jsonData);
console.log('Moyenne des volumes:', averageVolume);