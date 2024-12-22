// ! Controlador de detalle_horarios
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const DetalleHorarios = db.detalle_horarios;

// Función para validar los datos de entrada para create y update
function validateDetalleHorarioData(data) {
    if (data.cantidadPersonas !== undefined) {
        if (isNaN(data.cantidadPersonas) || data.cantidadPersonas < 0) {
            return 'El campo cantidadPersonas debe ser un número positivo';
        }
    }
    if (data.estado !== undefined) {
        if (data.estado !== 0 && data.estado !== 1) {
            return 'El campo estado debe ser 0 o 1';
        }
    }
    if (data.idHorario !== undefined) {
        if (isNaN(data.idHorario) || data.idHorario <= 0) {
            return 'El campo idHorario debe ser un número positivo';
        }
    }
    if (data.idCategoriaHorario !== undefined) {
        if (isNaN(data.idCategoriaHorario) || data.idCategoriaHorario <= 0) {
            return 'El campo idCategoriaHorario debe ser un número positivo';
        }
    }
    
    return null;
}

module.exports = {
    // * Get detalles de horarios activos
    async findActive(req, res) {
        try {
            const detalles = await DetalleHorarios.findAll({
                where: {
                    estado: 1 // Filtrar por estado 1
                },
                include: ['horario', 'categoriaHorario']
            });
            return res.status(200).send(detalles);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get detalles de horarios activos
    async findInactive(req, res) {
        try {
            const detalles = await DetalleHorarios.findAll({
                where: {
                    estado: 0 // Filtrar por estado 0
                },
                include: ['horario', 'categoriaHorario']
            });
            return res.status(200).send(detalles);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get todos los detalles de horarios
    async findAll(req, res) {
        try {
            const detalles = await DetalleHorarios.findAll({
                where: {estado: 1},
                include: ['horario', 'categoriaHorario']
            });
            return res.status(200).send(detalles);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get detalle de horario por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const detalle = await DetalleHorarios.findByPk(id, {
                include: ['horario', 'categoriaHorario']
            });
            if (!detalle) {
                return res.status(404).send({
                    message: 'Detalle de horario no encontrado.'
                });
            }
            return res.status(200).send(detalle);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al intentar recuperar el registro.'
            });
        }
    },

    // * Traer detalle de hoarioa para comisiones
    async findByCategoriaComisiones(req, res) {
        try {
            const detalles = await DetalleHorarios.findAll({
                where: {
                    idCategoriaHorario: 1, // Fijar el ID de la categoría a 1 para "Comisiones"
                    estado: 1 // Solo traer los activos
                },
                include: [
                    { 
                        model: db.horarios, 
                        as: 'horario', // Usa el alias definido en el modelo
                        attributes: ['horarioInicio', 'horarioFinal', 'estado'] 
                    },
                    { 
                        model: db.categoria_horarios, 
                        as: 'categoriaHorario', // Usa el alias definido en el modelo
                        attributes: ['categoria'] 
                    }
                ]
            });

            if (detalles.length === 0) {
                return res.status(404).json({ message: 'No se encontraron detalles de horarios para la categoría especificada.' });
            }

            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al filtrar detalles de horarios por categoría:', error);
            return res.status(500).json({ error: 'Ocurrió un error al recuperar los detalles de horarios.' });
        }
    },

    // * Crear detalle de horario
    async create(req, res) {
        const datos = req.body;
    
        // Validar los datos antes de insertarlos
        const error = validateDetalleHorarioData(datos);
        if (error) {
            return res.status(400).json({ error });
        }
    
        const datos_ingreso = {
            cantidadPersonas: datos.cantidadPersonas,
            estado: 1,
            idHorario: datos.idHorario,
            idCategoriaHorario: datos.idCategoriaHorario
        };

        try {
            const newDetalle = await DetalleHorarios.create(datos_ingreso);
            return res.status(201).send(newDetalle);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al insertar detalle de horario' });
        }
    },

    // * Actualizar detalle de horario
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        // Validar los datos antes de actualizarlos
        const error = validateDetalleHorarioData(datos);
        if (error) {
            console.error('Error al validar los datos:', error);
            return res.status(400).json({ error });
        }
    
        const camposActualizados = {};

        if (datos.cantidadPersonas !== undefined) camposActualizados.cantidadPersonas = datos.cantidadPersonas;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idHorario !== undefined) camposActualizados.idHorario = datos.idHorario;
        if (datos.idCategoriaHorario !== undefined) camposActualizados.idCategoriaHorario = datos.idCategoriaHorario;

        try {
            const [rowsUpdated] = await DetalleHorarios.update(camposActualizados, {
                where: { idDetalleHorario: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Detalle de horario no encontrado' });
            }

            return res.status(200).send('El detalle de horario ha sido actualizado');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar detalle de horario' });
        }
    },

    // * Eliminar detalle de horario
    async delete(req, res) {
        const id = req.params.id;

        try {
            const detalle = await DetalleHorarios.findByPk(id);
            if (!detalle) {
                return res.status(404).json({ error: 'Detalle de horario no encontrado' });
            }

            await detalle.destroy();
            return res.json({ message: 'Detalle de horario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar detalle de horario:', error);
            return res.status(500).json({ error: 'Error al eliminar detalle de horario' });
        }
    }
};