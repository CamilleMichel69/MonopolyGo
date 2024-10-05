// URL de l'API
const API_URL = 'http://localhost:3000/api/stickers';

const filterStickers = async (owner, filter = 'tous') => {
    try {
      // Ajoute le filtre dans la requête
      const response = await fetch(`${API_URL}?owner=${owner}&filter=${filter}`);
      const stickers = await response.json();
      displayStickers(stickers);
    } catch (error) {
      console.error('Erreur lors du filtrage des autocollants :', error);
    }
  };
  

// Fonction pour ajouter un autocollant
const addSticker = async (sticker) => {
  try {
    const formData = new FormData();
    formData.append('name', sticker.name);
    formData.append('collection', sticker.collection);
    formData.append('owner', sticker.owner);

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log('Autocollant ajouté :', data);
    fetchStickers();
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'autocollant :', error);
  }
};

// Fonction pour récupérer les autocollants existants
const fetchStickers = async () => {
  try {
    const response = await fetch(API_URL);
    const stickers = await response.json();
    displayStickers(stickers);
  } catch (error) {
    console.error('Erreur lors de la récupération des autocollants :', error);
  }
};

// Fonction pour afficher les autocollants
const displayStickers = (stickers) => {
    const stickersList = document.getElementById('stickersList');
    stickersList.innerHTML = ''; // Efface la liste actuelle
  
    // Tri des autocollants par collection, puis par nom
    stickers.sort((a, b) => {
      // Trier d'abord par collection, puis par le nom des autocollants
      const collectionOrder = Object.keys(namesByCollection).indexOf(a.collection) - Object.keys(namesByCollection).indexOf(b.collection);
      if (collectionOrder !== 0) {
        return collectionOrder; // Si les collections sont différentes, on les trie
      }
      // Si même collection, trier par ordre des noms dans la collection
      return namesByCollection[a.collection].indexOf(a.name) - namesByCollection[b.collection].indexOf(b.name);
    });
  
    stickers.forEach((sticker) => {
      const stickerDiv = document.createElement('div');
      stickerDiv.classList.add('sticker');
      stickerDiv.innerHTML = `
        ${sticker.imageUrl ? `<img src="${sticker.imageUrl}" alt="${sticker.name}" width="100">` : ''}
        <h3>${sticker.name}</h3>
        <p>${sticker.collection}</p>
        <p>Joueur : ${sticker.owner}</p>
        ${sticker.quantity > 1 ? `<span class="sticker-count">+${sticker.quantity - 1}</span>` : ''}
        <button onclick="deleteSticker('${sticker._id}')">Supprimer</button>
      `;
      stickersList.appendChild(stickerDiv);
    });  
  };  

// Fonction pour supprimer un autocollant
const deleteSticker = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    console.log('Autocollant supprimé :', data);
    fetchStickers(); 
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'autocollant :', error);
  }
};

// Gérer la soumission du formulaire pour créer un nouvel autocollant
document.getElementById('stickerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const collection = document.getElementById('collection').value;
    const owner = document.getElementById('owner').value;
  
    const newSticker = { name, collection, owner };
    addSticker(newSticker);
  
    // Réinitialiser le formulaire
    document.getElementById('stickerForm').reset();
  });  

// Charger les autocollants au démarrage
fetchStickers();

