const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Función para verificar y crear carpetas si no existen
const ensureDirectoryExistence = (folder) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { tipo } = req.body; // "tipo" será 'generales', 'eventos', o 'rifas'
        // let folder = path.resolve(__dirname, '../src/publicaciones/generales'); // Carpeta predeterminada

        // if (tipo === 'eventos') {
        //     folder = path.resolve(__dirname, '../src/publicaciones/eventos');
        // } else if (tipo === 'rifas') {
        //     folder = path.resolve(__dirname, '../src/publicaciones/rifas');
        // }

        let folder = 'src/publicaciones/generales'; // Carpeta predeterminada

        if (tipo === 'eventos') folder = 'src/publicaciones/eventos';
        else if (tipo === 'rifas') folder = 'src/publicaciones/rifas';

         // Verifica y crea la carpeta si no existe
        // ensureDirectoryExistence(folder);

        // Crear la carpeta si no existe
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

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
const upload = multer({ storage, fileFilter });

module.exports = upload;
