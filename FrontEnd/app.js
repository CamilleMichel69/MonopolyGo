// URL de l'API
const API_URL = 'https://monopolygo-1.onrender.com/api/stickers';
let stickerToDeleteId = null; 

const filterStickers = async (owner, filter = 'tous') => {
    try {
      // Réinitialiser l'autre dropdown sur "Select"
      if (owner === 'Camille') {
        document.getElementById('andrea-select').selectedIndex = 0; 
      } else if (owner === 'Andrea') {
        document.getElementById('camille-select').selectedIndex = 0; 
      }
  
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
  
      if (response.ok) {
        const data = await response.json();
  
        // Afficher la modal si l'ajout est un succès
        showConfirmationModal();
  
        // Recharger les autocollants après l'ajout
        fetchStickers();
        document.getElementById('camille-select').selectedIndex = 0;
        document.getElementById('andrea-select').selectedIndex = 0;
      } else {
        console.error('Erreur lors de l\'ajout de l\'autocollant');
      }
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
    stickersList.innerHTML = ''; 
    const message = document.getElementById('message');
    message.innerHTML = '';

    stickers.sort((a, b) => {
      const collectionOrder = Object.keys(namesByCollection).indexOf(a.collection) - Object.keys(namesByCollection).indexOf(b.collection);
      if (collectionOrder !== 0) {
        return collectionOrder; 
      }
      return namesByCollection[a.collection].indexOf(a.name) - namesByCollection[b.collection].indexOf(b.name);
    });

    if (stickers.length === 0) {
        message.innerHTML = '<p>Aucun autocollant à échanger</p>';
        return;
    }

    let currentCollection = '';
    let collectionSection = null;

    stickers.forEach((sticker, index) => {
        if (sticker.collection !== currentCollection) {
            currentCollection = sticker.collection;

            // Créer une section pour chaque collection
            collectionSection = document.createElement('div');
            collectionSection.classList.add('collection-section');

            // Ajouter le titre de la collection
            const collectionTitle = document.createElement('h2');
            collectionTitle.innerText = currentCollection;
            collectionTitle.classList.add('collection-title');
            collectionSection.appendChild(collectionTitle);

            // Créer une grille pour les stickers de cette collection
            const stickerGrid = document.createElement('div');
            stickerGrid.classList.add('sticker-grid');
            collectionSection.appendChild(stickerGrid);

            // Ajouter la section entière à la liste principale
            stickersList.appendChild(collectionSection);
        }

        // Ajouter le sticker à la grille
        const stickerDiv = document.createElement('div');
        stickerDiv.classList.add('sticker');
        stickerDiv.innerHTML = `
          ${sticker.imageUrl ? `<img src="${sticker.imageUrl}" alt="${sticker.name}" width="100">` : ''}
          <h3>${sticker.name}</h3>
          <p>${sticker.collection}</p>
          <p>${sticker.owner}</p>
          ${sticker.quantity > 1 ? `<span class="sticker-count">+${sticker.quantity - 1}</span>` : ''}
          <button onclick="showDeleteModal('${sticker._id}')">Supprimer</button>
        `;

        // Ajouter le sticker à la grille de la collection en cours
        collectionSection.querySelector('.sticker-grid').appendChild(stickerDiv);

        // Animation d'affichage des stickers
        setTimeout(() => {
          stickerDiv.classList.add('show');
        }, index * 100); 
    });
};

// Fonction générique pour afficher une modale avec animation
const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex'; // Flex pour centrer
    setTimeout(() => {
        modal.classList.add('show');
    }, 10); // Délai pour déclencher l'animation après l'affichage

    if (modalId === 'confirmationModal') {
        // Pour la modale de confirmation, la fermer après 3 secondes
        setTimeout(() => {
            hideModal(modalId);
        }, 3000);
    }
};

// Fonction générique pour cacher une modale avec animation
const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.classList.add('hide');

    // Retirer complètement après l'animation
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('hide');
    }, 500); // Durée de l'animation
};

// Gestion de la fermeture manuelle de la modale de confirmation
document.querySelector('.close-button').addEventListener('click', () => hideModal('confirmationModal'));

// Fermer la modale quand on clique à l'extérieur
window.addEventListener('click', (event) => {
    const confirmationModal = document.getElementById('confirmationModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (event.target === confirmationModal) {
        hideModal('confirmationModal');
    } else if (event.target === deleteModal) {
        hideModal('deleteModal');
    }
});

// Utilisation pour la modale de confirmation
const showConfirmationModal = () => {
    showModal('confirmationModal');
};

// Utilisation pour la modale de suppression
const showDeleteModal = (id) => {
    stickerToDeleteId = id;
    showModal('deleteModal');
};

// Fonction pour fermer la modale de suppression
const closeDeleteModal = () => {
    stickerToDeleteId = null;
    hideModal('deleteModal');
};

// Fonction pour confirmer et supprimer l'autocollant
const deleteSticker = async () => {
    if (stickerToDeleteId) {
        try {
            const response = await fetch(`${API_URL}/${stickerToDeleteId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            fetchStickers();
            closeDeleteModal();
            document.getElementById('camille-select').selectedIndex = 0;
            document.getElementById('andrea-select').selectedIndex = 0;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'autocollant :', error);
        }
    }
};


// Ajouter les événements pour les boutons "Confirmer" et "Annuler"
document.getElementById('confirmDeleteBtn').addEventListener('click', deleteSticker);
document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

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
  "Bouffon Vert": ["Piles", "Vol de Tartes", "Ça alors !", "Frondeur de Toile", "Repaire Secret", "Bouffon Affamé", "Du Dessus", "Ligoté", "Livraison Spéciale"],
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

function toggleDropdown(owner) {
  const dropdown = document.getElementById(`dropdown-${owner}`);
  dropdown.classList.toggle('show');
}

document.addEventListener('click', function (event) {
  const dropdowns = document.querySelectorAll('.dropdown-content');
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('show');
    }
  });
});

// Récupère le bouton
const backToTopBtn = document.getElementById("backToTopBtn");

// Affiche le bouton lorsque l'utilisateur fait défiler vers le bas de 100px
window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

// Quand l'utilisateur clique sur le bouton, fait défiler vers le haut
backToTopBtn.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
};
