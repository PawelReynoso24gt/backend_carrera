'use strict';
const db = require("../models");
const stands = require("../models/tipoPagos");
const sedes = require("../models/sedes");
const STANDS = db.stands;
const Sede = db.sedes;
const TipoStands = db.tipo_stands;
const DetalleStands = db.detalle_stands;
const AsignacionStands = db.asignacion_stands;
const TipoPagos = db.tipo_pagos;
const Evento = db.eventos;
const StandHorarios = db.stand_horarios;
const { toZonedTime, format } = require('date-fns-tz'); 

// Métodos CRUD
module.exports = {

    async find(req, res) {
        try {
            const stands = await STANDS.findAll({
                where: {
                    estado: 1
                },
                include: [
                    {
                        model: TipoStands,
                        as: 'tipo_stand',
                        attributes: ['idTipoStands', 'tipo']
                    },
                    {
                        model: Sede,
                        attributes: ['idSede', 'nombreSede']
                    },
                    {
                        model: Evento,
                        attributes: ['idEvento', 'nombreEvento']
                    },
                    {
                        model: DetalleStands,
                        as: 'detallesStands',
                        attributes: ['idDetalleStands', 'cantidad', 'idProducto', 'idStand'],
                        include: [
                            {
                                model: db.productos,
                                as: 'producto',
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'foto', 'talla', 'descripcion']
                            }
                        ]
                    },
                    {
                        model: AsignacionStands,
                        as: 'asignaciones',
                        attributes: ['idAsignacionStands', 'idInscripcionEvento', 'idStand', 'idDetalleHorario'],
                        include: [
                            {
                                model: db.inscripcion_eventos,
                                as: 'inscripcionEvento',
                                attributes: ['idInscripcionEvento', 'idVoluntario', 'idEvento'],
                                include: [
                                    {
                                        model: db.eventos,
                                        as: 'evento',
                                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                                    },
                                    {
                                        model: db.voluntarios,
                                        as: 'voluntario',
                                        attributes: ['idVoluntario', 'idPersona', 'codigoQR'],
                                        include: [
                                            {
                                                model: db.personas,
                                                as: 'persona',
                                                attributes: ['idPersona', 'nombre', 'telefono', 'domicilio']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            
            return res.status(200).json(stands);
        } catch (error) {
            console.error('Error al recuperar los stands:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },  

    // * buscar todos los detalles de un stand para ventas
    async findStandDetalles(req, res) {
        try {
            const stands = await STANDS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: TipoStands,
                        as: 'tipo_stand',
                        attributes: ['idTipoStands', 'tipo']
                    },
                    {
                        model: DetalleStands,
                        as: 'detallesStands',
                        attributes: ['idDetalleStands', 'cantidad', 'idProducto', 'idStand'],
                        include: [
                            {
                                model: db.productos,
                                as: 'producto',
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'foto', 'talla', 'descripcion']
                            }
                        ]
                    },
                    {
                        model: AsignacionStands,
                        as: 'asignaciones',
                        attributes: ['idAsignacionStands', 'idInscripcionEvento', 'idStand', 'idDetalleHorario'],
                        include: [
                            {
                                model: db.inscripcion_eventos,
                                as: 'inscripcionEvento',
                                attributes: ['idInscripcionEvento', 'idVoluntario', 'idEvento'],
                                include: [
                                    {
                                        model: db.eventos,
                                        as: 'evento',
                                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                                    },
                                    {
                                        model: db.voluntarios,
                                        as: 'voluntario',
                                        attributes: ['idVoluntario', 'idPersona', 'codigoQR'],
                                        include: [
                                            {
                                                model: db.personas,
                                                as: 'persona',
                                                attributes: ['idPersona', 'nombre', 'telefono', 'domicilio']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            
            return res.status(200).json(stands);
        } catch (error) {
            console.error('Error al recuperar los stands:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * voluntarios metidos en stands
    async getVoluntariosEnStands(req, res) {
        const { idStand } = req.params; // Supone que el id del stand se pasa como parámetro
        try {
            const voluntarios = await AsignacionStands.findAll({
                where: { idStand: idStand, estado: 1 }, // Solo asignaciones activas
                include: [
                    {
                        model: db.inscripcion_eventos,
                        as: 'inscripcionEvento', // Alias definido en la relación
                        include: [
                            {
                                model: db.voluntarios, // Modelo del voluntario
                                as: 'voluntario', // Alias definido en la relación
                                include: [
                                    {
                                        model: db.personas, // Si tienes un modelo de Persona
                                        as: 'persona', // Alias definido
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
    
            if (!voluntarios || voluntarios.length === 0) {
                return res.status(404).json({ message: 'No se encontraron voluntarios asignados a este stand.' });
            }
    
            res.status(200).json(voluntarios);
        } catch (error) {
            console.error('Error al obtener voluntarios asignados:', error);
            res.status(500).json({ error: 'Error al obtener los voluntarios asignados.' });
        }
    },

    // Método para obtener los stands a los que está inscrito un voluntario
    async getStandsDeVoluntario(req, res) {
        const { idVoluntario } = req.params; // Supone que el id del voluntario se pasa como parámetro
        try {
            const asignaciones = await AsignacionStands.findAll({
                where: { estado: 1 }, // Solo asignaciones activas
                include: [
                    {
                        model: db.inscripcion_eventos,
                        as: 'inscripcionEvento', // Alias definido en la relación
                        where: { idVoluntario: idVoluntario }, // Filtrar por el id del voluntario
                        include: [
                            {
                                model: db.voluntarios, // Modelo del voluntario
                                as: 'voluntario', // Alias definido en la relación
                                include: [
                                    {
                                        model: db.personas, // Si tienes un modelo de Persona
                                        as: 'persona', // Alias definido
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: db.stands, // Modelo del stand
                        as: 'stand', // Alias definido en la relación
                        include: [
                            {
                                model: TipoStands,
                                as: 'tipo_stand',
                                attributes: ['idTipoStands', 'tipo']
                            },
                            {
                                model: DetalleStands,
                                as: 'detallesStands',
                                attributes: ['idDetalleStands', 'cantidad', 'idProducto', 'idStand'],
                                include: [
                                    {
                                        model: db.productos,
                                        as: 'producto',
                                        attributes: ['idProducto', 'nombreProducto', 'precio', 'foto', 'talla', 'descripcion', 'foto']
                                    }
                                ]
                            },
                        ],
                    },
                ],
            });

            if (!asignaciones || asignaciones.length === 0) {
                return res.status(404).json({ message: 'No se encontraron stands asignados a este voluntario.' });
            }

            res.status(200).json(asignaciones);
        } catch (error) {
            console.error('Error al obtener stands asignados:', error);
            res.status(500).json({ error: 'Error al obtener los stands asignados.' });
        }
    },
    
    async findActivateStand(req, res) {
        return STANDS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((stands) => {
            res.status(200).send(stands);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los stands.'
            });
        });
    },

    async findaInactivateStand(req, res) {
        return STANDS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((stands) => {
            res.status(200).send(stands);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los stands.'
            });
        });
    },

    // Obtener productos del StandVirtual
async findVirtualStandProducts(req, res) {
    try {
        const standVirtual = await TipoStands.findOne({
            where: { tipo: 'StandVirtual' }, // Busca el tipo "StandVirtual"
        });

        if (!standVirtual) {
            return res.status(404).json({ message: 'No se encontró el tipo StandVirtual.' });
        }

        const stands = await db.stands.findAll({
            where: { idTipoStands: standVirtual.idTipoStands }, // Filtra stands por el tipo
            include: [
                {
                    model: db.detalle_stands,
                    as: 'detallesStands',
                    include: [
                        {
                            model: db.productos,
                            as: 'producto',
                            attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'estado'],
                        },
                    ],
                },
            ],
        });

        const productos = stands.flatMap((stand) =>
            stand.detallesStands.map((detalle) => detalle.producto)
        );

        return res.status(200).json(productos); // Devuelve los productos
    } catch (error) {
        console.error('Error al obtener los productos del StandVirtual:', error);
        return res.status(500).json({
            message: 'Ocurrió un error al obtener los productos del StandVirtual.',
        });
    }
},

    // * metodo para el telefono
    async findDetalleProductosVirtual(req, res) {
        try {
            const standVirtual = await db.stands.findOne({
                where: {
                    idStand: 1,
                    idTipoStands: 1
                }, // Busca el stand con idStand 1 y idTipoStands 1
                include: [
                    {
                        model: DetalleStands,
                        as: 'detallesStands',
                        attributes: ['idDetalleStands', 'cantidad', 'idProducto', 'idStand'], // Incluye solo los detalles necesarios
                        include: [
                            {
                                model: db.productos,
                                as: 'producto',
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'estado', 'foto', 'talla'], // Incluye solo los productos necesarios
                            },
                        ],
                    },
                    {
                        model: TipoStands,
                        as: 'tipo_stand',
                        attributes: ['idTipoStands', 'tipo']
                    }
                ],
            });

            if (!standVirtual) {
                return res.status(404).json({ message: 'No se encontró el stand con idStand 1 y idTipoStands 1.' });
            }

            return res.status(200).json(standVirtual); // Devuelve el stand con los detalles
        } catch (error) {
            console.error('Error al obtener los detalles del stand Virtual:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al obtener los detalles del stand Virtual.',
            });
        }
    },

    createStand: async (req, res) => {
        const datos = req.body;
    
        // Validación de campos requeridos
        if (!datos.nombreStand || !datos.direccion || !datos.idSede || !datos.idTipoStands || !datos.idEvento  || !datos.fechaInicio || !datos.fechaFinal) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Expresiones regulares para validar el formato de los campos, incluyendo espacios
        const regexNombreStand = /^[A-Za-z0-9\s-,.:áéíóúÁÉÍÓÚñÑüÜ]+$/;
        const regexDireccion = /^[A-Za-z0-9\s-,.:áéíóúÁÉÍÓÚñÑüÜ]+$/;
    
        if (!regexNombreStand.test(datos.nombreStand)) {
            return res.status(400).json({ message: 'El nombre del stand solo debe contener letras, números, guiones y espacios.' });
        }
    
        if (!regexDireccion.test(datos.direccion)) {
            return res.status(400).json({ message: 'La dirección solo debe contener letras, números, guiones y espacios.' });
        }
    
        try {
            // Validación de existencia de idSede y idTipoStands
            const sedeExistente = await Sede.findByPk(datos.idSede);
            const eventoExistente = await Evento.findByPk(datos.idEvento);
            const tipoStandExistente = await TipoStands.findByPk(datos.idTipoStands);
    
            if (!eventoExistente) {
                return res.status(400).json({ error: 'El idEvento ingresado no existe.' });
            }

            if (!sedeExistente) {
                return res.status(400).json({ error: 'El idSede ingresado no existe.' });
            }
    
            if (!tipoStandExistente) {
                return res.status(400).json({ error: 'El idTipoStands ingresado no existe.' });
            }
    
            const datos_ingreso = { 
                tipo: datos.tipo,
                estado: datos.estado !== undefined ? datos.estado : 1, 
                nombreStand: datos.nombreStand,
                direccion: datos.direccion,
                fechaInicio: datos.fechaInicio, // No convertir a UTC
                fechaFinal: datos.fechaFinal,  
                idSede: datos.idSede,
                idTipoStands: datos.idTipoStands,
                idEvento: datos.idEvento
            };
    
            const standCreado = await STANDS.create(datos_ingreso);
            return res.status(201).json(standCreado);
    
        } catch (error) {
            console.error('Error al insertar el stand:', error);
            return res.status(500).json({ error: 'Error al insertar el stand' });
        }
    },

    createStandWithHorarios: async (req, res) => {
        const { standData, horarios } = req.body;
    
        if (!standData) {
          return res.status(400).json({ message: 'Faltan datos para crear el stand.' });
        }
    
        const transaction = await db.sequelize.transaction();
        try {
          // Crear el stand
          const newStand = await STANDS.create(standData, { transaction });
    
          // Crear los horarios asociados (si los hay)
          if (horarios && horarios.length > 0) {
            const horariosData = horarios.map((horario) => ({
              idStand: newStand.idStand,
              idDetalleHorario: horario.idDetalleHorario,
              estado: horario.estado || 1,
            }));
            await StandHorarios.bulkCreate(horariosData, { transaction });
          }
    
          // Confirmar la transacción
          await transaction.commit();
          return res.status(201).json({ message: 'Stand creado con éxito', stand: newStand });
        } catch (error) {
          await transaction.rollback();
          console.error('Error al crear el stand:', error);
          return res.status(500).json({ error: 'Error al crear el stand.' });
        }
      },
      updateStand: async (req, res) => {
        const { standData, horarios } = req.body; // Recibimos standData y horarios
        const id = req.params.id;
      
        const transaction = await db.sequelize.transaction();
        try {
          // Validar existencia del stand
          const standExistente = await STANDS.findByPk(id);
          if (!standExistente) {
            return res.status(404).json({ message: 'Stand no encontrado.' });
          }
      
          // Actualizar datos del stand si están presentes
          if (standData) {
            await STANDS.update(standData, { where: { idStand: id }, transaction });
          }
      
          // Si se proporcionan horarios, procesarlos
          if (horarios && horarios.length >= 0) {
            // Obtener horarios existentes
            const horariosExistentes = await StandHorarios.findAll({
              where: { idStand: id },
              attributes: ['idDetalleHorario'],
              raw: true, // Retorna solo los datos
            });
      
            const existentes = horariosExistentes.map((h) => h.idDetalleHorario);
      
            // Identificar horarios a añadir y a eliminar
            const horariosToAdd = horarios
              .map((h) => h.idDetalleHorario)
              .filter((idDetalleHorario) => !existentes.includes(idDetalleHorario));
      
            const horariosToRemove = existentes.filter(
              (idDetalleHorario) => !horarios.map((h) => h.idDetalleHorario).includes(idDetalleHorario)
            );
      
            // Añadir nuevos horarios
            if (horariosToAdd.length > 0) {
              const nuevosHorarios = horariosToAdd.map((idDetalleHorario) => ({
                idStand: id,
                idDetalleHorario,
                estado: 1, // Estado por defecto
              }));
              await StandHorarios.bulkCreate(nuevosHorarios, { transaction });
            }
      
            // Eliminar horarios que ya no están en la lista
            if (horariosToRemove.length > 0) {
              await StandHorarios.destroy({
                where: { idStand: id, idDetalleHorario: horariosToRemove },
                transaction,
              });
            }
          }
      
          await transaction.commit();
          return res.status(200).json({ message: 'Stand actualizado correctamente.' });
        } catch (error) {
          await transaction.rollback();
          console.error(`Error al actualizar el stand con ID ${id}:`, error);
          return res.status(500).json({ error: 'Error al actualizar el stand.' });
        }
    },
      

    async deleteStand(req, res) {
        const id = req.params.id; 
    
        try {
            const stands = await STANDS.findByPk(id);
    
            if (!stands) {
                return res.status(404).json({ error: 'Stand no encontrado' });
            }
    
            await stands.destroy();
            return res.status(200).json({ message: 'Stand eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar stand:', error);
            return res.status(500).json({ error: 'Error al eliminar stand' });
        }
    }
};