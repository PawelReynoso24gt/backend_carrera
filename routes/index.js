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
const standsController = require('../controllers/standsController');
const tipoPublicoController =  require('../controllers/tipo_publicosController');
const categoriaBitacorasController = require('../controllers/categoria_bitacorasController');
const tipoTrasladosController = require('../controllers/tipoTrasladosController');
const trasladosController = require('../controllers/trasladosController');
const productosController = require('../controllers/productosController');
const rifasController = require('../controllers/rifasController');
const pedidosController = require('../controllers/pedidosController');



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

    // * RUTAS TIPO PUBLICO
    router.get('/tipo_publicos', tipoPublicoController.find);
    router.get('/tipo_publicos/activos', tipoPublicoController.findActive);
    router.get('/tipo_publicos/inactivos', tipoPublicoController.findInactive);
    router.get('/tipo_publicos/:id', tipoPublicoController.findById);
    router.post('/tipo_publicos/create', tipoPublicoController.create);
    router.put('/tipo_publicos/update/:id', tipoPublicoController.update);
    router.delete('/tipo_publicos/delete/:id', tipoPublicoController.delete);

    // * RUTAS PARA CATEGORÍA DE BITÁCORAS
    router.get('/categoria_bitacoras', categoriaBitacorasController.find);
    router.get('/categoria_bitacoras/:id', categoriaBitacorasController.findById);
    router.post('/categoria_bitacoras', categoriaBitacorasController.create);
    router.put('/categoria_bitacoras/:id', categoriaBitacorasController.update);
    router.delete('/categoria_bitacoras/:id', categoriaBitacorasController.delete);

        // * RUTAS DE CATEGORIA HORARIOS
    router.get('/categoriaHorarios', categoriaHorariosController.find_All);
    router.get('/categoriaHorarios/activas', categoriaHorariosController.find_active);
    router.get('/categoriaHorarios/inactivas', categoriaHorariosController.find_inactive);
    router.post('/categoriaHorarios', categoriaHorariosController.create);
    router.put('/categoriaHorarios/:idCategoriaHorario', categoriaHorariosController.update);
    router.put('/categoriaHorarios/desactivar/:idCategoriaHorario', categoriaHorariosController.deactivate);
    router.put('/categoriaHorarios/activar/:idCategoriaHorario', categoriaHorariosController.activate);
    router.get('/categoriaHorarios/:categoria', categoriaHorariosController.find_categoria);

    // * RUTAS DE TIPO TRASLADOS
    router.get('/tipoTraslados', tipoTrasladosController.find_All);
    router.get('/tipoTraslados/activas', tipoTrasladosController.find_active);
    router.get('/tipoTraslados/inactivas', tipoTrasladosController.find_inactive);
    router.post('/tipoTraslados', tipoTrasladosController.create);
    router.put('/tipoTraslados/:idTipoTraslado', tipoTrasladosController.update);
    router.put('/tipoTraslados/desactivar/:idTipoTraslado', tipoTrasladosController.deactivate);
    router.put('/tipoTraslados/activar/:idTipoTraslado', tipoTrasladosController.activate);
    router.get('/tipoTraslados/:tipo', tipoTrasladosController.find_tipo);

    // * RUTAS DE TRASLADOS
    router.get('/traslados', trasladosController.find_All);
    router.get('/traslados/activas', trasladosController.find_active);
    router.get('/traslados/inactivas', trasladosController.find_inactive);
    router.post('/traslados', trasladosController.create);
    router.put('/traslados/:idTraslado', trasladosController.update);
    router.put('/traslados/desactivar/:idTraslado', trasladosController.deactivate);
    router.put('/traslados/activar/:idTraslado', trasladosController.activate);
    router.get('/traslados/:descripcion', trasladosController.find_traslado);

    // * PRODUCTOS
    router.get('/productos', productosController.find); 
    router.get('/productos/:id', productosController.findById); 
    router.post('/productos', productosController.create); 
    router.put('/productos/:id', productosController.update);
    router.delete('/productos/:id', productosController.delete); 

    // * RIFAS
    router.get('/rifas', rifasController.find);
    router.get('/rifas/activos', rifasController.findActive);
    router.get('/rifas/inactivos', rifasController.findInactive);
    router.get('/rifas/:id', rifasController.findById);
    router.post('/rifas', rifasController.create);
    router.put('/rifas/:id', rifasController.update);
    router.delete('/rifas/:id', rifasController.delete);
    // * RUTAS DE PEDIDOS
    router.get('/pedidos', pedidosController.find_All);
    router.get('/pedidos/activas', pedidosController.find_active);
    router.get('/pedidos/inactivas', pedidosController.find_inactive);
    router.post('/pedidos', pedidosController.create);
    router.put('/pedidos/:idPedido', pedidosController.update);
    router.put('/pedidos/desactivar/:idPedido', pedidosController.deactivate);
    router.put('/pedidos/activar/:idPedido', pedidosController.activate);
    router.get('/pedidos/:descripcion', pedidosController.find_pedido);
    // * RUTAS DE STAND
    router.get('/stand', standsController.find);
    router.get('/stand/activas', standsController.findActivateStand);
    router.get('/stand/inactivas', standsController.findaInactivateStand);
    router.post('/stand/create', standsController.createStand);
    router.put('/stand/update/:id', standsController.updateStand);
    router.delete('/stand/:id', standsController.deleteTiposPago);
    app.use('/', router);

};