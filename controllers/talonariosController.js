'use strict';
const db = require("../models");
const talonarios = require("../models/talonarios");
const TALONARIOS = db.talonarios;

// Métodos CRUD
module.exports = {
    
    async find(req, res) {
        try {
            const talonarios = await TALONARIOS.findAll({
                where: {
                    estado: 1
                }
            });
            
            return res.status(200).json(talonarios);
        } catch (error) {
            console.error('Error al recuperar los talonarios:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
    
    async findActivateTalo(req, res) {
        return TALONARIOS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((talonarios) => {
            res.status(200).send(talonarios);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los talonarios.'
            });
        });
    },

    async findaInactivateTalo(req, res) {
        return TALONARIOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((talonarios) => {
            res.status(200).send(talonarios);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los talonarios.'
            });
        });
    },

    createTalo(req, res) {
        const datos = req.body;
    
        // Validación del campo talonarios
        if (!datos.codigoTalonario || !datos.correlativoInicio || !datos.correlativoFinal || !datos.idRifa) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }
    
        // Expresión regular para permitir letras, tildes y espacios
        const regexTalonarios = /^[A-Za-zÁÉÍÓÚáéíóú\s]+$/;
        if (!regexTalonarios.test(datos.talonarios)) {
            return res.status(400).json({ message: 'El nombre del talonario solo debe contener letras, espacios y tildes.' });
        }
    
        // Validación para codigoTalonario
        const regexNumeros = /^[0-9]+$/;
        if (!regexNumeros.test(datos.codigoTalonario)) {
            return res.status(400).json({ message: 'El código del talonario solo debe contener números.' });
        }
    
        // Validación para correlativoInicio
        if (!regexNumeros.test(datos.correlativoInicio)) {
            return res.status(400).json({ message: 'El correlativo inicial solo debe contener números.' });
        }
    
        // Validación para correlativoFinal
        if (!regexNumeros.test(datos.correlativoFinal)) {
            return res.status(400).json({ message: 'El correlativo final solo debe contener números.' });
        }
    
        // Validación para cantidadBoletos
        if (!regexNumeros.test(datos.cantidadBoletos)) {
            return res.status(400).json({ message: 'La cantidad de boletos solo debe contener números.' });
        }
    
        const datos_ingreso = { 
            codigoTalonario: datos.codigoTalonario,
            cantidadBoletos: datos.cantidadBoletos,
            correlativoInicio: datos.correlativoInicio,
            correlativoFinal: datos.correlativoFinal,
            estado: datos.estado !== undefined ? datos.estado : 1,
            idRifa: datos.idRifa
        };
    
        return TALONARIOS.create(datos_ingreso)
            .then(talonarios => {
                return res.status(201).json(talonarios);
            })
            .catch(error => {
                console.error('Error al insertar el talonario:', error);
                return res.status(500).json({ error: 'Error al insertar el talonario' });
            });
    },
    
    updateTalo(req, res) {
        const datos = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};
    
        // Validación del campo talonarios si está presente en los datos
        if (datos.talonarios !== undefined) {
            const regexTalonarios = /^[A-Za-zÁÉÍÓÚáéíóú\s]+$/;
            if (!regexTalonarios.test(datos.talonarios)) {
                return res.status(400).json({ message: 'El nombre del talonario solo debe contener letras, espacios y tildes.' });
            }
            camposActualizados.talonarios = datos.talonarios;
        }
    
        // Validación del campo codigoTalonario si está presente
        if (datos.codigoTalonario !== undefined) {
            const regexNumeros = /^[0-9]+$/;
            if (!regexNumeros.test(datos.codigoTalonario)) {
                return res.status(400).json({ message: 'El código del talonario solo debe contener números.' });
            }
            camposActualizados.codigoTalonario = datos.codigoTalonario;
        }
    
        // Validación del campo correlativoInicio si está presente
        if (datos.correlativoInicio !== undefined) {
            const regexNumeros = /^[0-9]+$/;
            if (!regexNumeros.test(datos.correlativoInicio)) {
                return res.status(400).json({ message: 'El correlativo inicial solo debe contener números.' });
            }
            camposActualizados.correlativoInicio = datos.correlativoInicio;
        }
    
        // Validación del campo correlativoFinal si está presente
        if (datos.correlativoFinal !== undefined) {
            const regexNumeros = /^[0-9]+$/;
            if (!regexNumeros.test(datos.correlativoFinal)) {
                return res.status(400).json({ message: 'El correlativo final solo debe contener números.' });
            }
            camposActualizados.correlativoFinal = datos.correlativoFinal;
        }
    
        // Validación del campo cantidadBoletos si está presente
        if (datos.cantidadBoletos !== undefined) {
            const regexNumeros = /^[0-9]+$/;
            if (!regexNumeros.test(datos.cantidadBoletos)) {
                return res.status(400).json({ message: 'La cantidad de boletos solo debe contener números.' });
            }
            camposActualizados.cantidadBoletos = datos.cantidadBoletos;
        }

        // Validación del campo idRifa si está presente
        if (datos.idRifa !== undefined) {
            const regexNumeros = /^[0-9]+$/;
            if (!regexNumeros.test(datos.idRifa)) {
                return res.status(400).json({ message: 'El ID de la rifa solo debe contener números.' });
            }
            camposActualizados.idRifa = datos.idRifa;
        }
    
        // Validación del campo estado si está presente
        if (datos.estado !== undefined) {
            camposActualizados.estado = datos.estado;
        }
    
        return TALONARIOS.update(
            camposActualizados,
            {
                where: { idTalonario: id }
            }
        )
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Talonario no encontrado' });
            }
            return res.status(200).json({ message: 'El talonario ha sido actualizado' });
        })
        .catch(error => {
            console.error(`Error al actualizar el talonario con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar talonario' });
        });
    },
    
    async deleteTalo(req, res) {
        const id = req.params.id; 
    
        try {
            const talonarios = await TALONARIOS.findByPk(id);
    
            if (!talonarios) {
                return res.status(404).json({ error: 'Talonario no encontrado' });
            }
    
            await talonarios.destroy();
            return res.status(200).json({ message: 'Talonario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar talonario:', error);
            return res.status(500).json({ error: 'Error al eliminar talonario' });
        }
    }
};