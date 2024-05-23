const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });
let historiqueNoms = [];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const lireFichiers = (cheminDossier) => fs.readdirSync(cheminDossier).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

const renommerFichiers = (cheminDossier, nomBase, debutNumero, saisonAct, fichiers) => {
    const nombreTotalFichiers = fichiers.length;
    const longueurNumero = String(parseInt(debutNumero) + nombreTotalFichiers - 1).length;
    let fichiersRenommes = [];
    let buffer = [];

    fichiers.forEach((fichier, index) => {
        const extension = path.extname(fichier);
        const numeroActuel = parseInt(debutNumero) + index;
        const nouveauNom = saisonAct
            ? `${nomBase} - ${saisonAct}E${String(numeroActuel).padStart(longueurNumero, '0')}${extension}`
            : `${nomBase} - E${String(numeroActuel).padStart(longueurNumero, '0')}${extension}`;
        const ancienChemin = path.join(cheminDossier, fichier);
        const nouveauChemin = path.join(cheminDossier, nouveauNom);

        if (fs.existsSync(nouveauChemin)) {
            buffer.push({ ancienChemin, nouveauChemin });
        } else {
            fs.renameSync(ancienChemin, nouveauChemin);
            fichiersRenommes.push({ ancienNom: fichier, nouveauNom: nouveauNom });
        }
    });

    // Retry renaming buffered files
    while (buffer.length > 0) {
        let retryBuffer = [];
        buffer.forEach(({ ancienChemin, nouveauChemin }) => {
            if (!fs.existsSync(nouveauChemin)) {
                fs.renameSync(ancienChemin, nouveauChemin);
                fichiersRenommes.push({ ancienNom: path.basename(ancienChemin), nouveauNom: path.basename(nouveauChemin) });
            } else {
                retryBuffer.push({ ancienChemin, nouveauChemin });
            }
        });

        if (retryBuffer.length === buffer.length) {
            break; // No progress made, stop retrying
        }

        buffer = retryBuffer;
    }

    return fichiersRenommes;
};

const revertirNoms = (cheminDossier, fichiersRenommes) => {
    let buffer = [];

    fichiersRenommes.forEach(({ ancienNom, nouveauNom }) => {
        const ancienChemin = path.join(cheminDossier, ancienNom);
        const nouveauChemin = path.join(cheminDossier, nouveauNom);

        if (fs.existsSync(ancienChemin)) {
            buffer.push({ ancienChemin: nouveauChemin, nouveauChemin: ancienChemin });
        } else {
            fs.renameSync(nouveauChemin, ancienChemin);
        }
    });

    // Retry renaming buffered files
    while (buffer.length > 0) {
        let retryBuffer = [];
        buffer.forEach(({ ancienChemin, nouveauChemin }) => {
            if (!fs.existsSync(nouveauChemin)) {
                fs.renameSync(ancienChemin, nouveauChemin);
            } else {
                retryBuffer.push({ ancienChemin, nouveauChemin });
            }
        });

        if (retryBuffer.length === buffer.length) {
            break; // No progress made, stop retrying
        }

        buffer = retryBuffer;
    }
};

app.post('/rename', upload.none(), (req, res) => {
    const { cheminDossier, nomBase, debutNumero, saisonAct } = req.body;

    if (!cheminDossier || !nomBase || isNaN(debutNumero)) {
        return res.status(400).json({ message: 'Invalid input parameters' });
    }

    try {
        const fichiers = lireFichiers(cheminDossier);
        const fichiersRenommes = renommerFichiers(cheminDossier, nomBase, debutNumero, saisonAct, fichiers);

        historiqueNoms.push({ cheminDossier, fichiersRenommes });

        res.json({
            message: 'Les fichiers ont été renommés avec succès.',
            fichiersRenommes: fichiersRenommes
        });
    } catch (error) {
        res.status(500).json({ message: `Une erreur s'est produite : ${error.message}` });
    }
});

app.post('/revert', upload.none(), (req, res) => {
    if (historiqueNoms.length === 0) {
        return res.status(400).json({ message: 'Aucun historique de renommage disponible.' });
    }

    try {
        const { cheminDossier, fichiersRenommes } = historiqueNoms.pop();
        revertirNoms(cheminDossier, fichiersRenommes);

        res.json({ message: 'Les fichiers ont été restaurés à leurs noms précédents.' });
    } catch (error) {
        res.status(500).json({ message: `Une erreur s'est produite lors de la restauration : ${error.message}` });
    }
});

app.post('/list-files', (req, res) => {
    const { cheminDossier } = req.body;

    if (!cheminDossier) {
        return res.status(400).json({ message: 'Chemin du dossier non fourni.' });
    }

    try {
        const fichiers = lireFichiers(cheminDossier);
        res.json({ fichiers: fichiers });
    } catch (error) {
        res.status(500).json({ message: `Une erreur s'est produite lors de la lecture des fichiers : ${error.message}` });
    }
});

app.post('/list-directory', (req, res) => {
    const { chemin } = req.body;

    if (!chemin) {
        return res.status(400).json({ message: 'Chemin non fourni.' });
    }

    try {
        const elements = fs.readdirSync(chemin).map(element => {
            const fullPath = path.join(chemin, element);
            return {
                name: element,
                isDirectory: fs.lstatSync(fullPath).isDirectory()
            };
        });
        res.json({ elements: elements });
    } catch (error) {
        res.status(500).json({ message: `Une erreur s'est produite lors de la lecture du répertoire : ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
