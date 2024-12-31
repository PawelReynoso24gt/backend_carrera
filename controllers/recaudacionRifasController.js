'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const RECAUDACION_RIFAS = db.recaudacion_rifas;
const SOLICITUD_TALONARIOS = db.solicitudTalonarios;
const TALONARIOS = db.talonarios;
const RIFAS = db.rifas;
const DETALLE_PAGO_RECAUDACION_RIFAS = db.detalle_pago_recaudacion_rifas;
const TIPO_PAGOS = db.tipo_pagos;
const VOLUNTARIOS = db.voluntarios;
const PERSONAS = db.personas;

module.exports = {

    // * Listar todas las recaudaciones con los datos de la solicitud de talonario
    async findAll(req, res) {
        return RECAUDACION_RIFAS.findAll({
            include: [{
                model: SOLICITUD_TALONARIOS,
                attributes: ['idSolicitudTalonario', 'fechaSolicitud']
            }]
        })
        .then((recaudaciones) => {
            res.status(200).send(recaudaciones);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las recaudaciones.'
            });
        });
    },

    // * Listar todas las recaudaciones activas
    async findActive(req, res) {
        return RECAUDACION_RIFAS.findAll({
            where: {
                estado: 1
            },
            include: [{
                model: SOLICITUD_TALONARIOS,
                attributes: ['idSolicitudTalonario', 'fechaSolicitud']
            }]
        })
        .then((recaudaciones) => {
            res.status(200).send(recaudaciones);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las recaudaciones activas.'
            });
        });
    },

    // * Listar todas las recaudaciones inactivas
    async findInactive(req, res) {
        return RECAUDACION_RIFAS.findAll({
            where: {
                estado: 0
            },
            include: [{
                model: SOLICITUD_TALONARIOS,
                attributes: ['idSolicitudTalonario', 'fechaSolicitud']
            }]
        })
        .then((recaudaciones) => {
            res.status(200).send(recaudaciones);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las recaudaciones inactivas.'
            });
        });
    },

    async getByDate(req, res) {
        const { fecha } = req.params;
        const [day, month, year] = fecha.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        try {
            const recaudaciones = await RECAUDACION_RIFAS.findAll({
                where: { createdAt: formattedDate }
            });
            return res.status(200).json(recaudaciones);
        } catch (error) {
            console.error(`Error al recuperar las recaudaciones de la fecha ${fecha}:`, error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar los datos.' });
        }
    },

    // * Crear una nueva recaudación
    async create(req, res) {
        const { boletosVendidos, estado, subTotal, idSolicitudTalonario } = req.body;

        if (!boletosVendidos || !idSolicitudTalonario || !subTotal) {
            return res.status(400).json({ message: 'Faltan campos requeridos: boletosVendidos, subTotal o idSolicitudTalonario.' });
        }

        try {
            const nuevaRecaudacion = await RECAUDACION_RIFAS.create({
                boletosVendidos,
                subTotal,
                estado: estado !== undefined ? estado : 1,
                idSolicitudTalonario
            });

            return res.status(201).json(nuevaRecaudacion);
        } catch (error) {
            console.error('Error al crear la recaudación:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear la recaudación.'
            });
        }
    },

    // * Actualizar una recaudación
    async update(req, res) {
        const { idRecaudacionRifa } = req.params;
        const { boletosVendidos, estado, subTotal, idSolicitudTalonario } = req.body;

        try {
            const recaudacion = await RECAUDACION_RIFAS.findByPk(idRecaudacionRifa);
            if (!recaudacion) {
                return res.status(404).json({ message: 'Recaudación no encontrada.' });
            }

            const updatedFields = {
                boletosVendidos: boletosVendidos !== undefined ? boletosVendidos : recaudacion.boletosVendidos,
                subTotal: subTotal !== undefined ? subTotal : recaudacion.subTotal,
                estado: estado !== undefined ? estado : recaudacion.estado,
                idSolicitudTalonario: idSolicitudTalonario || recaudacion.idSolicitudTalonario
            };

            await recaudacion.update(updatedFields);

            return res.status(200).json({ message: 'Recaudación actualizada con éxito.', recaudacion });
        } catch (error) {
            console.error('Error al actualizar la recaudación:', error);
            return res.status(500).json({
                message: error.message || 'Error al actualizar la recaudación.'
            });
        }
    },

    // * Eliminar una recaudación
    async delete(req, res) {
        const { idRecaudacionRifa } = req.params;

        try {
            const recaudacion = await RECAUDACION_RIFAS.findByPk(idRecaudacionRifa);
            if (!recaudacion) {
                return res.status(404).json({ message: 'Recaudación no encontrada.' });
            }

            await recaudacion.destroy();
            return res.status(200).json({ message: 'Recaudación eliminada con éxito.' });
        } catch (error) {
            console.error('Error al eliminar la recaudación:', error);
            return res.status(500).json({
                message: error.message || 'Error al eliminar la recaudación.'
            });
        }
    },

    // * obtener todas las recaudaciones completas
    async getTodasRecaudaciones(req, res) {
        try {
            // Buscar todas las recaudaciones con todos sus datos relacionados
            const recaudaciones = await RECAUDACION_RIFAS.findAll({
                where : {estado: 1},
                include: [
                    {
                        model: DETALLE_PAGO_RECAUDACION_RIFAS, // Detalles de los pagos
                        attributes: ['idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado'],
                        include: [
                            {
                                model: TIPO_PAGOS, // Tipo de pago
                                attributes: ['tipo']
                            }
                        ]
                    },
                    {
                        model: SOLICITUD_TALONARIOS, // Solicitud del talonario
                        include: [
                            {
                                model: TALONARIOS, // Talonario asociado
                                attributes: ['codigoTalonario', 'cantidadBoletos', 'correlativoInicio', 'correlativoFinal'],
                                include: [
                                    {
                                        model: RIFAS, // Información de la rifa
                                        attributes: ['nombreRifa', 'precioBoleto', 'descripcion', 'ventaTotal']
                                    }
                                ]
                            },
                            {
                                model: VOLUNTARIOS, // Información del voluntario
                                include: [
                                    {
                                        model: PERSONAS, // Información personal del voluntario
                                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            // // Verificar si se encontraron recaudaciones
            // if (!recaudaciones || recaudaciones.length === 0) {
            //     return res.status(404).json({ message: "No se encontraron recaudaciones." });
            // }

            // Responder con los datos de todas las recaudaciones
            return res.status(200).json(recaudaciones);
        } catch (error) {
            console.error("Error al obtener las recaudaciones completas:", error);
            return res.status(500).json({ message: "Error interno del servidor.", error: error.message });
        }
    },

    // * obtener todas las recaudaciones completas
    async getTodasRecaudacionesInactive(req, res) {
        try {
            // Buscar todas las recaudaciones con todos sus datos relacionados
            const recaudaciones = await RECAUDACION_RIFAS.findAll({
                where : {estado: 0},
                include: [
                    {
                        model: DETALLE_PAGO_RECAUDACION_RIFAS, // Detalles de los pagos
                        attributes: ['idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado'],
                        include: [
                            {
                                model: TIPO_PAGOS, // Tipo de pago
                                attributes: ['tipo']
                            }
                        ]
                    },
                    {
                        model: SOLICITUD_TALONARIOS, // Solicitud del talonario
                        include: [
                            {
                                model: TALONARIOS, // Talonario asociado
                                attributes: ['codigoTalonario', 'cantidadBoletos', 'correlativoInicio', 'correlativoFinal'],
                                include: [
                                    {
                                        model: RIFAS, // Información de la rifa
                                        attributes: ['nombreRifa', 'precioBoleto', 'descripcion', 'ventaTotal']
                                    }
                                ]
                            },
                            {
                                model: VOLUNTARIOS, // Información del voluntario
                                include: [
                                    {
                                        model: PERSONAS, // Información personal del voluntario
                                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            // // Verificar si se encontraron recaudaciones
            // if (!recaudaciones || recaudaciones.length === 0) {
            //     return res.status(404).json({ message: "No se encontraron recaudaciones." });
            // }

            // Responder con los datos de todas las recaudaciones
            return res.status(200).json(recaudaciones);
        } catch (error) {
            console.error("Error al obtener las recaudaciones completas:", error);
            return res.status(500).json({ message: "Error interno del servidor.", error: error.message });
        }
    },

    // * detalle de la recaudación
    async getRecaudacionCompleta(req, res) {
        const { idRecaudacionRifa } = req.params;

        try {
            // Validar que se proporcionó un ID
            if (!idRecaudacionRifa) {
                return res.status(400).json({ message: "El idRecaudacionRifa es requerido." });
            }

            // Buscar la recaudación con todos sus datos relacionados
            const recaudacion = await RECAUDACION_RIFAS.findOne({
                where: { idRecaudacionRifa },
                include: [
                    {
                        model: DETALLE_PAGO_RECAUDACION_RIFAS, // Detalles de los pagos
                        attributes: ['idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado'],
                        include: [
                            {
                                model: TIPO_PAGOS, // Tipo de pago
                                attributes: ['tipo']
                            }
                        ]
                    },
                    {
                        model: SOLICITUD_TALONARIOS, // Solicitud del talonario
                        include: [
                            {
                                model: TALONARIOS, // Talonario asociado
                                attributes: ['codigoTalonario', 'cantidadBoletos', 'correlativoInicio', 'correlativoFinal'],
                                include: [
                                    {
                                        model: RIFAS, // Información de la rifa
                                        attributes: ['nombreRifa', 'precioBoleto', 'descripcion', 'ventaTotal']
                                    }
                                ]
                            },
                            {
                                model: VOLUNTARIOS, // Información del voluntario
                                include: [
                                    {
                                        model: PERSONAS, // Información personal del voluntario
                                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            // Verificar si se encontró la recaudación
            if (!recaudacion) {
                return res.status(404).json({ message: "No se encontró la recaudación con el ID proporcionado." });
            }

            // Responder con los datos de la recaudación completa
            return res.status(200).json(recaudacion);
        } catch (error) {
            console.error("Error al obtener la recaudación completa:", error);
            return res.status(500).json({ message: "Error interno del servidor.", error: error.message });
        }
    },

    // * Creación de recaudación completa
    async createRecaudacionRifa(req, res) {
        const { idTalonario, boletosVendidos, pagos } = req.body;

        const transaction = await db.sequelize.transaction();
        try {
            // Validar parámetros básicos
            if (!idTalonario || !boletosVendidos || !pagos) {
                return res.status(400).json({ message: "Faltan datos para realizar la recaudación." });
            }

            // Validar que exista el talonario con una solicitud activa
            const talonario = await TALONARIOS.findOne({
                where: { idTalonario },
                include: [
                    {
                        model: SOLICITUD_TALONARIOS,
                        where: { estado: 1 },
                        include: [
                            {
                                model: VOLUNTARIOS,
                                include: [
                                    {
                                        model: PERSONAS,
                                        attributes: ['idPersona', 'nombre', 'telefono', 'correo'],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: RIFAS,
                        attributes: ['idRifa', 'precioBoleto', 'ventaTotal'], // Asegurar que idRifa esté disponible
                    },
                ],
            });

            if (!talonario) {
                return res.status(404).json({ message: "No se encontró el talonario o no tiene una solicitud activa." });
            }

            // Validar disponibilidad de boletos
            if (talonario.cantidadBoletos < boletosVendidos) {
                return res.status(400).json({ message: "No hay suficientes boletos disponibles en este talonario." });
            }

            // Calcular el subtotal
            const subtotal = boletosVendidos * parseFloat(talonario.rifa.precioBoleto);

            // Validar que el monto total pagado sea igual al subtotal
            const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
            if (totalPagado !== subtotal) {
                return res.status(400).json({
                    message: `El total recaudado (Q${subtotal.toFixed(2)}) no coincide con el monto total pagado (Q${totalPagado.toFixed(2)}).`,
                });
            }

            // Crear la recaudación
            const nuevaRecaudacion = await RECAUDACION_RIFAS.create(
                {
                    boletosVendidos,
                    subTotal: subtotal,
                    estado: 1, // Activa por defecto
                    idSolicitudTalonario: talonario.solicitudTalonarios[0].idSolicitudTalonario,
                },
                { transaction }
            );

            // Actualizar el inventario de boletos en el talonario
            await talonario.update(
                { cantidadBoletos: talonario.cantidadBoletos - boletosVendidos },
                { transaction }
            );

            // Validar que la rifa asociada existe
            const rifa = talonario.rifa;

            if (!rifa || !rifa.idRifa) {
                throw new Error(`No se encontró la rifa asociada al talonario.`);
            }

            // Actualizar el total de venta de la rifa
            const nuevaVentaTotal = parseFloat(rifa.ventaTotal) + subtotal;

            await RIFAS.update(
                { ventaTotal: nuevaVentaTotal },
                { where: { idRifa: rifa.idRifa }, transaction }
            );

            // Validar y crear los detalles de pago
            for (const pago of pagos) {
                if (!pago.idTipoPago || !pago.monto) {
                    throw new Error("Cada pago debe tener un tipo y un monto válido.");
                }

                let correlativo = pago.correlativo || "NA";
                let imagenTransferencia = pago.imagenTransferencia || "efectivo";

                // Validar correlativo e imagen para ciertos tipos de pago
                if ([1, 2, 4].includes(pago.idTipoPago)) { // Depósito, Transferencia, Cheque
                    if (!pago.correlativo || !pago.imagenTransferencia) {
                        throw new Error(`El tipo de pago ${pago.idTipoPago} requiere correlativo e imagen.`);
                    }
                }

                await DETALLE_PAGO_RECAUDACION_RIFAS.create(
                    {
                        idRecaudacionRifa: nuevaRecaudacion.idRecaudacionRifa,
                        idTipoPago: pago.idTipoPago,
                        pago: pago.monto,
                        correlativo,
                        imagenTransferencia,
                        estado: pago.estado || 1, // Activo por defecto
                    },
                    { transaction }
                );
            }

            // Confirmar la transacción
            await transaction.commit();

            return res.status(201).json({
                message: "Recaudación creada con éxito.",
                recaudacion: nuevaRecaudacion,
            });
        } catch (error) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            console.error("Error al crear la recaudación:", error);
            return res.status(500).json({ message: "Error al crear la recaudación.", error: error.message });
        }
    },

    // * Actualización de recaudación completa
    async updateRecaudacionRifa(req, res) {
        const { idRecaudacionRifa, boletosVendidos, pagos } = req.body;

        const transaction = await db.sequelize.transaction();
        try {
            // Validar parámetros básicos
            if (!idRecaudacionRifa || !boletosVendidos || !pagos) {
                return res.status(400).json({ message: "Faltan datos para actualizar la recaudación." });
            }

            // Obtener la recaudación actual
            const recaudacion = await RECAUDACION_RIFAS.findOne({
                where: { idRecaudacionRifa },
                include: [
                    {
                        model: SOLICITUD_TALONARIOS,
                        include: [
                            {
                                model: TALONARIOS,
                                include: [
                                    { model: RIFAS, attributes: ['idRifa', 'precioBoleto', 'ventaTotal'] },
                                ],
                            },
                        ],
                    },
                ],
            });

            if (!recaudacion) {
                return res.status(404).json({ message: "No se encontró la recaudación." });
            }

            const talonario = recaudacion.solicitudTalonario.talonario;
            const rifa = talonario.rifa;

            // Calcular el nuevo subtotal
            const nuevoSubtotal = boletosVendidos * parseFloat(rifa.precioBoleto);

            // Ajustar la venta total de la rifa
            const diferenciaSubtotal = nuevoSubtotal - recaudacion.subTotal;
            const nuevaVentaTotal = parseFloat(rifa.ventaTotal) + diferenciaSubtotal;

            await RIFAS.update(
                { ventaTotal: nuevaVentaTotal },
                { where: { idRifa: rifa.idRifa }, transaction }
            );

            // Ajustar el inventario del talonario
            const diferenciaBoletos = boletosVendidos - recaudacion.boletosVendidos;
            const nuevaCantidadBoletos = talonario.cantidadBoletos - diferenciaBoletos;

            if (nuevaCantidadBoletos < 0) {
                return res.status(400).json({ message: "No hay suficientes boletos disponibles en el talonario." });
            }

            await TALONARIOS.update(
                { cantidadBoletos: nuevaCantidadBoletos },
                { where: { idTalonario: talonario.idTalonario }, transaction }
            );

            // Actualizar los detalles de pago
            await DETALLE_PAGO_RECAUDACION_RIFAS.destroy({
                where: { idRecaudacionRifa },
                transaction,
            });

            for (const pago of pagos) {
                if (!pago.idTipoPago || !pago.monto) {
                    throw new Error("Cada pago debe tener un tipo y un monto válido.");
                }

                let correlativo = pago.correlativo || "NA";
                let imagenTransferencia = pago.imagenTransferencia || "efectivo";

                if ([1, 2, 4].includes(pago.idTipoPago)) {
                    if (!pago.correlativo || !pago.imagenTransferencia) {
                        throw new Error(`El tipo de pago ${pago.idTipoPago} requiere correlativo e imagen.`);
                    }
                }

                await DETALLE_PAGO_RECAUDACION_RIFAS.create(
                    {
                        idRecaudacionRifa: recaudacion.idRecaudacionRifa,
                        idTipoPago: pago.idTipoPago,
                        pago: pago.monto,
                        correlativo,
                        imagenTransferencia,
                        estado: pago.estado || 1,
                    },
                    { transaction }
                );
            }

            // Actualizar los datos de la recaudación
            await RECAUDACION_RIFAS.update(
                {
                    boletosVendidos,
                    subTotal: nuevoSubtotal,
                },
                { where: { idRecaudacionRifa }, transaction }
            );

            // Confirmar la transacción
            await transaction.commit();

            return res.status(200).json({ message: "Recaudación actualizada con éxito." });
        } catch (error) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            console.error("Error al actualizar la recaudación:", error);
            return res.status(500).json({ message: "Error al actualizar la recaudación.", error: error.message });
        }
    },

};
