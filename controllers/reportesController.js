'use strict';
const db = require("../models");
const { Op } = require('sequelize');
const RIFAS = db.rifas;
const TALONARIOS = db.talonarios;
const SOLICITUD_TALONARIOS = db.solicitudTalonarios;
const VOLUNTARIOS = db.voluntarios;
const PERSONAS = db.personas;
const RECAUDACION_RIFAS = db.recaudacion_rifas;
const DETALLE_PAGO_RECAUDACION_RIFAS = db.detalle_pago_recaudacion_rifas;

module.exports = {
    async reporteRifas(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;

            // Validar las fechas
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ message: "Se requieren las fechas de inicio y fin." });
            }

            const fechaInicioFormato = fechaInicio.split("-").reverse().join("-");
            const fechaFinFormato = fechaFin.split("-").reverse().join("-");

            if (isNaN(Date.parse(fechaInicioFormato)) || isNaN(Date.parse(fechaFinFormato))) {
                return res.status(400).json({ message: "Las fechas no son válidas." });
            }           

            // Obtener rifas activas en el rango de fechas
            const rifas = await RIFAS.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: fechaInicioFormato,
                        [Op.lte]: fechaFinFormato,
                    },
                    estado: 1,
                    idSede: 1,
                },
            });

            if (!rifas || rifas.length === 0) {
                return res.status(404).json({ message: "No se encontraron rifas en el rango de fechas especificado." });
            }

            const reporte = [];

            for (const rifa of rifas) {
                // Obtener talonarios asociados a la rifa
                const talonarios = await TALONARIOS.findAll({
                    where: { idRifa: rifa.idRifa, estado: 1 },
                });

                if (!talonarios || talonarios.length === 0) continue;

                // Obtener solicitudes de talonarios y los voluntarios asociados
                const solicitudes = await SOLICITUD_TALONARIOS.findAll({
                    where: { idTalonario: { [Op.in]: talonarios.map((t) => t.idTalonario) }, estado: 1 },
                    include: [
                        {
                            model: VOLUNTARIOS,
                            include: [{ model: PERSONAS, attributes: ["nombre", "correo"] }],
                        },
                    ],
                });

                if (!solicitudes || solicitudes.length === 0) continue;

                // Obtener la recaudación de rifas asociada a estas solicitudes
                const recaudaciones = await RECAUDACION_RIFAS.findAll({
                    where: { idSolicitudTalonario: { [Op.in]: solicitudes.map((s) => s.idSolicitudTalonario) }, estado: 1 },
                    include: [{ model: DETALLE_PAGO_RECAUDACION_RIFAS }],
                });

                let totalRecaudacion = 0;
                let boletosVendidos = 0;
                let detallePagos = [];
                let voluntarioMasVentas = { nombre: "", boletosVendidos: 0 };

                for (const recaudacion of recaudaciones) {
                    totalRecaudacion += parseFloat(recaudacion.subTotal || 0);
                    boletosVendidos += recaudacion.boletosVendidos || 0;

                    const voluntario = solicitudes.find(
                        (s) => s.idSolicitudTalonario === recaudacion.idSolicitudTalonario
                    )?.voluntario;

                    if (voluntario) {
                        const nombreVoluntario = voluntario.persona?.nombre || "Voluntario desconocido";
                        const boletosDelVoluntario = recaudacion.boletosVendidos || 0;

                        if (boletosDelVoluntario > voluntarioMasVentas.boletosVendidos) {
                            voluntarioMasVentas = { nombre: nombreVoluntario, boletosVendidos: boletosDelVoluntario };
                        }
                    }

                    // Procesar detalle de pagos
                    detallePagos = [
                        ...detallePagos,
                        ...recaudacion.detalle_pago_recaudacion_rifas.map((detalle) => ({
                            correlativo: detalle.correlativo,
                            pago: detalle.pago,
                            tipoPago: detalle.idTipoPago,
                        })),
                    ];
                }

                reporte.push({
                    idRifa: rifa.idRifa,
                    nombreRifa: rifa.nombreRifa,
                    descripcion: rifa.descripcion,
                    precioBoleto: rifa.precioBoleto,
                    totalRecaudacion,
                    boletosVendidos,
                    voluntarioMasVentas,
                    detallePagos,
                });
            }

            return res.status(200).json({ reporte });
        } catch (error) {
            console.error("Error al generar el reporte de rifas:", error);
            return res.status(500).json({ message: "Error al generar el reporte de rifas." });
        }
    }
};