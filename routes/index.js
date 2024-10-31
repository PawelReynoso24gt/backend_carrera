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
const departamentosController = require('../controllers/departamentosController');
const tipoPagosController = require('../controllers/tipoPagosController');
const categoriaBitacorasController = require('../controllers/categoria_bitacorasController');
const tipoTrasladosController = require('../controllers/tipoTrasladosController');
const trasladosController = require('../controllers/trasladosController');
const productosController = require('../controllers/productosController');
const rifasController = require('../controllers/rifasController');
const pedidosController = require('../controllers/pedidosController');
const municipiosController = require('../controllers/municipiosController');
const detalleHorariosController = require('../controllers/detalle_horariosController');
const tipoPublicoController =  require('../controllers/tipo_publicosController');
const fotosSedesController = require('../controllers/fotosSedesController');



module.exports = (app) => {

    // * USUARIOS
    router.get('/usuarios/activos', usuariosController.find);
    router.get('/usuarios', usuariosController.find_all_users);
    router.get('/usuarios/:id', usuariosController.findById);
    router.post('/usuarios', usuariosController.create);
    router.put('/usuarios/:id', usuariosController.update);
    router.put('/usuarios/:id/contrasenia', usuariosController.update_password);
    router.delete('/usuarios/:id', usuariosController.delete);

    // * HORARIOS
    router.get('/horarios/activos', horariosController.find);
    router.get('/horarios', horariosController.find_all);
    router.get('/horarios/:id', horariosController.findById);
    router.post('/horarios', horariosController.create);
    router.put('/horarios/:id', horariosController.update);
    router.delete('/horarios/:id', horariosController.delete);

    // * TIPO STANDS
    router.get('/tipo_stands/activos', tipoStandsController.find);
    router.get('/tipo_stands', tipoStandsController.find_all);
    router.get('/tipo_stands/:id', tipoStandsController.findById);
    router.post('/tipo_stands', tipoStandsController.create);
    router.put('/tipo_stands/:id', tipoStandsController.update);
    router.delete('/tipo_stands/:id', tipoStandsController.delete);

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

    // * RUTAS DE STAND
    router.get('/stand', standsController.find);
    router.get('/stand/activas', standsController.findActivateStand);
    router.get('/stand/inactivas', standsController.findaInactivateStand);
    router.post('/stand/create', standsController.createStand);
    router.put('/stand/update/:id', standsController.updateStand);
    router.delete('/stand/:id', standsController.deleteStand);

    // * RUTAS DE DEPARTAMENTOS
    router.get('/departamentos', departamentosController.find);
    router.get('/departamentos/activas', departamentosController.findActivateDepto);
    router.get('/departamentos/inactivas', departamentosController.findaInactivateDepto);
    router.post('/departamentos/create', departamentosController.createDepto);
    router.put('/departamentos/:id', departamentosController.updateDepto);
    router.delete('/departamentos/delete/:id', departamentosController.deleteDepto);

    // * RUTAS DE TIPOS PAGOS
    router.get('/tipospagos', tipoPagosController.find);
    router.get('tipopago/activas', tipoPagosController.findActivateTipoPago);
    router.get('/tipopago/inactivas', tipoPagosController.findaInactivateTipoPago);
    router.post('/tipopagos/create', tipoPagosController.createTipoPago);
    router.put('/tipopagos/:id', tipoPagosController.updateTipoPago);
    router.delete('/tipopago/delete/:id', tipoPagosController.deleteTiposPago);    
    
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
    router.delete('/stand/:id', standsController.deleteStand);

    // * RUTAS DE MUNICIPIOS
    router.get('/municipios', municipiosController.find);
    router.get('/municipios/activas', municipiosController.findActivateMunicipios);
    router.get('/municipios/inactivas', municipiosController.findInactiveMunicipios);
    router.post('/municipios/create', municipiosController.createMunicipio);
    router.put('/municipios/update/:id', municipiosController.updateMunicipio);
    router.delete('/municipios/:id', municipiosController.deleteMunicipio);

    // * DETALLE HORARIOS
    router.get('/detalle_horarios/activos', detalleHorariosController.find);
    router.get('/detalle_horarios', detalleHorariosController.find_all);
    router.get('/detalle_horarios/:id', detalleHorariosController.findById);
    router.post('/detalle_horarios', detalleHorariosController.create);
    router.put('/detalle_horarios/:id', detalleHorariosController.update);
    router.delete('/detalle_horarios/:id', detalleHorariosController.delete);

    // * FOTOS SEDES
    router.get('/fotos_sedes/activos', fotosSedesController.find);
    router.get('/fotos_sedes', fotosSedesController.find_all);
    router.get('/fotos_sedes/:id', fotosSedesController.findById);
    router.post('/fotos_sedes', fotosSedesController.create);
    router.put('/fotos_sedes/:id', fotosSedesController.update);
    router.delete('/fotos_sedes/:id', fotosSedesController.delete);
    
    app.use('/', router);

};