// Dictionnaire des noms par collection
const namesByCollection = {
  "New York de Spidey": ["NY, Mon Pote !", "Qui Suis-Je ?", "Metro en Retard", "Transport Aérien", "Hot-Dog Mythique", "Sens de Spidey", "Pigeon Voleur", "Sauver le Chaton", "Quelle journée !"],
  "Salut les musclés": ["Appel d'Urgence", "Un Bon Plan", "Hulk-Dozer", "Haute Tension", "Plombier Pro", "Bien Tenté", "Un Peu de Jus", "Au Top", "Héros Locaux"],
  "Cosmo et Scottie": ["Atterrissage", "Voici Cosmo !", "Ecureuil !", "Vol Chercher !", "Jetpack", "Visiter la Maison", "Rocket Chic", "Quelle aventure", "Gardien Honoraire"],
  "Potes de Gym": ["Nouvelle Routine", "Objectifs de Force", "Le Meilleur Coach", "Impressionné", "Pause du Guerrier", "Près du But", "Entrainement Ecourté", "Des Muscles !", "Skå !"],
  "Tisseur de toile": ["Tenue Tonique", "Miles et Cynthia", "Dessins de Spidey", "Pièce Secrète", "Super-Costumes", "Captain M", "Tisseuse de Toile", "Finitions", "Miles au Sommet"],
  "Double Deadpool": ["Furtif Pool", "Vol de Chapeau", "Monopoly en Folie", "Oeuvre d'Art", "Partager les Richesses", "Chimichangas !", "Courtier Courtisé", "Qui ? Moi ?", "A Plus dans le Bus !"],
  "Golfeuse Verte": ["Tous au Green", "Chauffeur XXL", "Club Sandwich", "Main de Hulk", "Quel Danger ?", "QUEL COUP !", "Oups", "Jour de Banner", "Fête sur le Green"],
  "Ecole Shield": ["Nick Fury", "QG du SHIELD", "Gloire au SHIELD", "Oeil de Magnat", "Sans Faute", "Coup d'Envoi", "Duel des Agents", "Nouveau Membre", "Badge d'Honneur"],
  "Bouffon Vert": ["Piles", "Vol de Tartes", "Ça alors !", "Frondeur de Toile", "Repère Secret", "Bouffon Affamé", "Du Dessus", "Ligoté", "Livraison Spéciale"],
  "Monopoly Avengers": ["Arrivée des Héros", "On s'ennuie", "Super Affaire !", "Mjolnir Tout Neuf", "Mini Hulk", "Micropoly", "Iron Man", "Fine Guêpe", "Rassemblement !"],
  "Le Braquage": ["Patrouille", "Le Braquage", "Mystique", "L'Heure du Leurre", "Lévitation", "Enfant Prodige", "Fait pour un Roi", "Impossible !", "Sans Accroc"],
  "Avant le braquage": ["Au Voleur !", "Interpellation", "Apprends-Moi", "Formation d'Espion", "Gadgets", "Exercices", "Force de Frappe", "Alerte au Braquage", "Main dans le Sac"],
  "Détective Jones": ["Nocturne", "Disparition", "Un Nouveau Cas", "Qui est Coupable ?", "Chercher l'Indice", "Suspects Habituels", "Innocent ?", "Patte Parlante", "Tu es Fait !"],
  "Wade et Logan": ["Wade s'amuse", "Triste Pool", "Doppool-Ganger", "X-Manucure", "Waferine", "Si Seulement", "Rêves Fous", "Examen Artistique", "Meilleurs Amis"],
  "Héros planètaires": ["Equipe de Nettoyage", "Longue Portée", "Tornade de Dêchets", "Black Panther", "Racines de Groot", "Morcepool", "Jeter les ordures", "Nettoyer les Cieux", "Galactus"],
  "Style Wakanda": ["Wakanda !", "Labo de Shury", "Technologie Avancée", "Chat Numérique", "Next Gen", "Style Vibranium", "Salut des Savants", "Nouveaux Jouets", "En Costume"],
  "Manoir X": ["Le Commencement", "Top Secret", "Amis de la Science", "Le Dernier Debout", "M Cerebro", "Coup de Vent", "Super-Viseur", "Malicia la Malice", "Dernier Gambit"],
  "Etrange Strange": ["Un Bon Comique", "Gros Bouton Rouge", "ZAP !", "Le Coup de la Cape", "Docteur Strange", "Orbe d'Agamotto", "Gargantos", "Portail de Retour", "Tout est Normal"],
};

// Écouteur d'événements pour la collection
document.getElementById('collection').addEventListener('change', function() {
  const selectedCollection = this.value;
  const nameSelect = document.getElementById('name');

  // Vider la liste des noms
  nameSelect.innerHTML = '<option value="" disabled selected>Nom</option>';

  // Remplir la liste des noms en fonction de la collection sélectionnée
  if (namesByCollection[selectedCollection]) {
    namesByCollection[selectedCollection].forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      nameSelect.appendChild(option);
    });
  }
});

// Ton ancienne fonction filterStickers devrait rester comme elle est.

function toggleDropdown(owner) {
  const dropdown = document.getElementById(`dropdown-${owner}`);
  dropdown.classList.toggle('show');
}

function filterDropdown(option, owner) {
  if (option === 'all') {
    filterStickers(owner);
  } else if (option === 'duplicates') {
    filterStickers(owner, 'duplicates');
  }
}

// Ajoute ça à la fin de ton fichier JavaScript.
document.addEventListener('click', function (event) {
  const dropdowns = document.querySelectorAll('.dropdown-content');
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('show');
    }
  });
});

