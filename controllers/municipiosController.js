'use strict';
const db = require("../models");
const stands = require("../models/tipoPagos");
const sedes = require("../models/sedes");
const municipios = require("../models/municipios");
const Municipios = db.municipios;
const Departamentos = db.departamentos;
const TipoStands = db.tipo_stands;

// Métodos CRUD
module.exports = {

    async find(req, res) {
        try {
            const municipios = await Municipios.findAll({
                where: {
                    estado: 1
                }
            });
            
            return res.status(200).json(municipios);
        } catch (error) {
            console.error('Error al recuperar los municipios:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
    
    async findActivateMunicipios(req, res) {
        return Municipios.findAll({
            where: {
                estado: 1 
            }
        })
        .then((municipios) => {
            res.status(200).send(municipios);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los municipios.'
            });
        });
    },

    async findInactiveMunicipios(req, res) {
        return Municipios.findAll({
            where: {
                estado: 0 
            }
        })
        .then((municipios) => {
            res.status(200).send(municipios);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los municipios.'
            });
        });
    },

    createMunicipio: async (req, res) => {
        const datos = req.body;
    
        // Validación de campos requeridos
        if (!datos.municipio || !datos.idDepartamento) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }
    
        // Expresión regular para validar el formato del campo municipio
        const regexMunicipio = /^[A-Za-z0-9\s-]+$/;
    
        if (!regexMunicipio.test(datos.municipio)) {
            return res.status(400).json({ message: 'El nombre del municipio solo debe contener letras, números, guiones y espacios.' });
        }
    
        try {
            // Validación de existencia del idDepartamento
            const departamentoExistente = await Departamentos.findByPk(datos.idDepartamento);
            
            if (!departamentoExistente) {
                return res.status(400).json({ error: 'El idDepartamento ingresado no existe.' });
            }
    
            const datos_ingreso = { 
                municipio: datos.municipio,
                estado: datos.estado !== undefined ? datos.estado : 1,
                idDepartamento: datos.idDepartamento
            };
    
            const municipioCreado = await Municipios.create(datos_ingreso);
            return res.status(201).json(municipioCreado);
    
        } catch (error) {
            console.error('Error al insertar el municipio:', error);
            return res.status(500).json({ error: 'Error al insertar el municipio' });
        }
    },
    
    updateMunicipio: async (req, res) => {
        const datos = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};
    
        // Expresión regular para validar el formato del campo municipio
        const regexMunicipio = /^[A-Za-z0-9\s-]+$/;
    
        if (datos.municipio !== undefined) {
            if (!regexMunicipio.test(datos.municipio)) {
                return res.status(400).json({ message: 'El nombre del municipio solo debe contener letras, números, guiones y espacios.' });
            }
            camposActualizados.municipio = datos.municipio;
        }
    
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idDepartamento !== undefined) camposActualizados.idDepartamento = datos.idDepartamento;
    
        try {
            // Validación de existencia de idDepartamento si está presente en los datos
            if (datos.idDepartamento) {
                const departamentoExistente = await Departamentos.findByPk(datos.idDepartamento);
                if (!departamentoExistente) {
                    return res.status(400).json({ error: 'El idDepartamento ingresado no existe.' });
                }
            }
    
            const [rowsUpdated] = await Municipios.update(camposActualizados, {
                where: { idMunicipio: id } 
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Municipio no encontrado' });
            }
    
            return res.status(200).json({ message: 'El municipio ha sido actualizado' });
    
        } catch (error) {
            console.error(`Error al actualizar el municipio con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar municipio' });
        }
    },
    
    async deleteMunicipio(req, res) {
        const id = req.params.id; 
    
        try {
            const municipio = await Municipios.findByPk(id);
    
            if (!municipio) {
                return res.status(404).json({ error: 'Municipio no encontrado' });
            }
    
            await municipio.destroy();
            return res.status(200).json({ message: 'Municipio eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar municipio:', error);
            return res.status(500).json({ error: 'Error al eliminar municipio' });
        }
    }
};