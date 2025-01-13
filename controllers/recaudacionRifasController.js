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

            // Calcular el total de los montos pagados
            const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);

            // Calcular el total esperado
            const precioBoleto = parseFloat(talonario.rifa.precioBoleto);
            const totalEsperado = boletosVendidos * precioBoleto;

            // Comparar ambos totales
            if (totalPagado !== totalEsperado) {
                return res.status(400).json({
                    message: `El total pagado (Q${totalPagado.toFixed(2)}) no coincide con el total esperado (Q${totalEsperado.toFixed(2)}).`,
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

    // * Actualizar una recaudación con todos sus datos
    async updateRecaudacionRifa(req, res) {
        const { idRecaudacionRifa, idTalonario, boletosVendidos, pagos } = req.body;
    
        const transaction = await db.sequelize.transaction();
        try {
            // Validar parámetros básicos
            if (!idRecaudacionRifa || !idTalonario || !boletosVendidos || !pagos) {
                return res.status(400).json({ message: "Faltan datos para actualizar la recaudación." });
            }
    
            // Buscar la recaudación existente
            const recaudacion = await RECAUDACION_RIFAS.findByPk(idRecaudacionRifa, {
                include: [
                    {
                        model: SOLICITUD_TALONARIOS,
                        include: [
                            {
                                model: TALONARIOS,
                                include: [
                                    {
                                        model: RIFAS,
                                        attributes: ['idRifa', 'precioBoleto', 'ventaTotal'],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: DETALLE_PAGO_RECAUDACION_RIFAS,
                    },
                ],
                transaction
            });
    
            if (!recaudacion) {
                await transaction.rollback();
                return res.status(404).json({ message: "No se encontró la recaudación." });
            }
    
            // Guardar el subtotal anterior
            const subtotalAnterior = parseFloat(recaudacion.subTotal);
    
            // Validar disponibilidad de boletos en el talonario actual
            const talonarioActual = recaudacion.solicitudTalonario.talonario;
            const boletosDisponiblesActuales = talonarioActual.cantidadBoletos + recaudacion.boletosVendidos;
    
            // Verificar si hay cambios en los datos
            const cambiosBoletos = boletosVendidos !== recaudacion.boletosVendidos;
            const cambiosTalonario = idTalonario !== talonarioActual.idTalonario;
            const cambiosPagos = JSON.stringify(pagos) !== JSON.stringify(recaudacion.detalle_pago_recaudacion_rifas.map(p => ({
                idTipoPago: p.idTipoPago,
                monto: parseFloat(p.pago),
                correlativo: p.correlativo,
                imagenTransferencia: p.imagenTransferencia
            })));
    
            if (!cambiosBoletos && !cambiosTalonario && !cambiosPagos) {
                await transaction.rollback();
                return res.status(200).json({ message: "No hay cambios en los datos." });
            }
    
            // Si cambia de talonario, actualizar la rifa anterior
            if (cambiosTalonario) {
                const rifaAnterior = talonarioActual.rifa;
                const nuevaVentaTotalRifaAnterior = parseFloat(rifaAnterior.ventaTotal) - subtotalAnterior;
    
                await RIFAS.update(
                    { ventaTotal: nuevaVentaTotalRifaAnterior },
                    { where: { idRifa: rifaAnterior.idRifa }, transaction }
                );
    
                // Log para verificar el valor guardado
                const rifaAnteriorActualizada = await RIFAS.findByPk(rifaAnterior.idRifa, { attributes: ['ventaTotal'], transaction });
            }
    
            // Validar disponibilidad de boletos en el nuevo talonario (si es diferente)
            let talonarioNuevo = null;
            if (cambiosTalonario) {
                talonarioNuevo = await TALONARIOS.findOne({
                    where: { idTalonario },
                    include: [
                        {
                            model: RIFAS,
                            attributes: ['idRifa', 'precioBoleto', 'ventaTotal'],
                        },
                    ],
                    transaction
                });
    
                if (!talonarioNuevo) {
                    await transaction.rollback();
                    return res.status(404).json({ message: "No se encontró el talonario nuevo." });
                }
    
                const boletosDisponiblesNuevo = talonarioNuevo.cantidadBoletos;
                if (boletosVendidos > boletosDisponiblesNuevo) {
                    await transaction.rollback();
                    return res.status(400).json({ message: "No hay suficientes boletos disponibles en el talonario nuevo." });
                }
            } else {
                talonarioNuevo = talonarioActual;
            }
    
            // Calcular el nuevo subtotal
            const nuevoSubtotal = boletosVendidos * parseFloat(talonarioNuevo.rifa.precioBoleto);
    
            // Calcular el total de los montos pagados
            const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
    
            // Calcular el total esperado
            const precioBoleto = parseFloat(talonarioNuevo.rifa.precioBoleto);
            const totalEsperado = boletosVendidos * precioBoleto;
    
            // Comparar ambos totales
            if (totalPagado !== totalEsperado) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `El total pagado (Q${totalPagado.toFixed(2)}) no coincide con el total esperado (Q${totalEsperado.toFixed(2)}).`,
                });
            }
    
            // Validar el monto total pagado
            if (totalPagado !== nuevoSubtotal) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `El total recaudado (Q${nuevoSubtotal.toFixed(2)}) no coincide con el monto total pagado (Q${totalPagado.toFixed(2)}).`,
                });
            }
    
            // Actualizar la cantidad de boletos en el talonario actual
            if (cambiosBoletos || cambiosTalonario) {
                await talonarioActual.update(
                    { cantidadBoletos: boletosDisponiblesActuales - boletosVendidos },
                    { transaction }
                );
    
                // Si cambia de talonario, actualizar el nuevo talonario
                if (cambiosTalonario) {
                    await talonarioNuevo.update(
                        { cantidadBoletos: talonarioNuevo.cantidadBoletos - boletosVendidos },
                        { transaction }
                    );
                }
            }
    
            // Actualizar la recaudación
            if (cambiosBoletos || cambiosTalonario) {
                await recaudacion.update(
                    {
                        boletosVendidos,
                        subTotal: nuevoSubtotal,
                        idSolicitudTalonario: talonarioNuevo.idTalonario,
                    },
                    { transaction }
                );
            }
    
            // Eliminar y crear los nuevos pagos si hay cambios
            if (cambiosPagos) {
                await DETALLE_PAGO_RECAUDACION_RIFAS.destroy({
                    where: { idRecaudacionRifa },
                    transaction,
                });
    
                for (const pago of pagos) {
                    if (!pago.idTipoPago || !pago.monto) {
                        await transaction.rollback();
                        throw new Error("Cada pago debe tener un tipo y un monto válido.");
                    }
    
                    let correlativo = pago.correlativo || "NA";
                    let imagenTransferencia = pago.imagenTransferencia || "efectivo";
    
                    // Validar correlativo e imagen para ciertos tipos de pago
                    if ([1, 2, 4].includes(pago.idTipoPago)) { // Depósito, Transferencia, Cheque
                        if (!pago.correlativo || !pago.imagenTransferencia) {
                            await transaction.rollback();
                            throw new Error(`El tipo de pago ${pago.idTipoPago} requiere correlativo e imagen.`);
                        }
                    }
    
                    await DETALLE_PAGO_RECAUDACION_RIFAS.create(
                        {
                            idRecaudacionRifa,
                            idTipoPago: pago.idTipoPago,
                            pago: pago.monto,
                            correlativo,
                            imagenTransferencia,
                            estado: pago.estado || 1, // Activo por defecto
                        },
                        { transaction }
                    );
                }
            }
    
            // Actualizar el total de venta de la rifa nueva con el nuevo subtotal
            const rifaNueva = talonarioNuevo.rifa;
    
            // Calcular la nueva venta total para la rifa nueva
            const nuevaVentaTotalRifaNueva = parseFloat(rifaNueva.ventaTotal) + nuevoSubtotal;
    
            await RIFAS.update(
                { ventaTotal: nuevaVentaTotalRifaNueva },
                { where: { idRifa: rifaNueva.idRifa }, transaction }
            );
    
            // Log para verificar el valor guardado
            const rifaNuevaActualizada = await RIFAS.findByPk(rifaNueva.idRifa, { attributes: ['ventaTotal'], transaction });
    
            // Confirmar la transacción
            await transaction.commit();
    
            return res.status(200).json({
                message: "Recaudación actualizada con éxito.",
                recaudacion,
            });
        } catch (error) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            console.error("Error al actualizar la recaudación:", error);
            return res.status(500).json({ message: "Error al actualizar la recaudación.", error: error.message });
        }
    },
};
