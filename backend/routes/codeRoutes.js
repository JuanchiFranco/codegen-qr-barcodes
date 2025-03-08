const express = require('express');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware para verificar autenticación
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Denied access' });

    try {
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Generar código QR
router.post('/generate/qr', verifyToken, async (req, res) => {
    const { data } = req.body;
    const userId = req.user.id;

    try {
        // Generar el código QR en base64
        const qrImage = await QRCode.toDataURL(data);

        // Guardar en la base de datos
        db.query('INSERT INTO codes (user_id, type, data, image_url) VALUES (?, ?, ?, ?)', 
            [userId, 'QR', data, qrImage], 
            (err, result) => {
                if (err) return res.status(500).json({ error: err });
                res.json({ id: result.insertId, image: qrImage });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Error in generating QR code' });
    }
});

// Generar código de barras
router.post('/generate/barcode', verifyToken, async (req, res) => {
    const { data } = req.body;
    const userId = req.user.id;

    try {
        bwipjs.toBuffer({
            bcid: 'code128', // Tipo de código de barras
            text: data,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center'
        }, (err, png) => {
            if (err) return res.status(500).json({ error: 'Error in generating barcode' });

            // Convertir buffer a base64
            const barcodeImage = `data:image/png;base64,${png.toString('base64')}`;

            // Guardar en la base de datos
            db.query('INSERT INTO codes (user_id, type, data, image_url) VALUES (?, ?, ?, ?)', 
                [userId, 'BARCODE', data, barcodeImage], 
                (err, result) => {
                    if (err) return res.status(500).json({ error: err });
                    res.json({ id: result.insertId, image: barcodeImage });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ error: 'Error in generating barcode' });
    }
});

// Obtener historial de códigos del usuario
router.get('/history', verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query('SELECT id, type, data, image_url, created_at FROM codes WHERE user_id = ? ORDER BY created_at DESC', 
        [userId], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
});

// Eliminar un código del historial
router.delete('/:id', verifyToken, (req, res) => {
    const userId = req.user.id;
    const codeId = req.params.id;

    // Verificar que el código pertenezca al usuario
    db.query('DELETE FROM codes WHERE id = ? AND user_id = ?', 
        [codeId, userId], 
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Código no encontrado o no autorizado' });
            }

            res.json({ message: 'Código eliminado exitosamente' });
        }
    );
});

module.exports = router;