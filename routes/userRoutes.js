const express = require('express');
const multer = require('multer');
const router = express.Router();

const { requireAuth } = require('../middlewares');
const userController = require('../controllers/userController');

// Upload em memória: o arquivo é só repassado ao SSO, nada é gravado em disco aqui.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Envie uma imagem PNG, JPG ou WebP de até 5MB.'), ok);
  },
});

// Converte erros do multer (tamanho/tipo) para o formato de erro padrão da API.
function uploadAvatar(req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.message, fields: { avatar: err.message } },
      });
    }
    next();
  });
}

router.get('/me', requireAuth, userController.me);
router.patch('/me', requireAuth, userController.updateMe);
router.put('/me/password', requireAuth, userController.changePassword);
router.post('/me/pin/regenerate', requireAuth, userController.regeneratePin);
router.post('/me/avatar', requireAuth, uploadAvatar, userController.updateAvatar);
router.patch('/me/unidade', requireAuth, userController.updateUnidade);
router.patch('/me/cargo', requireAuth, userController.updateRole);
router.post('/me/permissions/toggle', requireAuth, userController.togglePermission);

module.exports = router;
