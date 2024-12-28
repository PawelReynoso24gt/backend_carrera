'use strict';
const db = require("../models");
const departamentos = require("../models/departamentos");
const DEPARTAMENTOS = db.departamentos;

// Métodos CRUD
module.exports = {
    
    async find(req, res) {
        try {
            const departamentos = await DEPARTAMENTOS.findAll({
                where: {
                    estado: 1
                }
            });
            
            return res.status(200).json(departamentos);
        } catch (error) {
            console.error('Error al recuperar los departamentos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
   
    
    async findActivateDepto(req, res) {
        return DEPARTAMENTOS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((departamentos) => {
            res.status(200).send(departamentos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los departamentos.'
            });
        });
    },

    async findaInactivateDepto(req, res) {
        return DEPARTAMENTOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((departamentos) => {
            res.status(200).send(departamentos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los departamentos.'
            });
        });
    },

    createDepto(req, res) {
        const datos = req.body;
    
        // Validación del campo departamento
        if (!datos.departamento) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }
    
        // Expresión regular para permitir letras, tildes y espacios
        const regex = /^[A-Za-zÁÉÍÓÚáéíóú\s]+$/;
        if (!regex.test(datos.departamento)) {
            return res.status(400).json({ message: 'El nombre del departamento solo debe contener letras, espacios y tildes.' });
        }
    
        const datos_ingreso = { 
            departamento: datos.departamento,
            estado: datos.estado !== undefined ? datos.estado : 1 
        };
    
        return DEPARTAMENTOS.create(datos_ingreso)
            .then(departamentos => {
                return res.status(201).json(departamentos);
            })
            .catch(error => {
                console.error('Error al insertar el departamento:', error);
                return res.status(500).json({ error: 'Error al insertar el departamento' });
            });
    },
    
    updateDepto(req, res) {
        const datos = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};
        
        // Validación del campo departamento si está presente en los datos
        if (datos.departamento !== undefined) {
            const regex = /^[A-Za-zÁÉÍÓÚáéíóú\s]+$/;
            if (!regex.test(datos.departamento)) {
                return res.status(400).json({ message: 'El nombre del departamento solo debe contener letras, espacios y tildes.' });
            }
            camposActualizados.departamento = datos.departamento;
        }
    
        if (datos.estado !== undefined) {
            camposActualizados.estado = datos.estado; 
        }
    
        return DEPARTAMENTOS.update(
            camposActualizados,
            {
                where: { idDepartamento: id } 
            }
        )
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Departamento no encontrado' });
            }
            return res.status(200).json({ message: 'El departamento ha sido actualizado' });
        })
        .catch(error => {
            console.error(`Error al actualizar el departamento con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar departamento' });
        });
    },
    
    
    async deleteDepto(req, res) {
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