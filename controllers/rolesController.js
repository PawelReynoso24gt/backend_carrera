'use strict';
const db = require("../models");
const roles = require("../models/roles");
const ROLES = db.roles;

// Métodos CRUD
module.exports = {
    
    async find(req, res) {
        try {
            const roles = await ROLES.findAll({
                where: {
                    estado: 1
                }
            });
            
            return res.status(200).json(roles);
        } catch (error) {
            console.error('Error al recuperar los roles:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
    
    async findActivateRol(req, res) {
        return ROLES.findAll({
            where: {
                estado: 1 
            }
        })
        .then((roles) => {
            res.status(200).send(roles);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los roles.'
            });
        });
    },

    async findaInactivateRol(req, res) {
        return ROLES.findAll({
            where: {
                estado: 0 
            }
        })
        .then((roles) => {
            res.status(200).send(roles);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los roles.'
            });
        });
    },

    createRol(req, res) {
        const datos = req.body;
    
        // Validación del campo departamento
        if (!datos.roles) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }
    
        // Expresión regular para permitir letras, tildes y espacios
        const regex = /^[A-Za-zÁÉÍÓÚáéíóú\s]+$/;
        if (!regex.test(datos.roles)) {
            return res.status(400).json({ message: 'El nombre del rol solo debe contener letras, espacios y tildes.' });
        }
    
        const datos_ingreso = { 
            roles: datos.roles,
            estado: datos.estado !== undefined ? datos.estado : 1 
        };
    
        return ROLES.create(datos_ingreso)
            .then(roles => {
                return res.status(201).json(roles);
            })
            .catch(error => {
                console.error('Error al insertar el rol:', error);
                return res.status(500).json({ error: 'Error al insertar el rol' });
            });
    },
    
    updateRol(req, res) {
        const datos = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};
        
        // Validación del campo departamento si está presente en los datos
        if (datos.roles !== undefined) {
            const regex = /^[A-Za-zÁÉÍÓÚáéíóú\s]+$/;
            if (!regex.test(datos.roles)) {
                return res.status(400).json({ message: 'El nombre del rol solo debe contener letras, espacios y tildes.' });
            }
            camposActualizados.roles = datos.roles;
        }
    
        if (datos.estado !== undefined) {
            camposActualizados.estado = datos.estado; 
        }
    
        return ROLES.update(
            camposActualizados,
            {
                where: { idRol: id } 
            }
        )
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Rol no encontrado' });
            }
            return res.status(200).json({ message: 'El rol ha sido actualizado' });
        })
        .catch(error => {
            console.error(`Error al actualizar el rol con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar rol' });
        });
    },
    
    
    async deleteRol(req, res) {
        const id = req.params.id; 
    
        try {
            const departamentos = await DEPARTAMENTOS.findByPk(id);
    
            if (!departamentos) {
                return res.status(404).json({ error: 'Departamento no encontrado' });
            }
    
            await departamentos.destroy();
            return res.status(200).json({ message: 'Departamento eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar departamento:', error);
            return res.status(500).json({ error: 'Error al eliminar departamento' });
        }
    }
};