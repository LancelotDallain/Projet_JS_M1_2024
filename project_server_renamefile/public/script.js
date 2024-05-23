const lancerRenommage = () => {
    const cheminDossier = document.getElementById('cheminDossier').value;
    const nomBase = document.getElementById('nomSerie').value;
    const debutNumero = document.getElementById('numeroDebut').value;
    const saisonAct = document.getElementById('saison').value;

    if (!validerChamps(cheminDossier, nomBase, debutNumero, saisonAct)) {
        return;
    }

    fetch('/rename', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cheminDossier, nomBase, debutNumero, saisonAct }),
    })
        .then(response => response.json())
        .then(data => {
            afficherLog(data.message, data.fichiersRenommes);
        })
        .catch((error) => {
            document.getElementById('log').textContent = `Erreur: ${error.message}`;
        });
};

const revertirRenommage = () => {
    fetch('/revert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            afficherLog(data.message);
        })
        .catch((error) => {
            document.getElementById('log').textContent = `Erreur: ${error.message}`;
        });
};

const afficherLog = (message, fichiersRenommes = []) => {
    const logElement = document.getElementById('log');
    logElement.textContent = message;
    fichiersRenommes.forEach(fichier => {
        logElement.textContent += `\nRenommé '${fichier.ancienNom}' en '${fichier.nouveauNom}'`;
    });
};

const validerChamps = (cheminDossier, nomBase, debutNumero, saisonAct) => {
    if (!cheminDossier || !nomBase || !debutNumero) {
        alert('Tous les champs doivent être remplis sauf la saison qui est optionnelle.');
        return false;
    }

    if (isNaN(debutNumero)) {
        alert('Le numéro de début doit être un nombre entier.');
        return false;
    }

    if (saisonAct && typeof saisonAct !== 'string') {
        alert('La saison doit être une chaîne de caractères.');
        return false;
    }

    return true;
};

const afficherPreview = () => {
    const cheminDossier = document.getElementById('cheminDossier').value;
    const nomBase = document.getElementById('nomSerie').value;
    const debutNumero = document.getElementById('numeroDebut').value;
    const saisonAct = document.getElementById('saison').value;

    if (!cheminDossier || !nomBase || isNaN(debutNumero)) {
        document.getElementById('preview').innerHTML = '';
        return;
    }

    fetch('/list-files', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cheminDossier })
    })
        .then(response => response.json())
        .then(data => {
            const fichiers = data.fichiers;
            const nombreTotalFichiers = fichiers.length;
            const longueurNumero = String(parseInt(debutNumero) + nombreTotalFichiers - 1).length;
            let previewContent = 'Prévisualisation des nouveaux noms de fichiers:<br>';

            const fichiersAPrevisualiser = [
                ...fichiers.slice(0, 5),
                ...(nombreTotalFichiers > 10 ? ['...'] : []),
                ...fichiers.slice(-5)
            ];

            fichiersAPrevisualiser.forEach((fichier, index) => {
                if (fichier === '...') {
                    previewContent += '<br>...<br>';
                } else {
                    const extension = fichier.split('.').pop();
                    const numeroActuel = parseInt(debutNumero) + (index < 5 ? index : nombreTotalFichiers - fichiersAPrevisualiser.length + index + 1);
                    const nouveauNom = saisonAct
                        ? `${nomBase} - ${saisonAct}E${String(numeroActuel).padStart(longueurNumero, '0')}.${extension}`
                        : `${nomBase} - E${String(numeroActuel).padStart(longueurNumero, '0')}.${extension}`;
                    previewContent += `<br>${fichier} -> ${nouveauNom}<br>`;
                }
            });

            document.getElementById('preview').innerHTML = previewContent;
        })
        .catch((error) => {
            document.getElementById('preview').innerHTML = `Erreur: ${error.message}`;
        });
};

document.getElementById('lancerBtn').addEventListener('click', lancerRenommage);
document.getElementById('revertBtn').addEventListener('click', revertirRenommage);
document.getElementById('cheminDossier').addEventListener('input', afficherPreview);
document.getElementById('nomSerie').addEventListener('input', afficherPreview);
document.getElementById('numeroDebut').addEventListener('input', afficherPreview);
document.getElementById('saison').addEventListener('input', afficherPreview);
