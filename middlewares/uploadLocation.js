const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Función para verificar y crear carpetas si no existen
const ensureDirectoryExistence = (folder) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = path.join(__dirname, '../src/fotos_sedes'); // Carpeta para fotos de sedes
        ensureDirectoryExistence(folder); // Verificar y crear la carpeta si no existe
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceptar solo imágenes
    } else {
        cb(new Error('El archivo debe ser una imagen (jpg, png, etc.)'), false);
    }
};

// Configuración final de multer
const uploadLocation = multer({ storage, fileFilter });

module.exports = uploadLocation;