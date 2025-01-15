// ! Controlador de eventos
'use strict';
const moment = require('moment');  // Importa moment.js
const db = require('../models');
const Sequelize = require('sequelize');
const EVENTOS = db.eventos;
const SEDES = db.sedes;
const INSCRIPCIONES = db.inscripcion_eventos;
const { eventos, recaudacion_eventos, inscripcion_eventos, asistencia_eventos } = require('../models');
const { Op } = Sequelize; 

module.exports = {

    // * Listar todos los eventos con el nombre de la sede
    async findAll(req, res) {
        return EVENTOS.findAll({
            include: [{
                model: SEDES,
                as: 'sede', 
                attributes: ['nombreSede'] 
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos.'
            });
        });
    },

    // * Listar todos los eventos activos
    async findActive(req, res) {
        return EVENTOS.findAll({
            where: {
                estado: 1 
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos activos.'
            });
        });
    },

    // * Listar todos los eventos activos con estado de inscripción
    async findActiveById(req, res) {
        const { idVoluntario } = req.query; // Obtén el idVoluntario de los parámetros de la solicitud

        return EVENTOS.findAll({
            where: {
                estado: 1 // Solo eventos activos
            },
            include: [
                {
                    model: SEDES,
                    as: 'sede',
                    attributes: ['nombreSede']
                },
                {
                    model: INSCRIPCIONES, // Asegúrate de usar el modelo de inscripciones
                    as: 'inscripciones',
                    where: idVoluntario ? { idVoluntario } : {}, // Filtra por idVoluntario si está presente
                    required: false // Esto asegura que también se incluyan eventos sin inscripciones
                }
            ]
        })
        .then((eventos) => {
            // Mapear eventos para añadir `isInscrito` basado en las inscripciones
            const eventosConEstado = eventos.map((evento) => ({
                ...evento.toJSON(),
                isInscrito: evento.inscripciones && evento.inscripciones.length > 0 // Verifica si hay inscripciones
            }));

            res.status(200).send(eventosConEstado);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos activos.'
            });
        });
    },


    // * Listar todos los eventos inactivos
    async findInactive(req, res) {
        return EVENTOS.findAll({
            where: {
                estado: 0 
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos inactivos.'
            });
        });
    },

    // * Crear un nuevo evento
    async create(req, res) {
        const { nombreEvento, fechaHoraInicio, fechaHoraFin, descripcion, direccion, idSede } = req.body;
    
        // Validaciones de campos obligatorios
        if (!nombreEvento) {
            return res.status(400).json({ message: 'Falta el campo requerido: nombreEvento.' });
        }
        if (!fechaHoraInicio || !fechaHoraFin) {
            return res.status(400).json({ message: 'Faltan los campos requeridos: fechaHoraInicio y/o fechaHoraFin.' });
        }
        if (!direccion) {
            return res.status(400).json({ message: 'Falta el campo requerido: direccion.' });
        }
        if (!idSede) {
            return res.status(400).json({ message: 'Falta el campo requerido: idSede.' });
        }
    
        // Validaciones de formato
        const regexNombreEvento = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; // Solo letras y espacios
        const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/; // Letras, números, espacios y signos .,-
        const regexDireccion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,#/-]+$/; // Incluye signos usados en direcciones
    
        if (!regexNombreEvento.test(nombreEvento)) {
            return res.status(400).json({ message: 'El nombre del evento solo debe contener letras y espacios.' });
        }
    
        if (descripcion && !regexDescripcion.test(descripcion)) {
            return res.status(400).json({ message: 'La descripción solo puede contener letras, números, espacios y los signos .,-' });
        }
    
        if (!regexDireccion.test(direccion)) {
            return res.status(400).json({ message: 'La dirección solo puede contener letras, números, espacios y los signos ., #/-' });
        }
    
        try {
            // Validar si la sede existe
            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(404).json({ message: 'La sede no existe.' });
            }
    
            // Creación del nuevo evento
            const nuevoEvento = await EVENTOS.create({
                nombreEvento,
                fechaHoraInicio,
                fechaHoraFin,
                descripcion,
                estado: 1, // Activo por defecto
                direccion,
                idSede
            });
    
            return res.status(201).json(nuevoEvento);
        } catch (error) {
            console.error('Error al crear el evento:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear el evento.'
            });
        }
    },
    

    // * Actualizar un evento (el estado no se cambia aquí)
    async update(req, res) {
        const { idEvento } = req.params;
        const { nombreEvento, fechaHoraInicio, fechaHoraFin, descripcion, direccion, idSede, estado } = req.body;
    
        const camposActualizados = {};
    
        const regexNombreEvento = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; 
        const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/; 
        const regexDireccion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,#/-]+$/; 
    
        if (nombreEvento !== undefined) {
            if (!regexNombreEvento.test(nombreEvento)) {
                return res.status(400).json({ message: 'El nombre del evento solo debe contener letras y espacios.' });
            }
            camposActualizados.nombreEvento = nombreEvento;
        }
    
        if (descripcion !== undefined) {
            if (!regexDescripcion.test(descripcion)) {
                return res.status(400).json({ message: 'La descripción solo puede contener letras, números, espacios y los signos .,-' });
            }
            camposActualizados.descripcion = descripcion;
        }
    
        if (direccion !== undefined) {
            if (!regexDireccion.test(direccion)) {
                return res.status(400).json({ message: 'La dirección solo puede contener letras, números, espacios y los signos ., #/-' });
            }
            camposActualizados.direccion = direccion;
        }
    
        if (fechaHoraInicio !== undefined) camposActualizados.fechaHoraInicio = fechaHoraInicio;
        if (fechaHoraFin !== undefined) camposActualizados.fechaHoraFin = fechaHoraFin;
    
        if (idSede !== undefined) {
            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(404).json({ message: 'La sede no existe.' });
            }
            camposActualizados.idSede = idSede;
        }

           
        if (estado !== undefined) {
            camposActualizados.estado = estado;
        }

    
        try {
            // Actualización del evento
            const [rowsUpdated] = await EVENTOS.update(camposActualizados, {
                where: { idEvento }
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Evento no encontrado.' });
            }
    
            return res.status(200).json({ message: 'Evento actualizado con éxito.' });
    
        } catch (error) {
            console.error('Error al actualizar el evento:', error);
            return res.status(500).json({
                message: error.message || 'Error al actualizar el evento.'
            });
        }
    },
    


    // * Buscar un evento por nombre
    async findEvento(req, res) {
        const { nombreEvento } = req.params;

        return EVENTOS.findOne({
            where: {
                nombreEvento: {
                    [Sequelize.Op.like]: `%${nombreEvento}%` 
                }
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((evento) => {
            if (!evento) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send(evento);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el evento.'
            });
        });
    },

      // * Buscar un evento por ID
      async findById(req, res) {
        const { idEvento } = req.params;

        return EVENTOS.findByPk(idEvento, {
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((evento) => {
            if (!evento) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send(evento);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el evento por ID.'
            });
        });
    },

    // * Eliminar un evento por ID
    async delete(req, res) {
        const { idEvento } = req.params;

        return EVENTOS.destroy({
            where: { idEvento }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send({ message: 'Evento eliminado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar el evento.'
            });
        });
    },

    async obtenerReporteEventos(req, res) {
        try {
          const { fechaInicio, fechaFin } = req.query;
      
          // Verificar que las fechas se proporcionen
          if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: 'Se requieren las fechas de inicio y fin.' });
          }
      
          // Convertir las fechas de formato DD-MM-YYYY a YYYY-MM-DD
          const fechaInicioFormato = fechaInicio.split("-").reverse().join("-"); // Convierte de DD-MM-YYYY a YYYY-MM-DD
          const fechaFinFormato = fechaFin.split("-").reverse().join("-"); // Convierte de DD-MM-YYYY a YYYY-MM-DD
      
          // Validar que las fechas sean válidas
          const fechaInicioValida = moment(fechaInicioFormato, 'YYYY-MM-DD', true).isValid();
          const fechaFinValida = moment(fechaFinFormato, 'YYYY-MM-DD', true).isValid();
      
          if (!fechaInicioValida || !fechaFinValida) {
            return res.status(400).json({ message: 'Las fechas no son válidas. Formato esperado: DD-MM-YYYY' });
          }
      
          // Realizar la consulta para obtener los eventos dentro del rango de fechas
          const eventosEnRango = await eventos.findAll({
            where: {
              fechaHoraInicio: {
                [Op.gte]: fechaInicioFormato, // Mayor o igual que la fecha de inicio
              },
              fechaHoraFin: {
                [Op.lte]: fechaFinFormato, // Menor o igual que la fecha de fin
              },
            },
            include: [
              {
                model: recaudacion_eventos,
                as: 'recaudaciones',
                attributes: ['recaudacion', 'numeroPersonas'], // Incluye número de personas
              },
              {
                model: inscripcion_eventos,
                as: 'inscripciones',
                include: [
                  {
                    model: asistencia_eventos,
                    as: 'asistencias',
                    attributes: ['idInscripcionEvento'],
                    where: {
                      estado: 1, // Solo contar asistencias activas
                    },
                  },
                ],
              },
            ],
          });
          
      
          // Preparar los resultados
          const resultados = [];
      
          for (const evento of eventosEnRango) {
            // Calcular la recaudación total del evento
            const recaudacionTotal = evento.recaudaciones.reduce((total, recaudacion) => total + parseFloat(recaudacion.recaudacion), 0);
            
              const totalPersonas = evento.recaudaciones.reduce(
                (total, recaudacion) => total + parseInt(recaudacion.numeroPersonas, 10),
                0
              );

              
            // Contar la cantidad de voluntarios que asistieron
            const voluntariosAsistieron = new Set();
            evento.inscripciones.forEach(inscripcion => {
              inscripcion.asistencias.forEach(asistencia => {
                voluntariosAsistieron.add(asistencia.idInscripcionEvento);  // Usamos un Set para contar de manera única
              });
            });
      
            const cantidadVoluntariosAsistieron = voluntariosAsistieron.size;
      
            // Verificar si se cumplió con la meta (este ejemplo supone que 'metaRecaudacion' es un campo en el evento)
            const metaCumplida = recaudacionTotal >= evento.metaRecaudacion; // Asegúrate de tener 'metaRecaudacion' en tu modelo
      
            // Preparar el reporte por evento
            resultados.push({
              nombreEvento: evento.nombreEvento,
              recaudacionTotal,
              cantidadVoluntariosAsistieron,
              numeroPersonas: totalPersonas, 
              fechaHoraInicio: evento.fechaHoraInicio,
              fechaHoraFin: evento.fechaHoraFin,
            });
          }
      
          // Enviar el reporte como respuesta
          return res.status(200).json({ eventos: resultados });
      
        } catch (error) {
          console.error('Error al obtener el reporte de eventos:', error);
          return res.status(500).json({ message: 'Error al obtener el reporte de eventos.' });
        }
      }
      
};
