'use strict';
const { format } = require('date-fns-tz');
const db = require('../models');
const EMPLEADOS = db.empleados;
const PERSONAS = db.personas;

module.exports = {
    // Obtener todos los empleados
    async find(req, res) {
        try {
            const empleados = await EMPLEADOS.findAll({
                include: [
                    {
                        model: PERSONAS,
                        as: 'persona',
                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                    }
                ],
                where: { estado: 1 } // Solo activos por defecto
            });
            return res.status(200).json(empleados);
        } catch (error) {
            console.error('Error al recuperar los empleados:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los empleados.'
            });
        }
    },

    // Obtener empleados activos
    async findActive(req, res) {
        try {
            const empleados = await EMPLEADOS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: PERSONAS,
                        as: 'persona',
                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                    }
                ]
            });
            return res.status(200).json(empleados);
        } catch (error) {
            console.error('Error al listar los empleados activos:', error);
            return res.status(500).json({
                message: 'Error al listar los empleados activos.'
            });
        }
    },

    // Obtener empleados inactivos
    async findInactive(req, res) {
        try {
            const empleados = await EMPLEADOS.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: PERSONAS,
                        as: 'persona',
                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                    }
                ]
            });
            return res.status(200).json(empleados);
        } catch (error) {
            console.error('Error al listar los empleados inactivos:', error);
            return res.status(500).json({
                message: 'Error al listar los empleados inactivos.'
            });
        }
    },

    // Obtener un empleado por ID
    async findById(req, res) {
        const id = req.params.id;
        try {
            const empleado = await EMPLEADOS.findByPk(id, {
                include: [
                    {
                        model: PERSONAS,
                        as: 'persona',
                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                    }
                ]
            });

            if (!empleado) {
                return res.status(404).json({ message: 'Empleado no encontrado' });
            }

            return res.status(200).json(empleado);
        } catch (error) {
            console.error(`Error al buscar el empleado con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar el empleado.'
            });
        }
    },

    // Crear un nuevo empleado
    async create(req, res) {
        const { fechaRegistro, fechaSalida, idPersona } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;
        if (!fechaRegistro || !fechaSalida || !idPersona) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            const nuevoEmpleado = await EMPLEADOS.create({
                fechaRegistro,
                fechaSalida,
                estado,
                idPersona
            });

            // Convertir fechas al formato UTC-6 para la respuesta
            const empleadoConFormato = {
                ...nuevoEmpleado.toJSON(),
                fechaRegistro: format(new Date(nuevoEmpleado.fechaRegistro), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala"
                }),
                fechaSalida: format(new Date(nuevoEmpleado.fechaSalida), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala"
                })
            };

            return res.status(201).json({
                message: 'Empleado creado con éxito',
                createdEmpleado: empleadoConFormato
            });
        } catch (error) {
            console.error('Error al crear el empleado:', error);
            return res.status(500).json({ message: 'Error al crear el empleado.' });
        }
    },

    // Actualizar un empleado existente
    async update(req, res) {
        const { fechaRegistro, fechaSalida, estado, idPersona } = req.body;
        const id = req.params.id;

        const camposActualizados = {};
        if (fechaRegistro !== undefined) camposActualizados.fechaRegistro = fechaRegistro;
        if (fechaSalida !== undefined) camposActualizados.fechaSalida = fechaSalida;
        if (estado !== undefined) camposActualizados.estado = estado;
        if (idPersona !== undefined) camposActualizados.idPersona = idPersona;

        try {
            const [rowsUpdated] = await EMPLEADOS.update(camposActualizados, {
                where: { idEmpleado: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Empleado no encontrado' });
            }

            const empleadoActualizado = await EMPLEADOS.findByPk(id, {
                include: [
                    {
                        model: PERSONAS,
                        as: 'persona',
                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                    }
                ]
            });

            // Convertir fechas al formato UTC-6 para la respuesta
            const empleadoConFormato = {
                ...empleadoActualizado.toJSON(),
                fechaRegistro: format(new Date(empleadoActualizado.fechaRegistro), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala"
                }),
                fechaSalida: format(new Date(empleadoActualizado.fechaSalida), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala"
                })
            };

            return res.status(200).json({
                message: `El empleado con ID: ${id} ha sido actualizado`,
                updatedEmpleado: empleadoConFormato
            });
        } catch (error) {
            console.error(`Error al actualizar el empleado con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al actualizar el empleado.' });
        }
    },

    // Eliminar un empleado
    async delete(req, res) {
        const id = req.params.id;

        try {
            const empleado = await EMPLEADOS.findByPk(id);

            if (!empleado) {
                return res.status(404).json({ message: 'Empleado no encontrado' });
            }

            await empleado.destroy();
            return res.status(200).json({ message: 'Empleado eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el empleado:', error);
            return res.status(500).json({ message: 'Error al eliminar el empleado.' });
        }
    }
};
