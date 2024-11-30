const { Router } = require('express');
const router = Router();
const authenticateToken = require('../middlewares/authenticateToken');

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
const categoriaBitacorasController = require('../controllers/categoriaBitacorasController');
const tipoTrasladosController = require('../controllers/tipoTrasladosController');
const trasladosController = require('../controllers/trasladosController');
const productosController = require('../controllers/productosController');
const rifasController = require('../controllers/rifasController');
const pedidosController = require('../controllers/pedidosController');
const municipiosController = require('../controllers/municipiosController');
const detalleHorariosController = require('../controllers/detalle_horariosController');
const tipoPublicoController =  require('../controllers/tipoPublicosController');
const fotosSedesController = require('../controllers/fotosSedesController');
const personasController = require('../controllers/personasController');
const categoriasController = require('../controllers/categoriaController');
const materialesController = require('../controllers/materialesController');
const comisionesController = require('../controllers/comisionesController');
const rolesController = require('../controllers/rolesController');
const talonariosController = require('../controllers/talonariosController');
const actividadesController = require('../controllers/actividadesController');
const voluntariosController = require('../controllers/voluntariosController');
const publicacionesController = require('../controllers/publicacionesController');
const publicacionGeneralController = require('../controllers/publicacionGeneralesController');
const publicacionEventoController = require('../controllers/publicacionEventosController');
const publicacionRifasController = require('../controllers/publicacionRifasController');
const permisosController = require('../controllers/permisosController');
const asignacionPermisosController = require('../controllers/asignacionPermisosController');
const modulosController = require('../controllers/modulosController');
const solicitudTalonariosController = require('../controllers/solicitudTalonariosController');
const inscripcionEventosController = require('../controllers/inscripcionEventosController');
const detalleStandsController = require('../controllers/detalleStandsController');
const asignacionStandsController = require('../controllers/asignacionStandsController');
const detalle_trasladosController = require('../controllers/detalle_trasladosController');

