'use strict';
const db = require('../models');
const { traslados, detalle_traslados, detalle_productos, productos, TipoTraslado } = db;
const { Sequelize } = require('sequelize');
const moment = require('moment'); // Asegúrate de tener instalada esta dependencia
const { Op } = require('sequelize');

module.exports = {
    async createTrasladoConDetalle(req, res) {
        const { fecha, descripcion, idTipoTraslado, detalles } = req.body;

        if (!fecha || !descripcion || !idTipoTraslado || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ message: 'Faltan campos requeridos o los detalles están vacíos.' });
        }

        const transaction = await db.sequelize.transaction();

        try {
            // Verificar que el tipo de traslado exista
            const tipoTraslado = await TipoTraslado.findByPk(idTipoTraslado);
            if (!tipoTraslado) {
                throw new Error('El tipo de traslado proporcionado no existe.');
            }

            // Crear el traslado
            const traslado = await traslados.create(
                { fecha, descripcion, estado: 1, idTipoTraslado },
                { transaction }
            );

            // Validar y procesar los detalles del traslado
            for (const detalle of detalles) {
                const { idProducto, cantidad } = detalle;

                if (!idProducto || !cantidad) {
                    throw new Error('Cada detalle debe contener idProducto y cantidad.');
                }

                // Validar existencia del producto en el inventario
                let inventario = await detalle_productos.findOne({
                    where: { idProducto, estado: 1 },
                    transaction,
                });

                if (!inventario && tipoTraslado.tipo === 'Enviado') {
                    throw new Error(`No se puede realizar el envío, no hay inventario para el producto con ID ${idProducto}.`);
                }

                if (tipoTraslado.tipo === 'Recibido') {
                    // Si es un ingreso, sumar la cantidad al inventario
                    if (inventario) {
                        await detalle_productos.update(
                            { cantidad: Sequelize.literal(`cantidad + ${cantidad}`) },
                            { where: { idDetalleProductos: inventario.idDetalleProductos }, transaction }
                        );
                    } else {
                        // Si no existe en inventario, crearlo
                        await detalle_productos.create(
                            {
                                cantidad,
                                estado: 1,
                                idProducto,
                                idSede: req.body.idSede || 1, // Asume que hay una sede por defecto o recibida en el body
                            },
                            { transaction }
                        );
                    }
                } else if (tipoTraslado.tipo === 'Enviado') {
                    // Si es un egreso, restar la cantidad del inventario
                    if (inventario.cantidad < cantidad) {
                        throw new Error(`Inventario insuficiente para el producto con ID ${idProducto}.`);
                    }

                    await detalle_productos.update(
                        { cantidad: Sequelize.literal(`cantidad - ${cantidad}`) },
                        { where: { idDetalleProductos: inventario.idDetalleProductos }, transaction }
                    );
                }

                // Crear el detalle del traslado
                await detalle_traslados.create(
                    {
                        cantidad,
                        estado: 1,
                        idTraslado: traslado.idTraslado,
                        idProducto,
                    },
                    { transaction }
                );
            }

            // Confirmar la transacción
            await transaction.commit();

            return res.status(201).json({ message: 'Traslado creado con éxito.', traslado });
        } catch (error) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            console.error('Error al crear traslado con detalle:', error);
            return res.status(500).json({ message: error.message || 'Error al crear traslado con detalle.' });
        }
    },

    async updateTrasladoConDetalle(req, res) {
        const { fecha, descripcion, idTipoTraslado, detalles, idSede } = req.body;
        const idTraslado = req.params.id;
    
        if (!Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ message: 'Los detalles no pueden estar vacíos.' });
        }
    
        const transaction = await db.sequelize.transaction();
    
        try {
            // Verificar si el traslado existe
            const trasladoExistente = await traslados.findByPk(idTraslado, { transaction });
            if (!trasladoExistente) {
                throw new Error('El traslado a actualizar no existe.');
            }
    
            // Verificar si el tipo de traslado cambió
            const tipoTrasladoExistente = await TipoTraslado.findByPk(trasladoExistente.idTipoTraslado);
            const nuevoTipoTraslado = await TipoTraslado.findByPk(idTipoTraslado);
    
            if (!nuevoTipoTraslado) {
                throw new Error('El nuevo tipo de traslado proporcionado no existe.');
            }
    
            const tipoCambio = tipoTrasladoExistente.tipo !== nuevoTipoTraslado.tipo;
    
            // Procesar los detalles antiguos
            const detallesAntiguos = await detalle_traslados.findAll({
                where: { idTraslado },
                transaction,
            });
    
            for (const detalleAntiguo of detallesAntiguos) {
                const detalleNuevo = detalles.find(d => d.idDetalleTraslado === detalleAntiguo.idDetalleTraslado);
    
                if (detalleNuevo) {
                    // Si el producto cambió o el tipo de traslado cambió, revertir inventario del detalle antiguo
                    if (detalleNuevo.idProducto !== detalleAntiguo.idProducto || tipoCambio) {
                        const inventarioAntiguo = await detalle_productos.findOne({
                            where: { idProducto: detalleAntiguo.idProducto, estado: 1 },
                            transaction,
                        });
    
                        if (!inventarioAntiguo) {
                            throw new Error(`Inventario no encontrado para el producto antiguo con ID ${detalleAntiguo.idProducto}.`);
                        }
    
                        const operacionRevertir = tipoTrasladoExistente.tipo === 'Recibido' ? '-' : '+';
                        await detalle_productos.update(
                            { cantidad: Sequelize.literal(`cantidad ${operacionRevertir} ${detalleAntiguo.cantidad}`) },
                            { where: { idDetalleProductos: inventarioAntiguo.idDetalleProductos }, transaction }
                        );
                    }
    
                    // Si el producto cambió, ajustar inventario del nuevo producto
                    if (detalleNuevo.idProducto !== detalleAntiguo.idProducto) {
                        const inventarioNuevo = await detalle_productos.findOne({
                            where: { idProducto: detalleNuevo.idProducto, estado: 1 },
                            transaction,
                        });
    
                        if (!inventarioNuevo) {
                            throw new Error(`Inventario no encontrado para el nuevo producto con ID ${detalleNuevo.idProducto}.`);
                        }
    
                        const operacionNuevo = nuevoTipoTraslado.tipo === 'Recibido' ? '+' : '-';
                        if (operacionNuevo === '-' && inventarioNuevo.cantidad < detalleNuevo.cantidad) {
                            throw new Error(`Inventario insuficiente para el nuevo producto con ID ${detalleNuevo.idProducto}.`);
                        }
    
                        await detalle_productos.update(
                            { cantidad: Sequelize.literal(`cantidad ${operacionNuevo} ${detalleNuevo.cantidad}`) },
                            { where: { idDetalleProductos: inventarioNuevo.idDetalleProductos }, transaction }
                        );
                    } else {
                        // Si solo cambió la cantidad, ajustar la diferencia
                        const diferencia = detalleNuevo.cantidad - detalleAntiguo.cantidad;
                        if (diferencia !== 0) {
                            const inventario = await detalle_productos.findOne({
                                where: { idProducto: detalleNuevo.idProducto, estado: 1 },
                                transaction,
                            });
    
                            if (!inventario) {
                                throw new Error(`Inventario no encontrado para el producto con ID ${detalleNuevo.idProducto}.`);
                            }
    
                            const operacion = nuevoTipoTraslado.tipo === 'Recibido' ? '+' : '-';
                            if (operacion === '-' && inventario.cantidad < Math.abs(diferencia)) {
                                throw new Error(`Inventario insuficiente para el producto con ID ${detalleNuevo.idProducto}.`);
                            }
    
                            await detalle_productos.update(
                                { cantidad: Sequelize.literal(`cantidad ${operacion} ${Math.abs(diferencia)}`) },
                                { where: { idDetalleProductos: inventario.idDetalleProductos }, transaction }
                            );
                        }
                    }
    
                    // Actualizar el detalle
                    await detalle_traslados.update(
                        { idProducto: detalleNuevo.idProducto, cantidad: detalleNuevo.cantidad },
                        { where: { idDetalleTraslado: detalleAntiguo.idDetalleTraslado }, transaction }
                    );
                } else {
                    // Si el detalle antiguo no está en los nuevos detalles, eliminarlo y revertir inventario
                    const inventarioAntiguo = await detalle_productos.findOne({
                        where: { idProducto: detalleAntiguo.idProducto, estado: 1 },
                        transaction,
                    });
    
                    if (!inventarioAntiguo) {
                        throw new Error(`Inventario no encontrado para el producto antiguo con ID ${detalleAntiguo.idProducto}.`);
                    }
    
                    const operacionAntigua = tipoTrasladoExistente.tipo === 'Recibido' ? '-' : '+';
                    await detalle_productos.update(
                        { cantidad: Sequelize.literal(`cantidad ${operacionAntigua} ${detalleAntiguo.cantidad}`) },
                        { where: { idDetalleProductos: inventarioAntiguo.idDetalleProductos }, transaction }
                    );
    
                    await detalle_traslados.destroy({
                        where: { idDetalleTraslado: detalleAntiguo.idDetalleTraslado },
                        transaction,
                    });
                }
            }
    
            // Procesar los nuevos detalles que no tienen idDetalleTraslado (nuevos detalles)
            for (const detalle of detalles) {
                if (!detalle.idDetalleTraslado) {
                    const inventarioNuevo = await detalle_productos.findOne({
                        where: { idProducto: detalle.idProducto, estado: 1 },
                        transaction,
                    });
    
                    if (!inventarioNuevo) {
                        throw new Error(`Inventario no encontrado para el producto con ID ${detalle.idProducto}.`);
                    }
    
                    const operacionNuevo = nuevoTipoTraslado.tipo === 'Recibido' ? '+' : '-';
                    if (operacionNuevo === '-' && inventarioNuevo.cantidad < detalle.cantidad) {
                        throw new Error(`Inventario insuficiente para el producto con ID ${detalle.idProducto}.`);
                    }
    
                    await detalle_productos.update(
                        { cantidad: Sequelize.literal(`cantidad ${operacionNuevo} ${detalle.cantidad}`) },
                        { where: { idDetalleProductos: inventarioNuevo.idDetalleProductos }, transaction }
                    );
    
                    await detalle_traslados.create(
                        { idTraslado, idProducto: detalle.idProducto, cantidad: detalle.cantidad, estado: 1 },
                        { transaction }
                    );
                }
            }
    
            // Actualizar el traslado
            await traslados.update(
                { fecha, descripcion, idTipoTraslado },
                { where: { idTraslado }, transaction }
            );
    
            await transaction.commit();
            return res.status(200).json({ message: 'Traslado actualizado con éxito.' });
        } catch (error) {
            await transaction.rollback();
            console.error('Error al actualizar traslado con detalle:', error);
            return res.status(500).json({ message: error.message || 'Error al actualizar traslado con detalle.' });
        }
    },

    async getDetalleTrasladoById(req, res) {
        const idTraslado = req.params.id;
    
        try {
            // Buscar el traslado con sus detalles
            const traslado = await traslados.findByPk(idTraslado, {
                include: [
                    {
                        model: detalle_traslados,
                        include: [{ model: productos, as: 'producto' }]
                    },
                    { model: TipoTraslado, as: 'tipoTraslado' }
                ]
            });
    
            if (!traslado) {
                return res.status(404).json({ message: 'Traslado no encontrado.' });
            }
    
            return res.status(200).json({ traslado });
        } catch (error) {
            console.error('Error al obtener detalle del traslado:', error);
            return res.status(500).json({ message: 'Error al obtener detalle del traslado.' });
        }
    },

    async reporteTrasladosConDetalle(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
    
            // Verificar que las fechas se proporcionen
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ message: 'Se requieren las fechas de inicio y fin.' });
            }
    
            // Convertir las fechas de formato DD-MM-YYYY a YYYY-MM-DD
            const fechaInicioFormato = fechaInicio.split("-").reverse().join("-");
            const fechaFinFormato = fechaFin.split("-").reverse().join("-");
    
            // Validar que las fechas sean válidas
            const fechaInicioValida = moment(fechaInicioFormato, 'YYYY-MM-DD', true).isValid();
            const fechaFinValida = moment(fechaFinFormato, 'YYYY-MM-DD', true).isValid();
    
            if (!fechaInicioValida || !fechaFinValida) {
                return res.status(400).json({ message: 'Las fechas no son válidas. Formato esperado: DD-MM-YYYY' });
            }
    
            // Consultar traslados en el rango de fechas con sus detalles
            const trasladosConDetalle = await traslados.findAll({
                where: {
                    fecha: {
                        [Sequelize.Op.gte]: fechaInicioFormato,
                        [Sequelize.Op.lte]: fechaFinFormato,
                    },
                },
                include: [
                    {
                        model: detalle_traslados,
                        include: [{ model: productos, as: 'producto' }]
                    },
                    { model: TipoTraslado, as: 'tipoTraslado' }
                ],
            });
    
            // Verificar si se encontraron traslados
            if (trasladosConDetalle.length === 0) {
                return res.status(404).json({ message: 'No se encontraron traslados en el rango de fechas especificado.' });
            }
    
            // Formatear los resultados
            const reporte = trasladosConDetalle.map(traslado => {
                return {
                    idTraslado: traslado.idTraslado,
                    fecha: moment(traslado.fecha).format('DD/MM/YYYY'),
                    descripcion: traslado.descripcion,
                    tipo: traslado.tipoTraslado.tipo,
                    detalles: traslado.detalle_traslados.map(detalle => ({
                        idProducto: detalle.idProducto,
                        nombreProducto: detalle.producto.nombreProducto,
                        cantidad: detalle.cantidad,
                    })),
                };
            });
    
            return res.status(200).json({ reporte });
        } catch (error) {
            console.error('Error al obtener el reporte de traslados con detalle:', error);
            return res.status(500).json({ message: 'Error al obtener el reporte de traslados con detalle.' });
        }
    }
    
    

};
