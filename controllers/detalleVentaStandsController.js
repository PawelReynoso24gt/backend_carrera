'use strict';
const { Op } = require('sequelize');
const moment = require('moment');
const db = require('../models');
const STANDS = db.stands;
const DETALLE_VENTAS_STANDS = db.detalleVentasStands;
const DETALLE_STANDS = db.detalle_stands;
const PRODUCTOS = db.productos;

module.exports = {
  // Obtener reporte de playeras por stand y entre fechas
  async obtenerReportePlayeras(req, res) {
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

      // Realizar la consulta para obtener los stands con los detalles de las ventas y las asignaciones de productos
      const standsConReporte = await STANDS.findAll({
        include: [
          {
            model: DETALLE_VENTAS_STANDS,  // Incluir detalles de ventas de stands
            include: [
              {
                model: PRODUCTOS,
                where: {
                  idCategoria: 1  // Solo seleccionamos los productos de tipo 'Playera'
                },
                attributes: ['idProducto', 'nombreProducto', 'talla']
              }
            ],
            where: {
              estado: 1, // Solo activos
              createdAt: {
                [Op.gte]: fechaInicioFormato,  // Rango de fechas
                [Op.lte]: fechaFinFormato
              }
            }
          },
          {
            model: DETALLE_STANDS, // Incluir detalles de asignaciones de productos a stands
            include: [
              {
                model: PRODUCTOS,
                where: {
                  idCategoria: 1 // Solo productos de tipo 'Playera'
                },
                attributes: ['idProducto', 'nombreProducto', 'talla']
              }
            ],
            where: {
              estado: 1, // Solo activos
            }
          }
        ]
      });

      // Verificación si se encontró algún stand
      if (standsConReporte.length === 0) {
        return res.status(404).json({ message: 'No se encontraron stands con las condiciones especificadas.' });
      }

      // Preparar los resultados
      const resultados = [];

      for (const stand of standsConReporte) {
        const playerasAsignadas = {};
        const playerasVendidas = {};
        const subtotalesVendidos = {}; // Para almacenar subtotales por talla
        let totalRecaudado = 0; // Inicializar el total recaudado por stand

        // Asignación de playeras por talla (detalle_stands)
        stand.detallesStands.forEach((detalle) => {
          if (detalle.producto) {
            const talla = detalle.producto.talla;
            playerasAsignadas[talla] = (playerasAsignadas[talla] || 0) + detalle.cantidad;
          }
        });

        // Ventas de playeras por talla (detalle_ventas_stands)
        stand.detalleVentas.forEach((detalleVenta) => {
          if (detalleVenta.producto) {
            const talla = detalleVenta.producto.talla;
            playerasVendidas[talla] = (playerasVendidas[talla] || 0) + detalleVenta.cantidad;

            // Calcular el subtotal para cada venta de playera
            const subTotal = parseFloat(detalleVenta.subTotal) || 0;  // Convertir a número (flotante)
            subtotalesVendidos[talla] = (subtotalesVendidos[talla] || 0) + subTotal;
            totalRecaudado += subTotal; // Sumar el subtotal al total recaudado
          }
        });

        // Agregar el reporte del stand, incluyendo los subtotales de cada talla y el total recaudado
        resultados.push({
          nombreStand: stand.nombreStand,
          playerasAsignadas,
          playerasVendidas,
          subtotalesVendidos,
          totalRecaudado: parseInt(totalRecaudado) // Redondear el total recaudado a un número entero
        });
      }

      // Enviar el reporte como respuesta
      return res.status(200).json({ reporte: resultados });

    } catch (error) {
      console.error('Error al obtener el reporte de playeras:', error);
      return res.status(500).json({ message: 'Error al obtener el reporte de playeras.' });
    }
  }
};