module.exports = (app) => {

    // * LOGIN AND LOGOUT
    router.post('/usuarios/login', usuariosController.login); // Ruta para iniciar sesión, no requiere autenticación
    router.post('/usuarios', usuariosController.create); // Ruta para crear un usuario, no requiere autenticación

    // ! Todas las rutas a continuación requieren autenticación
    //router.use(authenticateToken); // Middleware para proteger las rutas con autenticación


    // * USUARIOS
    router.get('/usuarios/activos', usuariosController.find);
    router.get('/usuarios', usuariosController.findAllUsers);
    router.get('/usuariosById/:id', usuariosController.findById);
    router.post('/usuarios', usuariosController.create);
    router.put('/usuarios/:id', usuariosController.update);
    router.put('/usuarios/:id/contrasenia', usuariosController.updatePassword);
    router.put('/usuarios/logout/:id', usuariosController.logout);
    router.delete('/usuarios/:id', usuariosController.delete);

    // * HORARIOS
    router.get('/horarios/activos', horariosController.find);
    router.get('/horarios', horariosController.findAll);
    router.get('/horarios/:id', horariosController.findById);
    router.post('/horarios', horariosController.create);
    router.put('/horarios/:id', horariosController.update);
    router.delete('/horarios/:id', horariosController.delete);

    // * TIPO STANDS
    router.get('/tipo_stands/activos', tipoStandsController.find);
    router.get('/tipo_stands', tipoStandsController.findAll);
    router.get('/tipo_stands/:id', tipoStandsController.findById);
    router.post('/tipo_stands', tipoStandsController.create);
    router.put('/tipo_stands/:id', tipoStandsController.update);
    router.delete('/tipo_stands/:id', tipoStandsController.delete);

    // * RUTAS DE SEDES
    router.get('/sedes', sedesController.findAll);
    router.get('/sedes/activas', sedesController.findActive);
    router.get('/sedes/inactivas', sedesController.findInactive);
    router.get('/sedes/:idSede', sedesController.findById);
    router.post('/sedes', sedesController.create);
    router.put('/sedes/:idSede', sedesController.update);
    router.delete('/sedes/:idSede', sedesController.delete);

    // * RUTAS DE EVENTOS
    router.get('/eventos', eventosController.findAll);
    router.get('/eventos/activas', eventosController.findActive);
    router.get('/eventos/inactivas', eventosController.findInactive);
    router.get('/eventos/:idEvento', eventosController.findById);
    router.post('/eventos', eventosController.create);
    router.put('/eventos/:idEvento', eventosController.update);
    router.get('/eventos/:nombreEvento', eventosController.findEvento);

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
    router.get('/tipopago/activas', tipoPagosController.findActivateTipoPago);
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
    router.post('/categoria_bitacoras/create', categoriaBitacorasController.create);
    router.put('/categoria_bitacoras/update/:id', categoriaBitacorasController.update);
    router.delete('/categoria_bitacoras/delete/:id', categoriaBitacorasController.delete);

    // * RUTAS DE CATEGORIA HORARIOS
    router.get('/categoriaHorarios', categoriaHorariosController.findAll);
    router.get('/categoriaHorarios/activas', categoriaHorariosController.findActive);
    router.get('/categoriaHorarios/inactivas', categoriaHorariosController.findInactive);
    router.get('/categoriaHorarios/:categoria', categoriaHorariosController.findCategoria);
    router.get('/categoriaHorarios/:id', categoriaHorariosController.findById);
    router.post('/categoriaHorarios', categoriaHorariosController.create);
    router.put('/categoriaHorarios/:id', categoriaHorariosController.update);
    router.delete('/categoriaHorarios/:idCategoriaHorario', categoriaHorariosController.delete);

     // * RUTAS DE CATEGORIAS
    router.get('/categorias', categoriasController.findAll);
    router.get('/categorias/activas', categoriasController.findActive);
    router.get('/categorias/inactivas', categoriasController.findInactive);
    router.get('/categorias/:nombreCategoria', categoriasController.findCategoria);
    router.get('/categorias/:id', categoriasController.findById);
    router.post('/categorias', categoriasController.create);
    router.put('/categorias/:id', categoriasController.update);
    router.delete('/categorias/:idCategoria', categoriasController.delete);


    // * RUTAS DE TIPO TRASLADOS
    router.get('/tipoTraslados', tipoTrasladosController.findAll);
    router.get('/tipoTraslados/activas', tipoTrasladosController.findActive);
    router.get('/tipoTraslados/inactivas', tipoTrasladosController.findInactive);
    router.get('/tipoTraslados/:idTipoTraslado', tipoTrasladosController.findById);
    router.get('/tipoTraslados/:tipo', tipoTrasladosController.findTipo);
    router.post('/tipoTraslados', tipoTrasladosController.create);
    router.put('/tipoTraslados/:id', tipoTrasladosController.update);
    router.delete('/tipoTraslados/:idTipoTraslado', tipoTrasladosController.delete);


    // * RUTAS DE TRASLADOS
    router.get('/traslados', trasladosController.findAll);
    router.get('/traslados/activas', trasladosController.findActive);
    router.get('/traslados/inactivas', trasladosController.findInactive);
    router.get('/traslados/:idTraslado', trasladosController.findById);
    router.get('/traslados/:descripcion', trasladosController.findTraslado);
    router.post('/traslados', trasladosController.create);
    router.put('/traslados/:id', trasladosController.update);


    // * PRODUCTOS
    router.get('/productos', productosController.find); 
    router.get('/productos/activos', productosController.findActive);
    router.get('/productos/inactivos', productosController.findInactive);
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
    router.get('/pedidos', pedidosController.findAll);
    router.get('/pedidos/:idPedido', pedidosController.findById);
    router.get('/pedidos/activas', pedidosController.findActive);
    router.get('/pedidos/inactivas', pedidosController.findInactive);
    router.get('/pedidos/:descripcion', pedidosController.findPedido);
    router.post('/pedidos', pedidosController.create);
    router.put('/pedidos/:id', pedidosController.update);
    router.delete('/pedidos/:idPedido', pedidosController.delete);

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
    router.get('/detalle_horarios', detalleHorariosController.findAll);
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

    // * RUTAS PARA PERSONAS
    router.get('/personas', personasController.find);
    router.get('/personas/activos', personasController.findActive);
    router.get('/personas/inactivos', personasController.findInactive);
    router.get('/personas/:id', personasController.findById);
    router.post('/personas/create', personasController.create);
    router.put('/personas/update/:id', personasController.update);
    router.delete('/personas/delete/:id', personasController.delete);

    // * RUTAS DE CATEGORIAS (productos)
    router.get('/categorias', categoriasController.findAll);
    router.get('/categorias/:idCategoria', categoriasController.findById);
    router.get('/categorias/activas', categoriasController.findActive);
    router.get('/categorias/inactivas', categoriasController.findInactive);
    router.get('/categorias/:nombreCategoria', categoriasController.findCategoria);
    router.post('/categorias', categoriasController.create);
    router.put('/categorias/:idCategoria', categoriasController.update);

    
    // * RUTAS DE COMISIONES
    router.get('/comisiones', comisionesController.find);
    router.get('/comisiones/activos', comisionesController.findActive); 
    router.get('/comisiones/inactivos', comisionesController.findInactive);
    router.get('/comisiones/:id', comisionesController.findById);
    router.post('/comisiones/create', comisionesController.create);
    router.put('/comisiones/update/:id', comisionesController.update); 
    router.delete('/comisiones/delete/:id', comisionesController.delete); 

    // * RUTAS DE MATERIALES
    router.get('/materiales/all', materialesController.find);
    router.get('/materiales/:id', materialesController.findById);
    router.get('/materialesByName', materialesController.findByName);
    router.post('/materiales', materialesController.create);
    router.put('/materiales/:id', materialesController.update);
    router.delete('/materiales/:id', materialesController.delete);
    
    // * RUTAS DE ROLES
    router.get('/roles', rolesController.find);
    router.get('/roles/activos', rolesController.findActivateRol); 
    router.get('/roles/inactivos', rolesController.findaInactivateRol);
    router.post('/roles/create', rolesController.createRol);
    router.put('/roles/update/:id', rolesController.updateRol); 
    router.delete('/roles/delete/:id', rolesController.deleteRol); 

    // * RUTAS DE TALONARIOS
    router.get('/talonarios', talonariosController.find);
    router.get('/talonarios/activos', talonariosController.findActivateTalo); 
    router.get('/talonarios/inactivos', talonariosController.findaInactivateTalo);
    router.post('/talonarios/create', talonariosController.createTalo);
    router.put('/talonarios/update/:id', talonariosController.updateTalo); 
    router.delete('/talonarios/delete/:id', talonariosController.deleteTalo); 

    // * RUTAS DE VOLUNTARIOS
    router.get('/voluntarios', voluntariosController.find);
    router.get('/voluntarios/activos', voluntariosController.findActivateVol); 
    router.get('/voluntarios/inactivos', voluntariosController.findaInactivateVol);
    router.post('/voluntarios/create', voluntariosController.createVol);
    router.put('/voluntarios/update/:id', voluntariosController.updateVol); 
    router.delete('/voluntarios/delete/:id', voluntariosController.deleteVol); 

    // * RUTAS DE ACTIVIDADES
    router.get('/actividades', actividadesController.find);
    router.get('/actividades/activos', actividadesController.findActive); 
    router.get('/actividades/inactivos', actividadesController.findInactive);
    router.get('/actividades/:id', actividadesController.findById);
    router.post('/actividades/create', actividadesController.create);
    router.put('/actividades/update/:id', actividadesController.update); 
    router.delete('/actividades/delete/:id', actividadesController.delete); 

    // * RUTAS DE PUBLICACIONES
    router.get('/publicaciones', publicacionesController.find);
    router.get('/publicaciones/activos', publicacionesController.findActive); 
    router.get('/publicaciones/inactivos', publicacionesController.findInactive);
    router.get('/publicaciones/:id', publicacionesController.findById);
    router.post('/publicaciones/create', publicacionesController.create);
    router.put('/publicaciones/update/:id', publicacionesController.update); 
    router.delete('/publicaciones/delete/:id', publicacionesController.delete);

    // * RUTAS DE PUBLICACIONES DE EVENTOS
    router.get('/publicacionesGeneral', publicacionGeneralController.find);
    router.get('/publicacionesGeneral/activos', publicacionGeneralController.findActive); 
    router.get('/publicacionesGeneral/inactivos', publicacionGeneralController.findInactive);
    router.get('/publicacionesGeneral/:id', publicacionGeneralController.findById);
    router.post('/publicacionesGeneral/create', publicacionGeneralController.create);
    router.put('/publicacionesGeneral/update/:id', publicacionGeneralController.update); 
    router.delete('/publicacionesGeneral/delete/:id', publicacionGeneralController.delete);

    // * RUTAS DE PUBLICACIONES DE EVENTOS
    router.get('/publicacionesEvento', publicacionEventoController.find);
    router.get('/publicacionesEvento/activos', publicacionEventoController.findActive); 
    router.get('/publicacionesEvento/inactivos', publicacionEventoController.findInactive);
    router.get('/publicacionesEvento/:id', publicacionEventoController.findById);
    router.post('/publicacionesEvento/create', publicacionEventoController.create);
    router.put('/publicacionesEvento/update/:id', publicacionEventoController.update); 
    router.delete('/publicacionesEvento/delete/:id', publicacionEventoController.delete);

    // * RUTAS DE PUBLICACIONES DE RIFAS
    router.get('/publicacionesRifas', publicacionRifasController.find);
    router.get('/publicacionesRifas/activos', publicacionRifasController.findActive); 
    router.get('/publicacionesRifas/inactivos', publicacionRifasController.findInactive);
    router.get('/publicacionesRifas/:id', publicacionRifasController.findById);
    router.post('/publicacionesRifas/create', publicacionRifasController.create);
    router.put('/publicacionesRifas/update/:id', publicacionRifasController.update); 
    router.delete('/publicacionesRifas/delete/:id', publicacionRifasController.delete);

    // * RUTAS DE ROLES
    router.get('/roles', rolesController.find);
    router.get('/roles/activos', rolesController.findActivateRol); 
    router.get('/roles/inactivos', rolesController.findaInactivateRol);
    router.post('/roles/create', rolesController.createRol);
    router.put('/roles/update/:id', rolesController.updateRol); 
    router.delete('/roles/delete/:id', rolesController.deleteRol); 

    // * RUTAS DE TALONARIOS
    router.get('/talonarios', talonariosController.find);
    router.get('/talonarios/activos', talonariosController.findActivateTalo); 
    router.get('/talonarios/inactivos', talonariosController.findaInactivateTalo);
    router.post('/talonarios/create', talonariosController.createTalo);
    router.put('/talonarios/update/:id', talonariosController.updateTalo); 
    router.delete('/talonarios/delete/:id', talonariosController.deleteTalo); 

    // * RUTAS DE VOLUNTARIOS
    router.get('/voluntarios', voluntariosController.find);
    router.get('/voluntarios/activos', voluntariosController.findActivateVol); 
    router.get('/voluntarios/inactivos', voluntariosController.findaInactivateVol);
    router.post('/voluntarios/create', voluntariosController.createVol);
    router.put('/voluntarios/update/:id', voluntariosController.updateVol); 
    router.delete('/voluntarios/delete/:id', voluntariosController.deleteVol); 

    // * RUTAS DE PERMISOS
    router.get('/permisos', permisosController.findAll); 
    router.get('/permisos/modulos/:idModulo', permisosController.findByModulo); 
    router.get('/permisos/:idPermiso', permisosController.findById); 
    router.post('/permisos/create', permisosController.create); 
    router.put('/permisos/update/:idPermiso', permisosController.update); 
    router.delete('/permisos/delete/:idPermiso', permisosController.delete); 

    // * RUTAS DE ASIGNACIÓN DE PERMISOS
    router.get('/asignacionPermisos', asignacionPermisosController.findAll); 
    router.get('/asignacionPermisos', asignacionPermisosController.findByRole); 
    router.post('/asignacionPermisos/create', asignacionPermisosController.create);
    router.post('/asignacionPermisos/update', asignacionPermisosController.updateBatch);
    router.put('/asignacionPermisos/update/:idAsignacion', asignacionPermisosController.update); 
    router.delete('/asignacionPermisos/delete/:idAsignacion', asignacionPermisosController.delete); 

      // * RUTAS DE MODULOS
    router.get('/modulos', modulosController.findAll);
    router.get('/modulos/:idModulo', modulosController.findById);
    router.get('/modulos/nombre/:nombreModulo', modulosController.findByName);
    router.post('/modulos', modulosController.create);
    router.put('/modulos/:idModulo', modulosController.update);
    router.delete('/modulos/:idModulo', modulosController.delete);

      // * RUTAS DE MODULOS
      router.get('/solicitudes', solicitudTalonariosController.getAll);
      router.get('/solicitudes/:id', solicitudTalonariosController.getById);
      router.get('/solicitudes/fecha/:fecha', solicitudTalonariosController.getByDate);
      router.get('/solicitudes/voluntario/:idVoluntario', solicitudTalonariosController.getByVoluntario);
      router.post('/solicitudes', solicitudTalonariosController.create);
      router.put('/solicitudes/:id', solicitudTalonariosController.update);
      router.delete('/solicitudes/:id', solicitudTalonariosController.delete);

    // * RUTAS DE INSCRIPCION A EVENTOS
    router.get('/inscripcion_eventos', inscripcionEventosController.find);
    router.get('/inscripcion_eventos/activos', inscripcionEventosController.findActive);
    router.get('/inscripcion_eventos/inactivos', inscripcionEventosController.findInactive);
    router.get('/inscripcion_eventos/:id', inscripcionEventosController.findById);
    router.post('/inscripcion_eventos/create', inscripcionEventosController.create); 
    router.put('/inscripcion_eventos/update/:id', inscripcionEventosController.update);
    router.delete('/inscripcion_eventos/delete/:id', inscripcionEventosController.delete); 

    // * RUTAS DE DETALLES DE STANDS
    router.get('/detalle_stands', detalleStandsController.find); 
    router.get('/detalle_stands/activos', detalleStandsController.findActive);
    router.get('/detalle_stands/inactivos', detalleStandsController.findInactive); 
    router.get('detalle_stands/:id', detalleStandsController.findById); 
    router.post('/detalle_stands/create', detalleStandsController.create);
    router.put('/detalle_stands/update/:id', detalleStandsController.update);
    router.delete('/detalle_stands/:id', detalleStandsController.delete); 

    // * RUTAS DE ASIGANCION DE STANDS
    router.get('/asignacion_stands', asignacionStandsController.find);
    router.get('/asignacion_stands/activos', asignacionStandsController.findActive);
    router.get('/asignacion_stands/inactivos', asignacionStandsController.findInactive);
    router.get('/asignacion_stands/:id', asignacionStandsController.findById);
    router.post('/asignacion_stands/create', asignacionStandsController.create);
    router.put('/asignacion_stands/update/:id', asignacionStandsController.update);
    router.delete('/asignacion_stands/delete/:id', asignacionStandsController.delete); 


    // * RUTAS DE DETALLE TRASLADOS
    router.get('/detalle_traslados', detalle_trasladosController.find);
    router.get('/detalle_traslados/:id', detalle_trasladosController.findById);
    router.post('/detalle_traslados/create', detalle_trasladosController.createDetalleTraslado);
    router.put('/detalle_traslados/update/:id', detalle_trasladosController.updateDetalleTraslado);
    router.delete('/detalle_traslados/delete/:id', detalle_trasladosController.deleteDetalleTraslado);

    app.use('/', router);

};