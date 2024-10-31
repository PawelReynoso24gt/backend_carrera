'use strict';
const db = require("../models");
const stands = require("../models/tipoPagos");
const sedes = require("../models/sedes");
const STANDS = db.stands;
const Sede = db.sedes;
const TipoStands = db.tipo_stands;

// Métodos CRUD
module.exports = {

    async find(req, res) {
        try {
            const stands = await STANDS.findAll({
                where: {
                    estado: 1
                }
            });
            
            return res.status(200).json(stands);
        } catch (error) {
            console.error('Error al recuperar los stands:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
    
    async findActivateStand(req, res) {
        return STANDS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((stands) => {
            res.status(200).send(stands);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los stands.'
            });
        });
    },

    async findaInactivateStand(req, res) {
        return STANDS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((stands) => {
            res.status(200).send(stands);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los stands.'
            });
        });
    },

    createStand: async (req, res) => {
        const datos = req.body;
    
        if (!datos.nombreStand || !datos.direccion || !datos.idSede || !datos.idTipoStands) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }
    
        try {
           
            const sedeExistente = await Sede.findByPk(datos.idSede);
            const tipoStandExistente = await TipoStands.findByPk(datos.idTipoStands);
    
            if (!sedeExistente) {
                return res.status(400).json({ error: 'El idSede ingresado no existe.' });
            }
    
            if (!tipoStandExistente) {
                return res.status(400).json({ error: 'El idTipoStands ingresado no existe.' });
            }
            
            const datos_ingreso = { 
                tipo: datos.tipo,
                estado: datos.estado !== undefined ? datos.estado : 1, 
                nombreStand: datos.nombreStand,
                direccion: datos.direccion,
                idSede: datos.idSede,
                idTipoStands: datos.idTipoStands
            };
    
            const standCreado = await STANDS.create(datos_ingreso);
            return res.status(201).json(standCreado);
    
        } catch (error) {
            console.error('Error al insertar el stand:', error);
            return res.status(500).json({ error: 'Error al insertar el stand' });
        }
    },
    

    updateStand: async (req, res) => {
        const datos = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};
    
        if (datos.tipo !== undefined) camposActualizados.tipo = datos.tipo;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.nombreStand !== undefined) camposActualizados.nombreStand = datos.nombreStand;
        if (datos.direccion !== undefined) camposActualizados.direccion = datos.direccion;
        if (datos.idSede !== undefined) camposActualizados.idSede = datos.idSede;
        if (datos.idTipoStands !== undefined) camposActualizados.idTipoStands = datos.idTipoStands;
    
        try {
      
            if (datos.idSede) {
                const sedeExistente = await SEDE.findByPk(datos.idSede);
                if (!sedeExistente) {
                    return res.status(400).json({ error: 'El idSede ingresado no existe.' });
                }
            }
    
            if (datos.idTipoStands) {
                const tipoStandExistente = await TipoStands.findByPk(datos.idTipoStands);
                if (!tipoStandExistente) {
                    return res.status(400).json({ error: 'El idTipoStands ingresado no existe.' });
                }
            }
    
            // Realizar la actualización
            const [rowsUpdated] = await STANDS.update(camposActualizados, {
                where: { idStand: id } 
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Stand no encontrado' });
            }
    
            return res.status(200).json({ message: 'El stand ha sido actualizado' });
    
        } catch (error) {
            console.error(`Error al actualizar el stand con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar stand' });
        }
    },
    


    async deleteTiposPago(req, res) {
        const id = req.params.id; 
    
        try {
            const stands = await STANDS.findByPk(id);
    
            if (!stands) {
                return res.status(404).json({ error: 'Stand no encontrado' });
            }
    
            await stands.destroy();
            return res.status(200).json({ message: 'Stand eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar stand:', error);
            return res.status(500).json({ error: 'Error al eliminar stand' });
        }
    }
};