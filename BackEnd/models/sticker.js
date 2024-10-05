const mongoose = require('mongoose');

const stickerSchema = mongoose.Schema({
    name: { type: String, required: true },
    collection: { type: String, required: true },
    imageUrl: { type: String, required: true },
    owner: { type: String, required: true },
    quantity: { type: Number, default: 1 } 
});

module.exports = mongoose.model('Sticker', stickerSchema);
