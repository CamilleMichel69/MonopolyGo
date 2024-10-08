const Sticker = require('../models/sticker');
const stickerImageMapping = require('../models/stickerPhoto'); // Mapping des images

// Créer un nouvel autocollant
exports.createSticker = (req, res, next) => {
    const { name, collection, owner } = req.body;

    // Vérification du mapping pour obtenir le fichier image correct
    const imageFileName = stickerImageMapping[collection]?.[name];

    if (!imageFileName) {
        return res.status(400).json({ error: 'Image non trouvée pour cet autocollant.' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/images/stickers/${imageFileName}`;

    // Recherche d'un autocollant existant avec le même nom, collection et owner
    Sticker.findOne({ name, collection, owner })
        .then(existingSticker => {
            if (existingSticker) {
                existingSticker.quantity = (existingSticker.quantity || 1) + 1;
                return existingSticker.save()
                    .then(() => res.status(200).json({ message: 'Quantité mise à jour !' }))
                    .catch(error => res.status(500).json({ error: 'Erreur lors de la mise à jour de la quantité' }));
            } else {
                const sticker = new Sticker({
                    name,
                    collection,
                    imageUrl,
                    owner,
                    quantity: 1
                });

                sticker.save()
                    .then(() => res.status(201).json({ message: 'Autocollant enregistré !' }))
                    .catch(error => res.status(500).json({ error: 'Erreur lors de l\'enregistrement' }));
            }
        })
        .catch(error => {
            console.error('Erreur lors de la recherche :', error);
            res.status(500).json({ error: 'Erreur serveur' });
        });
};

// Supprimer un autocollant (ne supprime pas l'image)
exports.deleteSticker = async (req, res) => {
    try {
      const stickerId = req.params.id;
      const owner = req.body.owner; 
  
      const sticker = await Sticker.findById(stickerId);
  
      if (!sticker) {
        return res.status(404).send({ message: 'Autocollant non trouvé.' });
      }
  
      if (sticker.quantity > 1) {
        sticker.quantity -= 1; 
        await sticker.save(); 
        return res.status(200).send({ message: 'Autocollant décrémenté.', sticker });
      } else {
        // Si c'est le dernier, supprimez l'autocollant
        await Sticker.findByIdAndDelete(stickerId);
        return res.status(200).send({ message: 'Autocollant supprimé.' });
      }
    } catch (error) {
      return res.status(500).send({ message: 'Erreur lors de la suppression de l’autocollant.' });
    }
  };
  
// Récupérer un autocollant spécifique
exports.getOneSticker = (req, res, next) => {
    Sticker.findOne({ _id: req.params.id })
        .then(sticker => res.status(200).json(sticker))
        .catch(error => res.status(404).json({ error }));
};

// Récupérer tous les autocollants (avec filtre optionnel par owner)
exports.getAllStickers = (req, res, next) => {
    const owner = req.query.owner;
    const filter = req.query.filter;

    let query = owner ? { owner: owner } : {};

    if (filter === 'doublons') {
        query.quantity = { $gt: 1 }; 
    }

    if (filter === 'exchange') {
        const otherOwner = owner === 'Camille' ? 'Andrea' : 'Camille';
        
        Sticker.find({ owner: otherOwner })
            .then(otherStickers => {
                const otherStickerIds = otherStickers.map(sticker => sticker.name); 
                return Sticker.find({
                    owner: owner,
                    quantity: { $gt: 1 }, 
                    name: { $nin: otherStickerIds }
                });
            })
            .then(stickers => res.status(200).json(stickers))
            .catch(error => res.status(400).json({ error }));
        return;
    }
    Sticker.find(query)
        .then(stickers => res.status(200).json(stickers))
        .catch(error => res.status(400).json({ error }));
};
