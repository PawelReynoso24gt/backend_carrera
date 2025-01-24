'use strict';
const { zonedTimeToUtc, format } = require('date-fns-tz');
const db = require("../models");
const { where } = require('sequelize');
const path = require('path');
const fs = require('fs');
const upload = require('../middlewares/multerConfig');
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

    // Obtener todas las publicaciones PARA INVITADO
    async findInvitado(req, res) {
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
                    tipoPublicacion = 'generales';
                } else if (publicacion.publicacionesEventos && publicacion.publicacionesEventos.length > 0) {
                    tipoPublicacion = 'eventos';
                } else if (publicacion.publicacionesRifas && publicacion.publicacionesRifas.length > 0) {
                    tipoPublicacion = 'rifas';
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
                    tipoPublicacion = 'generales';
                } else if (publicacion.publicacionesEventos && publicacion.publicacionesEventos.length > 0) {
                    tipoPublicacion = 'eventos';
                } else if (publicacion.publicacionesRifas && publicacion.publicacionesRifas.length > 0) {
                    tipoPublicacion = 'rifas';
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

    // Obtener una publicación por id con detalles del mismo
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

            // Determinar el tipo de publicación
            let tipoPublicacion = 'Sin Tipo'; // Valor por defecto
            if (publicacion.publicacionesGenerales && publicacion.publicacionesGenerales.length > 0) {
                tipoPublicacion = 'generales';
            } else if (publicacion.publicacionesEventos && publicacion.publicacionesEventos.length > 0) {
                tipoPublicacion = 'eventos';
            } else if (publicacion.publicacionesRifas && publicacion.publicacionesRifas.length > 0) {
                tipoPublicacion = 'rifas';
            }

            // Agregar el tipo de publicación al objeto
            const publicacionConTipo = { ...publicacion.toJSON(), tipoPublicacion };

            return res.status(200).json(publicacionConTipo);
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
        //console.log("Datos recibidos:", req.body);
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
        //console.log("Datos recibidos:", req.body);
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
                    fotosPaths.push(`publicaciones_image/${tipo}/${file.filename}`);
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
            //console.log('Rutas de fotos guardadas en la base de datos:', fotosPaths);
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
    const { nombrePublicacion, fechaPublicacion, descripcion, estado, idSede, tipo, idRifa, idEvento, photosToRemove, photosToMove } = req.body;
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

        // Mover fotos entre carpetas según el nuevo tipo
        if (tipo) {
            // Verificar el tipo actual y mover las imágenes físicas
            const allPhotos = [
                ...publicacionExistente.publicacionesGenerales,
                ...publicacionExistente.publicacionesEventos,
                ...publicacionExistente.publicacionesRifas,
            ];

            for (const photoRecord of allPhotos) {
                const currentType = 
                    publicacionExistente.publicacionesGenerales.includes(photoRecord) ? "generales" :
                    publicacionExistente.publicacionesEventos.includes(photoRecord) ? "eventos" :
                    "rifas";

                if (currentType !== tipo) {
                    const oldPath = path.join(
                        __dirname,
                        "../src/publicaciones",
                        photoRecord.foto.replace("publicaciones_image", "")
                    );
                    //console.log(`Ruta original del archivo: ${oldPath}`); // Log para depuración

                    // Construcción de la nueva carpeta
                    const newFolder = path.join(__dirname, "../src/publicaciones", tipo);
                    if (!fs.existsSync(newFolder)) {
                        fs.mkdirSync(newFolder, { recursive: true });
                        //console.log(`Nueva carpeta creada: ${newFolder}`);
                    }

                    // Construcción de la nueva ruta con el nombre del archivo
                    const newPath = path.join(newFolder, path.basename(photoRecord.foto));
                    //console.log(`Nueva ruta del archivo: ${newPath}`);

                    // Verificar y mover el archivo
                    if (fs.existsSync(oldPath)) {
                        try {
                            fs.renameSync(oldPath, newPath); // Mover archivo
                            //console.log(`Archivo movido exitosamente de ${oldPath} a ${newPath}`);
                        } catch (error) {
                            console.error(`Error al mover el archivo de ${oldPath} a ${newPath}:`, error);
                            return res.status(500).json({ error: 'Error al mover el archivo físico' });
                        }
                    } else {
                        console.error(`Archivo no encontrado en la ruta: ${oldPath}`);
                        return res.status(404).json({ error: `Archivo no encontrado: ${photoRecord.foto}` });
                    }

                    // Actualizar tablas
                    const newPathDb = `publicaciones_image/${tipo}/${path.basename(photoRecord.foto)}`;

                    if (currentType === "generales") {
                        // Mover de 'generales' a nuevo tipo
                        await db.publicacion_generales.destroy({ where: { idPublicacionGeneral: photoRecord.idPublicacionGeneral } });
                        if (tipo === "eventos") {
                            await db.publicacion_eventos.create({
                                idPublicacion: id,
                                idEvento,
                                foto: newPathDb,
                                estado: photoRecord.estado,
                            });
                        } else if (tipo === "rifas") {
                            await db.publicacion_rifas.create({
                                idPublicacion: id,
                                idRifa,
                                foto: newPathDb,
                                estado: photoRecord.estado,
                            });
                        }
                    } else if (currentType === "eventos") {
                        // Mover de 'eventos' a nuevo tipo
                        await db.publicacion_eventos.destroy({ where: { idPublicacionEvento: photoRecord.idPublicacionEvento } });
                        if (tipo === "generales") {
                            await db.publicacion_generales.create({
                                idPublicacion: id,
                                foto: newPathDb,
                                estado: photoRecord.estado,
                            });
                        } else if (tipo === "rifas") {
                            await db.publicacion_rifas.create({
                                idPublicacion: id,
                                idRifa,
                                foto: newPathDb,
                                estado: photoRecord.estado,
                            });
                        }
                    } else if (currentType === "rifas") {
                        // Mover de 'rifas' a nuevo tipo
                        await db.publicacion_rifas.destroy({ where: { idPublicacionRifa: photoRecord.idPublicacionRifa } });
                        if (tipo === "generales") {
                            await db.publicacion_generales.create({
                                idPublicacion: id,
                                foto: newPathDb,
                                estado: photoRecord.estado,
                            });
                        } else if (tipo === "eventos") {
                            await db.publicacion_eventos.create({
                                idPublicacion: id,
                                idEvento,
                                foto: newPathDb,
                                estado: photoRecord.estado,
                            });
                        }
                    }
                }
            }
        }

        // Eliminar las fotos seleccionadas
        if (photosToRemove) {
            const photosToRemoveArray = JSON.parse(photosToRemove);
            for (const photoId of photosToRemoveArray) {
                let foto = null;
                let tableName = null;

                if ((foto = await db.publicacion_generales.findByPk(photoId))) {
                    tableName = "publicacion_generales";
                } else if ((foto = await db.publicacion_eventos.findByPk(photoId))) {
                    tableName = "publicacion_eventos";
                } else if ((foto = await db.publicacion_rifas.findByPk(photoId))) {
                    tableName = "publicacion_rifas";
                }

                if (foto) {
                    const fotoPath = path.join(__dirname, "../src/publicaciones", foto.foto.replace("publicaciones_image", ""));
                    //console.log(`Intentando eliminar archivo en: ${fotoPath}`); // Log del path

                    // Verificar si el archivo existe y eliminarlo
                    if (fs.existsSync(fotoPath)) {
                        fs.unlinkSync(fotoPath);
                        //console.log(`Archivo eliminado exitosamente: ${fotoPath}`);
                    } else {
                        //console.log(`El archivo no existe en: ${fotoPath}`);
                    }

                    const idKey = 
                        tableName === "publicacion_generales" ? "idPublicacionGeneral" :
                        tableName === "publicacion_eventos" ? "idPublicacionEvento" :
                        "idPublicacionRifa";

                    await db[tableName].destroy({ where: { [idKey]: photoId } });
                }
            }
        }

        // Procesar nuevas fotos
        const fotosPaths = [];
        if (req.files && req.files.length > 0) {
            const targetFolder = `src/publicaciones/${tipo}`;
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            for (const file of req.files) {
                const newPath = path.join(targetFolder, file.filename);
                //console.log(`Moviendo archivo desde ${file.path} a ${newPath}`); // Log del movimiento
                fs.renameSync(file.path, newPath);
                fotosPaths.push(`publicaciones_image/${tipo}/${file.filename}`);
            }
            //console.log("Rutas de las nuevas fotos procesadas:", fotosPaths); // Log de las rutas finales

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
