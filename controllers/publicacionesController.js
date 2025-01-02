'use strict';
const { zonedTimeToUtc, format } = require('date-fns-tz');
const db = require("../models");
const { where } = require('sequelize');
const path = require('path');
const fs = require('fs');
const PUBLICACIONES = db.publicaciones;
const SEDES = db.sedes;
const EVENTOS = db.eventos;
const RIFAS = db.rifas;

module.exports = {
    // Obtener todas las publicaciones
    async find(req, res) {
        try {
        const publicaciones = await PUBLICACIONES.findAll({
            include: [
            {
                model: SEDES,
                as: 'sede',
                attributes: ['idSede', 'nombreSede']
            }
            ],
            where: {
                estado: 1
            }
        });
        return res.status(200).json(publicaciones);
        } catch (error) {
        console.error('Error al recuperar las publicaciones:', error);
        return res.status(500).json({
            message: 'Ocurrió un error al recuperar las publicaciones.'
        });
        }
    },

    // Obtener todas las publicaciones
    async findCompleto(req, res) {
        try {
            const publicaciones = await PUBLICACIONES.findAll({
                where: { estado: 1 },
                include: [
                    { model: db.sedes, as: 'sede' },
                    { model: db.publicacion_generales, as: 'publicacionesGenerales' },
                    { model: db.publicacion_eventos, as: 'publicacionesEventos', include: [{ model: db.eventos, as: 'evento' }] },
                    { model: db.publicacion_rifas, as: 'publicacionesRifas', include: [{ model: db.rifas, as: 'rifa' }] }
                ]
            });
    
            // Agregar el tipo de publicación dinámicamente
            const publicacionesConTipo = publicaciones.map(publicacion => {
                let tipoPublicacion = 'Sin Tipo'; // Valor por defecto
                if (publicacion.publicacionesGenerales && publicacion.publicacionesGenerales.length > 0) {
                    tipoPublicacion = 'Generales';
                } else if (publicacion.publicacionesEventos && publicacion.publicacionesEventos.length > 0) {
                    tipoPublicacion = 'Eventos';
                } else if (publicacion.publicacionesRifas && publicacion.publicacionesRifas.length > 0) {
                    tipoPublicacion = 'Rifas';
                }
                return { ...publicacion.toJSON(), tipoPublicacion }; // Agregar el campo
            });
    
            return res.status(200).json(publicacionesConTipo);
        } catch (error) {
            console.error('Error al recuperar las publicaciones:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar las publicaciones.'
            });
        }
    },    

    async getPublicacionDetalles(req, res) {
        const { id } = req.params; // ID de la publicación
    
        try {
            // Obtener la publicación principal
            const publicacion = await db.publicaciones.findOne({
                where: { idPublicacion: id },
                include: [
                    {
                        model: db.sedes,
                        as: 'sede',
                    },
                    {
                        model: db.publicacion_generales,
                        as: 'publicacionesGenerales',
                    },
                    {
                        model: db.publicacion_eventos,
                        as: 'publicacionesEventos',
                        include: [
                            {
                                model: db.eventos,
                                as: 'evento',
                            }
                        ]
                    },
                    {
                        model: db.publicacion_rifas,
                        as: 'publicacionesRifas',
                        include: [
                            {
                                model: db.rifas,
                                as: 'rifa',
                            }
                        ]
                    }
                ]
            });
    
            if (!publicacion) {
                return res.status(404).json({ message: 'Publicación no encontrada' });
            }
    
            return res.status(200).json(publicacion);
        } catch (error) {
            console.error('Error al obtener los detalles de la publicación:', error);
            return res.status(500).json({ message: 'Error al obtener los detalles de la publicación.' });
        }
    },    

    // Obtener todas las publicaciones activas
    async findActive(req, res) {
        try {
        const publicaciones = await PUBLICACIONES.findAll({
            where: { estado: 1 },
            include: [
                {
                    model: db.sedes,
                    as: 'sede',
                },
                {
                    model: db.publicacion_generales,
                    as: 'publicacionesGenerales',
                },
                {
                    model: db.publicacion_eventos,
                    as: 'publicacionesEventos',
                    include: [
                        {
                            model: db.eventos,
                            as: 'evento',
                        }
                    ]
                },
                {
                    model: db.publicacion_rifas,
                    as: 'publicacionesRifas',
                    include: [
                        {
                            model: db.rifas,
                            as: 'rifa',
                        }
                    ]
                }
            ]
        });
        // Agregar el tipo de publicación dinámicamente
        const publicacionesConTipo = publicaciones.map(publicacion => {
            let tipoPublicacion = 'Sin Tipo'; // Valor por defecto
            if (publicacion.publicacionesGenerales && publicacion.publicacionesGenerales.length > 0) {
                tipoPublicacion = 'Generales';
            } else if (publicacion.publicacionesEventos && publicacion.publicacionesEventos.length > 0) {
                tipoPublicacion = 'Eventos';
            } else if (publicacion.publicacionesRifas && publicacion.publicacionesRifas.length > 0) {
                tipoPublicacion = 'Rifas';
            }
            return { ...publicacion.toJSON(), tipoPublicacion }; // Agregar el campo
        });

        return res.status(200).json(publicacionesConTipo);
        } catch (error) {
        console.error('Error al listar las publicaciones activas:', error);
        return res.status(500).json({
            message: error.message || 'Error al listar las publicaciones activas.'
        });
        }
    },

    // Obtener todas las publicaciones inactivas
    async findInactive(req, res) {
        try {
        const publicaciones = await PUBLICACIONES.findAll({
            where: { estado: 0 },
            include: [
                {
                    model: db.sedes,
                    as: 'sede',
                },
                {
                    model: db.publicacion_generales,
                    as: 'publicacionesGenerales',
                },
                {
                    model: db.publicacion_eventos,
                    as: 'publicacionesEventos',
                    include: [
                        {
                            model: db.eventos,
                            as: 'evento',
                        }
                    ]
                },
                {
                    model: db.publicacion_rifas,
                    as: 'publicacionesRifas',
                    include: [
                        {
                            model: db.rifas,
                            as: 'rifa',
                        }
                    ]
                }
            ]
        });
        // Agregar el tipo de publicación dinámicamente
        const publicacionesConTipo = publicaciones.map(publicacion => {
            let tipoPublicacion = 'Sin Tipo'; // Valor por defecto
            if (publicacion.publicacionesGenerales && publicacion.publicacionesGenerales.length > 0) {
                tipoPublicacion = 'Generales';
            } else if (publicacion.publicacionesEventos && publicacion.publicacionesEventos.length > 0) {
                tipoPublicacion = 'Eventos';
            } else if (publicacion.publicacionesRifas && publicacion.publicacionesRifas.length > 0) {
                tipoPublicacion = 'Rifas';
            }
            return { ...publicacion.toJSON(), tipoPublicacion }; // Agregar el campo
        });

        return res.status(200).json(publicacionesConTipo);
        } catch (error) {
        console.error('Error al listar las publicaciones inactivas:', error);
        return res.status(500).json({
            message: error.message || 'Error al listar las publicaciones inactivas.'
        });
        }
    },

    // Obtener una publicación por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
        const publicacion = await PUBLICACIONES.findByPk(id, {
            include: [
            {
                model: SEDES,
                as: 'sede',
                attributes: ['idSede', 'nombreSede']
            }
            ]
        });

        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        return res.status(200).json(publicacion);
        } catch (error) {
        console.error(`Error al buscar la publicación con ID ${id}:`, error);
        return res.status(500).json({
            message: 'Ocurrió un error al recuperar la publicación.'
        });
        }
    },

      // Crear una nueva publicación
    async create(req, res) {
        const { nombrePublicacion, descripcion, idSede } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;
        console.log("Datos recibidos:", req.body);
        if (!nombrePublicacion || !descripcion || !idSede) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            const nuevaPublicacion = await PUBLICACIONES.create({
            nombrePublicacion,
            descripcion,
            idSede,
            estado,
            fechaPublicacion: new Date(), // Fecha de creación actual
            });

            // Convertir fecha al formato UTC-6 para la respuesta
            const publicacionConFormato = {
            ...nuevaPublicacion.toJSON(),
            fechaPublicacion: format(new Date(nuevaPublicacion.fechaPublicacion), "yyyy-MM-dd HH:mm:ss", {
                timeZone: "America/Guatemala",
            }),
            };

            return res.status(201).json({
            message: "Publicación creada con éxito",
            createdPublicacion: publicacionConFormato,
            });
        } catch (error) {
            console.error("Error al crear la publicación:", error);
            return res.status(500).json({ message: "Error al crear la publicación." });
        }
    },

    // Crear una nueva publicación
    async createCompleto(req, res) {
        const { nombrePublicacion, descripcion, idSede, tipo } = req.body; // `tipo` define si es 'generales', 'eventos', o 'rifas'
        const estado = req.body.estado !== undefined ? req.body.estado : 1;
        console.log("Datos recibidos:", req.body);
        if (!nombrePublicacion || !descripcion || !idSede || !tipo) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const fotosPaths = []; // Array para almacenar las rutas de las fotos subidas

        try {
            // Crear la publicación base
            const nuevaPublicacion = await PUBLICACIONES.create({
                nombrePublicacion,
                descripcion,
                idSede,
                estado,
                fechaPublicacion: new Date() // Fecha de creación actual
            });

            // Verificar si hay fotos en la solicitud y guardarlas en la carpeta adecuada
            if (req.files && req.files.length > 0) {
                const folderMap = {
                    generales: 'src/publicaciones/generales',
                    eventos: 'src/publicaciones/eventos',
                    rifas: 'src/publicaciones/rifas',
                };

                // RUTA RELATIVA
                for (const file of req.files) {
                    fotosPaths.push(`publicaciones/${tipo}/${file.filename}`);
                }

                const folder = folderMap[tipo];
                if (!folder) {
                    return res.status(400).json({ message: 'El tipo especificado no es válido.' });
                }

                // Crear el directorio si no existe
                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder, { recursive: true });
                }

                // Mover cada archivo a la carpeta correspondiente RUTA ABSULOTA
                // for (const file of req.files) {
                //     const uniqueFileName = `${Date.now()}-${file.originalname}`;
                //     const fotoPath = path.join(folder, uniqueFileName);

                //     fs.renameSync(file.path, fotoPath); // Mover el archivo
                //     fotosPaths.push(fotoPath); // Guardar la ruta en el array
                // }
            }

            // Manejar el tipo de publicación
            if (tipo === 'generales') {
                for (const fotoPath of fotosPaths) {
                    await db.publicacion_generales.create({
                        idPublicacion: nuevaPublicacion.idPublicacion,
                        foto: fotoPath,
                        estado
                    });
                }
            } else if (tipo === 'eventos') {
                const { idEvento } = req.body;
                if (!idEvento) {
                    return res.status(400).json({ message: 'El campo idEvento es obligatorio para tipo "eventos".' });
                }
                for (const fotoPath of fotosPaths) {
                    await db.publicacion_eventos.create({
                        idPublicacion: nuevaPublicacion.idPublicacion,
                        idEvento,
                        foto: fotoPath,
                        estado
                    });
                }
            } else if (tipo === 'rifas') {
                const { idRifa } = req.body;
                if (!idRifa) {
                    return res.status(400).json({ message: 'El campo idRifa es obligatorio para tipo "rifas".' });
                }
                for (const fotoPath of fotosPaths) {
                    await db.publicacion_rifas.create({
                        idPublicacion: nuevaPublicacion.idPublicacion,
                        idRifa,
                        foto: fotoPath,
                        estado
                    });
                }
            }

            // Convertir fecha al formato UTC-6 para la respuesta
            const publicacionConFormato = {
                ...nuevaPublicacion.toJSON(),
                fechaPublicacion: format(new Date(nuevaPublicacion.fechaPublicacion), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala",
                })
            };

            return res.status(201).json({
                message: "Publicación creada con éxito",
                createdPublicacion: publicacionConFormato
            });
        } catch (error) {
            console.error("Error al crear la publicación:", error);

            // Si ocurrió un error y se subieron fotos, eliminarlas
            if (fotosPaths.length > 0) {
                for (const fotoPath of fotosPaths) {
                    if (fs.existsSync(fotoPath)) {
                        fs.unlinkSync(fotoPath);
                    }
                }
            }

            return res.status(500).json({ message: "Error al crear la publicación." });
        }
    },
    
    // Actualizar una publicación existente
    async update(req, res) {
        const { nombrePublicacion, fechaPublicacion, descripcion, estado, idSede } = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};
    
        if (nombrePublicacion !== undefined) camposActualizados.nombrePublicacion = nombrePublicacion;
        if (fechaPublicacion !== undefined) camposActualizados.fechaPublicacion = fechaPublicacion;
        if (descripcion !== undefined) camposActualizados.descripcion = descripcion;
        if (estado !== undefined) camposActualizados.estado = estado;
    
        if (idSede !== undefined) {
            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(400).json({ message: 'La sede especificada no existe.' });
            }
            camposActualizados.idSede = idSede;
        }
    
        try {
            const [rowsUpdated] = await PUBLICACIONES.update(camposActualizados, {
                where: { idPublicacion: id }
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Publicación no encontrada' });
            }
    
            const publicacionActualizada = await PUBLICACIONES.findByPk(id, {
                include: [
                    {
                        model: SEDES,
                        as: 'sede',
                        attributes: ['idSede', 'nombreSede']
                    }
                ]
            });
    
            // Convertir la fecha de la publicación a UTC-6 para la respuesta
            const publicacionConFormato = {
                ...publicacionActualizada.toJSON(),
                fechaPublicacion: format(new Date(publicacionActualizada.fechaPublicacion), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala",
                }),
            };
            console.log('Rutas de fotos guardadas en la base de datos:', fotosPaths);
            return res.status(200).json({
                message: `La publicación con ID: ${id} ha sido actualizada`,
                updatedPublicacion: publicacionConFormato,
            });
        } catch (error) {
            console.error(`Error al actualizar la publicación con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la publicación' });
        }
    },

    // Actualizar una publicación existente
    async updateCompleto(req, res) {
        const { nombrePublicacion, fechaPublicacion, descripcion, estado, idSede, tipo, idRifa, idEvento } = req.body;
        const id = req.params.id;

        const camposActualizados = {};
        if (nombrePublicacion !== undefined) camposActualizados.nombrePublicacion = nombrePublicacion;
        if (descripcion !== undefined) camposActualizados.descripcion = descripcion;
        if (fechaPublicacion !== undefined) {
            try {
                // Parsear la fecha y establecer segundos a 0
                const [datePart, timePart] = fechaPublicacion.split(' ');
                const [year, month, day] = datePart.split('-');
                const [hour, minute] = timePart.split(':');
                
                const fechaValida = new Date(year, month - 1, day, hour, minute, 0); // Siempre segundos = 0

                // Verificar que la fecha sea válida
                if (isNaN(fechaValida.getTime())) {
                    return res.status(400).json({ message: 'El formato de fecha y hora es inválido.' });
                }

                camposActualizados.fechaPublicacion = fechaValida; // Guardar la fecha ajustada
            } catch (error) {
                return res.status(400).json({ message: 'Error procesando la fecha de publicación.' });
            }
        }
        if (estado !== undefined) camposActualizados.estado = estado;

        if (idSede !== undefined) {
            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(400).json({ message: 'La sede especificada no existe.' });
            }
            camposActualizados.idSede = idSede;
        }

        const fotosPaths = []; // Array para almacenar las rutas de las fotos nuevas

        try {
            // Verificar la existencia de la publicación
            const publicacionExistente = await PUBLICACIONES.findByPk(id, {
                include: [
                    { model: db.publicacion_generales, as: 'publicacionesGenerales' },
                    { model: db.publicacion_eventos, as: 'publicacionesEventos' },
                    { model: db.publicacion_rifas, as: 'publicacionesRifas' }
                ]
            });

            if (!publicacionExistente) {
                return res.status(404).json({ message: 'Publicación no encontrada' });
            }

            // Identificar la carpeta y tipo actual
            const folderMap = {
                generales: 'src/publicaciones/generales',
                eventos: 'src/publicaciones/eventos',
                rifas: 'src/publicaciones/rifas',
            };

            const oldFolder = folderMap[tipo];
            const newFolder = folderMap[tipo];

            if (!newFolder) {
                return res.status(400).json({ message: 'El nuevo tipo especificado no es válido.' });
            }

            // Si el tipo cambió, mover las fotos y eliminar las anteriores
            if (tipo !== undefined) {
                const fotosAnteriores = [
                    ...(publicacionExistente.publicacionesGenerales || []),
                    ...(publicacionExistente.publicacionesEventos || []),
                    ...(publicacionExistente.publicacionesRifas || [])
                ];

                const fotosAnterioresPaths = fotosAnteriores.map(foto => foto.foto);

                // Comparar fotos nuevas con las existentes y eliminar las que no están
                for (const fotoAnterior of fotosAnterioresPaths) {
                    if (!fotosPaths.includes(fotoAnterior)) {
                        const oldPath = path.join(oldFolder, path.basename(fotoAnterior));
                        if (fs.existsSync(oldPath)) {
                            fs.unlinkSync(oldPath); // Eliminar archivo del sistema de archivos
                        }
                    }
                }

                // Eliminar registros en las tablas anteriores
                await db.publicacion_generales.destroy({ where: { idPublicacion: id } });
                await db.publicacion_eventos.destroy({ where: { idPublicacion: id } });
                await db.publicacion_rifas.destroy({ where: { idPublicacion: id } });
            }

            // Procesar nuevas fotos si se envían
            if (req.files && req.files.length > 0) {

                // Usar la carpeta correspondiente al tipo proporcionado en la solicitud
                const targetFolder = folderMap[tipo];

                if (!fs.existsSync(newFolder)) {
                    fs.mkdirSync(newFolder, { recursive: true });
                }

                for (const file of req.files) {
                    const fotoPath = `publicaciones/${tipo}/${file.filename}`;
                    const destinationPath = path.join(targetFolder, file.filename);

                    // Mover la foto a la carpeta correspondiente al tipo
                    fs.renameSync(file.path, destinationPath);
                    fotosPaths.push(fotoPath);
                }
            }

            // Guardar las nuevas fotos en la tabla correspondiente
            if (tipo === 'generales') {
                await db.publicacion_generales.bulkCreate(
                    fotosPaths.map(fotoPath => ({
                        idPublicacion: id,
                        foto: fotoPath,
                        estado: estado || 1,
                    }))
                );
            } else if (tipo === 'eventos') {
                if (!idEvento) {
                    return res.status(400).json({ message: 'El campo idEvento es obligatorio para tipo "eventos".' });
                }
                await db.publicacion_eventos.bulkCreate(
                    fotosPaths.map(fotoPath => ({
                        idPublicacion: id,
                        idEvento,
                        foto: fotoPath,
                        estado: estado || 1,
                    }))
                );
            } else if (tipo === 'rifas') {
                if (!idRifa) {
                    return res.status(400).json({ message: 'El campo idRifa es obligatorio para tipo "rifas".' });
                }
                await db.publicacion_rifas.bulkCreate(
                    fotosPaths.map(fotoPath => ({
                        idPublicacion: id,
                        idRifa,
                        foto: fotoPath,
                        estado: estado || 1,
                    }))
                );
            }

            // Actualizar los campos principales
            await PUBLICACIONES.update(camposActualizados, { where: { idPublicacion: id } });

            // Convertir fecha al formato UTC-6 para la respuesta
            const publicacionActualizada = await PUBLICACIONES.findByPk(id);
            const publicacionConFormato = {
                ...publicacionActualizada.toJSON(),
                fechaPublicacion: format(new Date(publicacionActualizada.fechaPublicacion), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala",
                }),
            };

            return res.status(200).json({
                message: `La publicación con ID: ${id} ha sido actualizada correctamente`,
                updatedPublicacion: publicacionConFormato,
            });
        } catch (error) {
            console.error(`Error al actualizar la publicación con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la publicación' });
        }
    },

    // Eliminar una publicación
    async delete(req, res) {
        const id = req.params.id;

        try {
        const publicacion = await PUBLICACIONES.findByPk(id);

        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        await publicacion.destroy();
        return res.status(200).json({ message: 'Publicación eliminada correctamente' });
        } catch (error) {
        console.error('Error al eliminar la publicación:', error);
        return res.status(500).json({ error: 'Error al eliminar la publicación' });
        }
    }
};
