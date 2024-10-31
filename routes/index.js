const { Router } = require('express');
const router = Router();

// Aqui van los imports

//RUTAS
const categoriaHorariosController = require('../controllers/categoriaHorariosController');
const sedesController = require('../controllers/sedesController');
const eventosController = require ('../controllers/eventosController');
const categoriaController = require('../controllers/categoriaController')

module.exports = (app) => {

    //AQUI VAN LAS RUTAS
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

 // * RUTAS DE CATEGORIA
 router.get('/categorias', categoriaController.find_All);
 router.get('/categorias/activas', categoriaController.find_active);
 router.get('/categorias/inactivas', categoriaController.find_inactive);
 router.post('/categorias', categoriaController.create);
 router.put('/categorias/:idCategoria', categoriaController.update);
 router.put('/categorias/desactivar/:idCategoria', categoriaController.deactivate);
 router.put('/categorias/activar/:idCategoria', categoriaController.activate);
 router.get('/categorias/:nombreCategoria', categoriaController.find_categoria);

 // * Listar todas las categorías de horarios
router.get('/categoriaHorarios', categoriaHorariosController.find_All);
router.get('/categoriaHorarios/activas', categoriaHorariosController.find_active);
router.get('/categoriaHorarios/inactivas', categoriaHorariosController.find_inactive);
router.post('/categoriaHorarios', categoriaHorariosController.create);
router.put('/categoriaHorarios/:idCategoriaHorario', categoriaHorariosController.update);
router.put('/categoriaHorarios/desactivar/:idCategoriaHorario', categoriaHorariosController.deactivate);
router.put('/categoriaHorarios/activar/:idCategoriaHorario', categoriaHorariosController.activate);
router.get('/categoriaHorarios/:categoria', categoriaHorariosController.find_categoria);


    app.use('/', router);

};