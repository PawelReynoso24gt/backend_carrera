'use strict';
const QRCode = require('qrcode'); // Sirve para generar el código QR
const { v4: uuidv4 } = require('uuid'); // Sirve para generar identificadores únicos
const db = require("../models");
const voluntarios = require("../models/voluntarios");
const VOLUNTARIOS = db.voluntarios;
const PERSONAS = db.personas;

// Método para generar un código QR numérico
function generateQRCode() {
    // Generar un número único de 9 dígitos
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// Métodos CRUD
module.exports = {

    // Método para generar un QR code y devolverlo como una imagen
    async generateQR(req, res) {
        const { data } = req.query;

        if (!data) {
            return res.status(400).json({ message: 'Faltan datos para generar el QR.' });
        }

        try {
            // Generar el código QR como Data URL (base64)
            const qrCodeDataURL = await QRCode.toDataURL(data, {
                errorCorrectionLevel: 'H', // Nivel de corrección de errores
                type: 'image/png', // Tipo de imagen a generar
                width: 300, // Ancho del QR
                margin: 2, // Margen alrededor del QR
            });

            // Establecer la cabecera para devolver una imagen PNG
            res.setHeader('Content-Type', 'image/png');
            
            // Extraer solo los datos base64 sin la parte de encabezado "data:image/png;base64,"
            const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "");
            
            // Convertir los datos base64 a un Buffer y devolverlo como respuesta
            res.status(200).send(Buffer.from(base64Data, 'base64'));
        } catch (error) {
            console.error('Error al generar el código QR:', error);
            res.status(500).json({ message: 'Error al generar el código QR.' });
        }
    },
    
    // Método para obtener todos los voluntarios
    async find(req, res) {
        try {
            const voluntarios = await VOLUNTARIOS.findAll({
                where: {
                    estado: 1
                },
                include: {
                    model: PERSONAS,
                    as: 'persona',
                    attributes: ['idPersona', 'nombre'],
                }
            });
            
            return res.status(200).json(voluntarios);
        } catch (error) {
            console.error('Error al recuperar los voluntarios:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
    
    async findActivateVol(req, res) {
        return VOLUNTARIOS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((voluntarios) => {
            res.status(200).send(voluntarios);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los voluntarios.'
            });
        });
    },

    async findaInactivateVol(req, res) {
        return VOLUNTARIOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((voluntarios) => {
            res.status(200).send(voluntarios);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los voluntarios.'
            });
        });
    },

    async findById(req, res) {
        const { id } = req.params;
    
        try {
            const voluntario = await VOLUNTARIOS.findByPk(id, {
                include: [{ model: PERSONAS, as: 'persona' }],
            });
    
            if (!voluntario) {
                return res.status(404).json({ message: "Voluntario no encontrado" });
            }
    
            return res.status(200).json(voluntario);
        } catch (error) {
            console.error("Error al obtener voluntario:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },
    

    createVol(req, res) {
        const datos = req.body;

        // Validación de campos requeridos
        if (!datos.fechaRegistro ||  !datos.idPersona) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const datos_ingreso = {
            codigoQR: generateQRCode(), // Generar el código QR
            fechaRegistro: datos.fechaRegistro,
            fechaSalida: null,
            estado: datos.estado !== undefined ? datos.estado : 1,
            idPersona: datos.idPersona,
        };

        return VOLUNTARIOS.create(datos_ingreso)
            .then((voluntario) => {
                return res.status(201).json(voluntario);
            })
            .catch((error) => {
            console.error('Error al insertar el voluntario:', error);
            return res.status(500).json({ error: 'Error al insertar el voluntario.' });
        });
    },
    
    updateVol(req, res) {
        const datos = req.body; 
        const id = req.params.id; 
    
        if (!id) {
            return res.status(400).json({ message: 'ID de voluntario no proporcionado.' });
        }
    
        const camposActualizados = {};
        
        if(datos.codigoQR !== undefined) {
            camposActualizados.codigoQR = datos.codigoQR;
        }
        if (datos.fechaRegistro !== undefined) {
            camposActualizados.fechaRegistro = datos.fechaRegistro;
        }
        if (datos.fechaSalida !== undefined) {
            camposActualizados.fechaSalida = datos.fechaSalida;
        }
        if (datos.estado !== undefined) {
            camposActualizados.estado = datos.estado;
        }
        if (datos.idPersona !== undefined) {
            camposActualizados.idPersona = datos.idPersona;
        }

        if (Object.keys(camposActualizados).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }
    
        return VOLUNTARIOS.update(camposActualizados, {
            where: { idVoluntario: id } 
        })
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Voluntario no encontrado.' });
            }
            return res.status(200).json({ message: 'El voluntario ha sido actualizado.' });
        })
        .catch(error => {
            console.error(`Error al actualizar el voluntario con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar voluntario.' });
        });
    },

    async deleteVol(req, res) {
        const id = req.params.id; 
    
        try {
            const voluntarios = await VOLUNTARIOS.findByPk(id);
    
            if (!voluntarios) {
                return res.status(404).json({ error: 'Voluntario no encontrado' });
            }
    
            await voluntarios.destroy();
            return res.status(200).json({ message: 'Voluntario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar voluntario:', error);
            return res.status(500).json({ error: 'Error al eliminar voluntario' });
        }
    },

    // Controlador de voluntarios
    async findWithAssignedProducts(req, res) {
        try {
        const voluntariosConProductos = await db.voluntarios.findAll({
            include: [
            {
                model: db.detalle_productos_voluntarios,
                as: 'detalle_productos_voluntarios',
                required: true, // Solo trae voluntarios que tienen productos asignados
                attributes: ['idProducto', 'cantidad'], // Datos necesarios
                include: [
                {
                    model: db.productos,
                    as: 'producto',
                    attributes: ['idProducto', 'nombreProducto', 'precio'], // Información del producto
                },
                ],
            },
            {
                model: db.personas,
                as: 'persona',
                attributes: ['idPersona', 'nombre', 'telefono', 'domicilio'], // Información del voluntario
            },
            ],
            where: { estado: 1 }
        });
    
        if (!voluntariosConProductos || voluntariosConProductos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron voluntarios con productos asignados.' });
        }
    
        return res.status(200).json(voluntariosConProductos);
        } catch (error) {
        console.error('Error al buscar voluntarios con productos asignados:', error);
        return res.status(500).json({ message: 'Ocurrió un error al buscar voluntarios con productos asignados.' });
        }
    }, 
    
    // productos por id de voluntarios
    async findWithAssignedProductsById(req, res) {
        const { idVoluntario } = req.params;
    
        try {
            const voluntarioConProductos = await db.voluntarios.findOne({
                include: [
                    {
                        model: db.detalle_productos_voluntarios,
                        as: 'detalle_productos_voluntarios',
                        required: true, // Solo trae el voluntario si tiene productos asignados
                        attributes: ['idProducto', 'cantidad'], // Datos necesarios
                        include: [
                            {
                                model: db.productos,
                                as: 'producto',
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'foto'], // Información del producto
                            },
                        ],
                    },
                    {
                        model: db.personas,
                        as: 'persona',
                        attributes: ['idPersona', 'nombre', 'telefono', 'domicilio'], // Información del voluntario
                    },
                ],
                where: {
                    idVoluntario: idVoluntario,
                    estado: 1
                }
            });
    
            if (!voluntarioConProductos) {
                return res.status(404).json({ message: 'No se encontró el voluntario con productos asignados.' });
            }
    
            return res.status(200).json(voluntarioConProductos);
        } catch (error) {
            console.error('Error al buscar el voluntario con productos asignados:', error);
            return res.status(500).json({ message: 'Ocurrió un error al buscar el voluntario con productos asignados.' });
        }
    },
};