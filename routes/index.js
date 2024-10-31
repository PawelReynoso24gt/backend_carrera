const { Router } = require('express');
const router = Router();

// Aqui van los imports

//RUTAS
const sedesController = require('../controllers/sedesController');
const eventosController = require ('../controllers/eventosController');
const departamentosController = require('../controllers/departamentosController');
const tipoPagosController = require('../controllers/tipoPagosController');

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

    // * RUTAS DEPARTAMENTOS
    router.get('/departamentos', departamentosController.find);
    router.get('/departamentos/activas', departamentosController.findActivateDepto);
    router.get('/departamentos/inactivas', departamentosController.findaInactivateDepto);
    router.post('/departamentos/create', departamentosController.createDepto);
    router.put('/departamentos/:id', departamentosController.updateDepto);
    router.delete('/departamentos/delete/:id', departamentosController.deleteDepto);

    //* RUTAS TIPO PAGO
    router.get('/tipopagos', tipoPagosController.find);
    router.get('/tipopagos/activas', tipoPagosController.findActivateDepto);
    router.get('/tipopagos/inactivas', tipoPagosController.findaInactivateDepto);
    router.post('/tipopagos/create', tipoPagosController.createTipoPago);
    router.put('/tipopagos/:id', tipoPagosController.updateTipoPago);
    router.delete('/tipopagos/delete/:id', tipoPagosController.deleteTiposPago);
    app.use('/', router);

};