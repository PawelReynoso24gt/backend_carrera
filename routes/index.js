const { Router } = require('express');
const router = Router();

// Aqui van los imports
//RUTAS
const usuariosController = require('../controllers/usuariosController');
const horariosController = require('../controllers/horariosController');
const tipoStandsController = require('../controllers/tipoStandsController');
const categoriaHorariosController = require('../controllers/categoriaHorariosController');
const sedesController = require('../controllers/sedesController');
const eventosController = require ('../controllers/eventosController');

module.exports = (app) => {

    // * USUARIOS
    router.get('/usuarios/activos', usuariosController.find); // Listar todos los usuarios activos
    router.get('/usuarios', usuariosController.find_all_users); // Listar todos los usuarios
    router.get('/usuarios/:id', usuariosController.findById); // Obtener usuario por ID
    router.post('/usuarios', usuariosController.create); // Crear un usuario
    router.put('/usuarios/:id', usuariosController.update); // Actualizar usuario
    router.put('/usuarios/:id/contrasenia', usuariosController.update_password); // Actualizar contraseña del usuario
    router.delete('/usuarios/:id', usuariosController.delete); // Eliminar un usuario

    // * HORARIOS
    router.get('/horarios/activos', horariosController.find); // Listar todos los horarios activos
    router.get('/horarios', horariosController.find_all); // Listar todos los horarios
    router.get('/horarios/:id', horariosController.findById); // Obtener horario por ID
    router.post('/horarios', horariosController.create); // Crear un horario
    router.put('/horarios/:id', horariosController.update); // Actualizar horario
    router.delete('/horarios/:id', horariosController.delete); // Eliminar un horario

    // * TIPO STANDS
    router.get('/tipo_stands/activos', tipoStandsController.find); // Listar todos los tipos de stands activos
    router.get('/tipo_stands', tipoStandsController.find_all); // Listar todos los tipos de stands
    router.get('/tipo_stands/:id', tipoStandsController.findById); // Obtener tipo de stand por ID
    router.post('/tipo_stands', tipoStandsController.create); // Crear un tipo de stand
    router.put('/tipo_stands/:id', tipoStandsController.update); // Actualizar tipo de stand
    router.delete('/tipo_stands/:id', tipoStandsController.delete); // Eliminar un tipo de stand

    // * RUTAS DE SEDES
    router.get('/sedes', sedesController.find_All);
    router.get('/sedes/activas', sedesController.find_active);
    router.get('/sedes/inactivas', sedesController.find_inactive);
    router.post('/sedes', sedesController.create);
    router.put('/sedes/:idSede', sedesController.update);
    router.put('/sedes/desactivar/:idSede', sedesController.deactivate);
    router.put('/sedes/activar/:idSede', sedesController.activate);
    router.get('/sedes/:nombreSede', sedesController.find_sede);

    // * RUTAS DE EVENTOS
    router.get('/eventos', eventosController.find_All);
    router.get('/eventos/activas', eventosController.find_active);
    router.get('/eventos/inactivas', eventosController.find_inactive);
    router.post('/eventos', eventosController.create);
    router.put('/eventos/:idEvento', eventosController.update);
    router.put('/eventos/desactivar/:idEvento', eventosController.deactivate);
    router.put('/eventos/activar/:idEvento', eventosController.activate);
    router.get('/eventos/:nombreEvento', eventosController.find_evento);



    app.use('/', router);

};