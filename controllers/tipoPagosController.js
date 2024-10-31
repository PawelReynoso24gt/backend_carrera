'use strict';
const db = require("../models");
const tipo_pagos = require("../models/tipoPagos");
const TIPOPAGOS = db.tipo_pagos;

// Métodos CRUD
module.exports = {

    // Obtener todos los clientes con estado activo
    async find(req, res) {
        try {
            const tipo_pagos = await TIPOPAGOS.findAll({
                where: {
                    estado: 1
                }
            });
            
            return res.status(200).json(tipo_pagos);
        } catch (error) {
            console.error('Error al recuperar los tipos de pago:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
    
    async findActivateDepto(req, res) {
        return TIPOPAGOS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((tipo_pagos) => {
            res.status(200).send(tipo_pagos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los tipos de pago.'
            });
        });
    },

    async findaInactivateDepto(req, res) {
        return TIPOPAGOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((tipo_pagos) => {
            res.status(200).send(tipo_pagos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los tipos de pago.'
            });
        });
    },

    createTipoPago(req, res) {
        const datos = req.body;

        if (!datos.tipo) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const datos_ingreso = { 
            tipo: datos.tipo,
            estado: datos.estado !== undefined ? datos.estado : 1 
        };

        return TIPOPAGOS.create(datos_ingreso)
            .then(tipo_pagos => {
                return res.status(201).json(tipo_pagos);
            })
            .catch(error => {
                console.error('Error al insertar el tipo pago:', error);
                return res.status(500).json({ error: 'Error al insertar el tipo pago' });
            });
    },

    updateTipoPago(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};
    
        if (datos.tipo !== undefined) camposActualizados.tipo = datos.tipo;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado; 

        return TIPOPAGOS.update(
            camposActualizados,
            {
                where: { idTipoPago: id } 
            }
        )
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Tipo Pago no encontrado' });
            }
            return res.status(200).json({ message: 'El tipo pago ha sido actualizado' });
        })
        .catch(error => {
            console.error(`Error al actualizar el tipo pago con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar tipo pago' });
        });
    },  



    async deleteTiposPago(req, res) {
        const id = req.params.id; 
    
        try {
            const tipo_pagos = await TIPOPAGOS.findByPk(id);
    
            if (!tipo_pagos) {
                return res.status(404).json({ error: 'Tipo de pago no encontrado' });
            }
    
            await tipo_pagos.destroy();
            return res.status(200).json({ message: 'Tipo de pago eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar tipo de pago:', error);
            return res.status(500).json({ error: 'Error al eliminar tipo de pago' });
        }
    }
};