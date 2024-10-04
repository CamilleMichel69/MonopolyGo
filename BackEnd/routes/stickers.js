const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const stickerCtrl = require('../controllers/stickers');

router.get('/', stickerCtrl.getAllStickers);
router.post('/', multer, stickerCtrl.createSticker);
router.get('/:id', stickerCtrl.getOneSticker);
router.delete('/:id', stickerCtrl.deleteSticker);

module.exports = router;