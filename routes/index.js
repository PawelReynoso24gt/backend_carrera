const { Router } = require('express');
const router = Router();
const { checkPermissions } = require('../middlewares/permissionToken');
const authenticateToken = require('../middlewares/authenticateToken');
const upload = require('../middlewares/multerConfig'); // para las fotos

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
const actividadesController = require('../controllers/actividadesController');
const publicacionesController = require('../controllers/publicacionesController');
const publicacionGeneralController = require('../controllers/publicacionGeneralesController');
const publicacionEventoController = require('../controllers/publicacionEventosController');
const publicacionRifasController = require('../controllers/publicacionRifasController');
const talonariosController = require('../controllers/talonariosController');
const voluntariosController = require('../controllers/voluntariosController');
const permisosController = require('../controllers/permisosController');
const asignacionPermisosController = require('../controllers/asignacionPermisosController');
const modulosController = require('../controllers/modulosController');
const solicitudTalonariosController = require('../controllers/solicitudTalonariosController');
const inscripcionEventosController = require('../controllers/inscripcionEventosController');
const inscripcionComisionController = require('../controllers/inscripcionComisionesController');
const detalleStandsController = require('../controllers/detalleStandsController');
const asignacionStandsController = require('../controllers/asignacionStandsController');
const detalle_trasladosController = require('../controllers/detalle_trasladosController');
const detalle_pedidosController = require('../controllers/detalle_pedidosController');
const detalle_productosController = require('../controllers/detalle_productosController');
const detalleInscripcionActividadesController = require('../controllers/detalleInscripcionActividadesController');
const detalleInscripcionMaterialesController = require('../controllers/detalleInscripcionMaterialesController');
const empleadosController = require('../controllers/empleadosController');
const asistenciaEventosController = require('../controllers/asistenciaEventosController');
const recaudacionRifasController = require('../controllers/recaudacionRifasController');
const ventasController = require('../controllers/ventasController');
const detallePagoRifasController = require('../controllers/detallePagoRifasController');
const aspirantesController = require('../controllers/aspirantesController');
const recaudacion_eventosController = require('../controllers/recaudacion_eventosController');
const bitacorasController = require('../controllers/bitacorasController');
const detalle_ventas_standsController = require('../controllers/detalle_ventas_standsController');
const detalle_ventas_voluntariosController = require('../controllers/detalle_ventas_voluntariosController');
const detalle_pago_ventas_standsController = require('../controllers/detalle_pago_ventas_standsController');
const detalle_productos_voluntariosController = require('../controllers/detalle_productos_voluntariosController');
const detalle_pago_ventas_voluntariosController = require('../controllers/detalle_pago_ventas_voluntariosController');
const notificacionesController = require('../controllers/notificacionesController');
const tipoNotificacionesController = require('../controllers/tipoNotificacionController');
const tipo_situacionesController = require('../controllers/tipo_situacionesController');
const situacionesController = require('../controllers/situacionesController');
const reportesController = require('../controllers/reportesController');
const obtenerPermisosController = require('../controllers/obtenerPermisosController');
const voluntarioDelMesController = require('../controllers/voluntarioDelMes');
const trasladosCompletosController = require('../controllers/TrasladosCompletosController');

module.exports = (app) => {

    // * LOGIN AND LOGOUT
    router.post('/usuarios/login', usuariosController.login); // Ruta para iniciar sesión, no requiere autenticación

        // * QR (lo puse aqui porque no me dejaba usarlo a pesar de tener el token)
        router.get('/generateQR', checkPermissions('Generar QR'), voluntariosController.generateQR);

      // * RUTAS DE MUNICIPIOS Y DEPARTAMENTOS PARA REGISTRO ASPIRANTES
      router.get('/municipios', municipiosController.find);
      router.get('/departamentos', departamentosController.find);
      router.get('/aspirantes', aspirantesController.findAll);  
      router.post('/aspirantes', aspirantesController.create);
      router.post('/personas/create', personasController.create);

    // ! Todas las rutas a continuación requieren autenticación
    // router.use(authenticateToken); // Middleware para proteger las rutas con autenticación

    // * USUARIOS
    router.get('/usuarios/activos', checkPermissions('Ver usuarios'), usuariosController.find);
    router.get('/usuarios/me', usuariosController.getLoggedUser);
    router.get('/usuarios', checkPermissions('Ver usuarios'), usuariosController.findAllUsers);
    router.get('/usuariosById/:id', usuariosController.findById);
    router.get('/usuarios/verify/:idUsuario?', usuariosController.verifyChangedPassword);
    router.post('/usuarios', usuariosController.create);
    router.post("/renew", usuariosController.renewToken);
    router.put('/usuarios/:id', usuariosController.update);
    router.put('/usuarios/:id/contrasenia', usuariosController.updatePassword);
    router.put('/usuarios/:id/reset', usuariosController.resetPassword);
    router.put('/usuarios/logout/:id', usuariosController.logout);
    router.delete('/usuarios/:id', usuariosController.delete);

    // * HORARIOS
    router.get('/horarios/activos', checkPermissions('Ver horarios'), horariosController.find);
    router.get('/horarios', checkPermissions('Ver horarios'), horariosController.findAll);
    router.get('/horarios/:id', horariosController.findById);
    router.post('/horarios', horariosController.create);
    router.put('/horarios/:id', horariosController.update);
    router.delete('/horarios/:id', horariosController.delete);

    // * TIPO STANDS
    router.get('/tipo_stands/activos', checkPermissions('Ver tipo stands'),  tipoStandsController.find);
    router.get('/tipo_stands', checkPermissions('Ver tipo stands'), tipoStandsController.findAll);
    router.get('/tipo_stands/:id', tipoStandsController.findById);
    router.post('/tipo_stands', tipoStandsController.create);
    router.put('/tipo_stands/:id', tipoStandsController.update);
    router.delete('/tipo_stands/:id', tipoStandsController.delete);


     // * RUTAS DE MUNICIPIOS
      router.get('/municipios/activas', municipiosController.findActivateMunicipios);
      router.get('/municipios/inactivas', municipiosController.findInactiveMunicipios);
      router.post('/municipios/create', municipiosController.createMunicipio);
      router.put('/municipios/update/:id', municipiosController.updateMunicipio);
      router.delete('/municipios/:id', municipiosController.deleteMunicipio);

      // * RUTAS DE DEPARTAMENTOS
      router.get('/departamentos/activas', departamentosController.findActivateDepto);
      router.get('/departamentos/inactivas', departamentosController.findaInactivateDepto);
      router.post('/departamentos/create', departamentosController.createDepto);
      router.put('/departamentos/:id', departamentosController.updateDepto);
      router.delete('/departamentos/delete/:id', departamentosController.deleteDepto);
    // * RUTAS DE SEDES
    router.get('/sedes', checkPermissions('Ver sedes'), sedesController.findAll);
    router.get('/sedes/activas', checkPermissions('Ver sedes'), sedesController.findActive);
    router.get('/sedes/inactivas', checkPermissions('Ver sedes'), sedesController.findInactive);
    router.get('/sedes/:idSede', sedesController.findById);
    router.post('/sedes', sedesController.create);
    router.put('/sedes/:idSede', sedesController.update);
    router.delete('/sedes/:idSede', sedesController.delete);

    // * RUTAS DE EVENTOS
    router.get('/eventos', checkPermissions('Ver eventos'), eventosController.findAll);
    router.get('/eventos/reporte', checkPermissions('Generar reporte eventos'), eventosController.obtenerReporteEventos);
    router.get('/eventos/activas', checkPermissions('Ver eventos'), eventosController.findActive);
    router.get('/eventos/inactivas', checkPermissions('Ver eventos'), eventosController.findInactive);
    router.get('/eventos/activo', eventosController.findActiveById);
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
    router.get('/departamentos', checkPermissions('Ver departamentos'), departamentosController.find);
    router.get('/departamentos/activas', checkPermissions('Ver departamentos'), departamentosController.findActivateDepto);
    router.get('/departamentos/inactivas', checkPermissions('Ver departamentos'), departamentosController.findaInactivateDepto);
    router.post('/departamentos/create', departamentosController.createDepto);
    router.put('/departamentos/:id', departamentosController.updateDepto);
    router.delete('/departamentos/delete/:id', departamentosController.deleteDepto);

    // * RUTAS DE TIPOS PAGOS
    router.get('/tipospagos', checkPermissions('Ver tipo pagos'), tipoPagosController.find);
    router.get('/tipopago/activas', checkPermissions('Ver tipo pagos'), tipoPagosController.findActivateTipoPago);
    router.get('/tipopago/inactivas', checkPermissions('Ver tipo pagos'), tipoPagosController.findaInactivateTipoPago);
    router.post('/tipopagos/create', tipoPagosController.createTipoPago);
    router.put('/tipopagos/:id', tipoPagosController.updateTipoPago);
    router.delete('/tipopago/delete/:id', tipoPagosController.deleteTiposPago);    
    
    // * RUTAS TIPO PUBLICO
    router.get('/tipo_publicos', checkPermissions('Ver tipo publicos'), tipoPublicoController.find);
    router.get('/tipo_publicos/activos', checkPermissions('Ver tipo publicos'), tipoPublicoController.findActive);
    router.get('/tipo_publicos/inactivos', checkPermissions('Ver tipo publicos'), tipoPublicoController.findInactive);
    router.get('/tipo_publicos/:id', tipoPublicoController.findById);
    router.post('/tipo_publicos/create', tipoPublicoController.create);
    router.put('/tipo_publicos/update/:id', tipoPublicoController.update);
    router.delete('/tipo_publicos/delete/:id', tipoPublicoController.delete);

    // * RUTAS PARA CATEGORÍA DE BITÁCORAS
    router.get('/categoria_bitacoras', checkPermissions('Ver categoria bitacoras'), categoriaBitacorasController.find);
    router.get('/categoria_bitacoras/:id', categoriaBitacorasController.findById);
    router.post('/categoria_bitacoras/create', categoriaBitacorasController.create);
    router.put('/categoria_bitacoras/update/:id', categoriaBitacorasController.update);
    router.delete('/categoria_bitacoras/delete/:id', categoriaBitacorasController.delete);

    // * RUTAS DE CATEGORIA HORARIOS
    router.get('/categoriaHorarios', checkPermissions('Ver categoria horarios'), categoriaHorariosController.findAll);
    router.get('/categoriaHorarios/activas', checkPermissions('Ver categoria horarios'), categoriaHorariosController.findActive);
    router.get('/categoriaHorarios/inactivas', checkPermissions('Ver categoria horarios'), categoriaHorariosController.findInactive);
    router.get('/categoriaHorarios/:categoria', categoriaHorariosController.findCategoria);
    router.get('/categoriaHorarios/:id', categoriaHorariosController.findById);
    router.post('/categoriaHorarios', categoriaHorariosController.create);
    router.put('/categoriaHorarios/:id', categoriaHorariosController.update);
    router.delete('/categoriaHorarios/:idCategoriaHorario', categoriaHorariosController.delete);

     // * RUTAS DE CATEGORIAS
    router.get('/categorias', checkPermissions('Ver categorias'), categoriasController.findAll);
    router.get('/categorias/activas', checkPermissions('Ver categorias'), categoriasController.findActive);
    router.get('/categorias/inactivas', checkPermissions('Ver categorias'), categoriasController.findInactive);
    router.get('/categorias/:nombreCategoria', categoriasController.findCategoria);
    router.get('/categorias/:id', categoriasController.findById);
    router.post('/categorias', categoriasController.create);
    router.put('/categorias/:id', categoriasController.update);
    router.delete('/categorias/:idCategoria', categoriasController.delete);

    // * RUTAS DE TIPO TRASLADOS
    router.get('/tipoTraslados', checkPermissions('Ver tipo traslados'), tipoTrasladosController.findAll);
    router.get('/tipoTraslados/activas', checkPermissions('Ver tipo traslados'), tipoTrasladosController.findActive);
    router.get('/tipoTraslados/inactivas', checkPermissions('Ver tipo traslados'), tipoTrasladosController.findInactive);
    router.get('/tipoTraslados/:idTipoTraslado', tipoTrasladosController.findById);
    router.get('/tipoTraslados/:tipo', tipoTrasladosController.findTipo);
    router.post('/tipoTraslados', tipoTrasladosController.create);
    router.put('/tipoTraslados/:id', tipoTrasladosController.update);
    router.delete('/tipoTraslados/:idTipoTraslado', tipoTrasladosController.delete);

    // * RUTAS DE TRASLADOS
    router.get('/traslados', checkPermissions('Ver traslados'), trasladosController.findAll);
    router.get('/traslados/activas', checkPermissions('Ver traslados'), trasladosController.findActive);
    router.get('/traslados/inactivas', checkPermissions('Ver traslados'), trasladosController.findInactive);
    router.get('/traslados/:idTraslado', trasladosController.findById);
    router.get('/traslados/:descripcion', trasladosController.findTraslado);
    router.post('/traslados', trasladosController.create);
    router.put('/traslados/:id', trasladosController.update);

    // * PRODUCTOS
    router.get('/productos', checkPermissions('Ver productos'), productosController.find); 
    router.get('/productos/activos', checkPermissions('Ver productos'), productosController.findActive);
    router.get('/productos/inactivos', checkPermissions('Ver productos'), productosController.findInactive);
    router.get('/productos/:id', productosController.findById); 
    router.post('/productos', productosController.create); 
    router.put('/productos/:id', productosController.update);
    router.delete('/productos/:id', productosController.delete); 

    // * RIFAS
    router.get('/rifas', checkPermissions('Ver rifas'), rifasController.find);
    router.get('/rifas/activos', checkPermissions('Ver rifas'), rifasController.findActive);
    router.get('/rifas/inactivos', checkPermissions('Ver rifas'), rifasController.findInactive);
    router.get('/rifas/talonarios/:idRifa', rifasController.findTalonariosVoluntarios);
    router.get('/rifas/:id', rifasController.findById);
    router.post('/rifas', rifasController.create);
    router.put('/rifas/:id', rifasController.update);
    router.delete('/rifas/:id', rifasController.delete);
    
    // * RUTAS DE PEDIDOS
    router.get('/pedidos', checkPermissions('Ver pedidos'), pedidosController.findAll);
    router.get('/pedidos/activas', checkPermissions('Ver pedidos'), pedidosController.findActive);
    router.get('/pedidos/inactivas', checkPermissions('Ver pedidos'), pedidosController.findInactive);
    router.get('/pedidos/:idPedido', pedidosController.findById);
    router.get('/pedidos/:descripcion', pedidosController.findPedido);
    router.post('/pedidos', pedidosController.create);
    router.put('/pedidos/:id', pedidosController.update);
    router.delete('/pedidos/:idPedido', pedidosController.delete);


    // * RUTAS DE STAND
    router.get('/stand', checkPermissions('Ver stands'), standsController.find);
    router.get('/stand/activas', checkPermissions('Ver stands'), standsController.findActivateStand);
    router.get('/stand/inactivas', checkPermissions('Ver stands'), standsController.findaInactivateStand);
    router.get('/stands/virtual/products', checkPermissions('Ver stand virtual'), standsController.findVirtualStandProducts);
    router.get('/stands/detalles', standsController.findStandDetalles);
    router.get('/stands/voluntarios/:idStand', standsController.getVoluntariosEnStands);
    router.post('/stand/create', standsController.createStand);
    router.put('/stand/update/:id', standsController.updateStand);
    router.delete('/stand/:id', standsController.deleteStand);
    
    // * RUTAS DE MUNICIPIOS
    router.get('/municipios', checkPermissions('Ver municipios'),  municipiosController.find);
    router.get('/municipios/activas', checkPermissions('Ver municipios'),  municipiosController.findActivateMunicipios);
    router.get('/municipios/inactivas', checkPermissions('Ver municipios'),  municipiosController.findInactiveMunicipios);
    router.post('/municipios/create',  municipiosController.createMunicipio);
    router.put('/municipios/update/:id', municipiosController.updateMunicipio);
    router.delete('/municipios/:id', municipiosController.deleteMunicipio);

    // * DETALLE HORARIOS
    router.get('/detalle_horarios', checkPermissions('Ver detalle horario'), detalleHorariosController.findAll);
    router.get('/detalle_horarios/comisiones', detalleHorariosController.findByCategoriaComisiones);
    router.get('/detalle_horarios/activos', checkPermissions('Ver detalle horario'), detalleHorariosController.findActive);
    router.get('/detalle_horarios/inactivos', checkPermissions('Ver detalle horario'), detalleHorariosController.findInactive);
    router.get('/detalle_horarios/:id', detalleHorariosController.findById);
    router.post('/detalle_horarios',  detalleHorariosController.create);
    router.put('/detalle_horarios/:id',  detalleHorariosController.update);
    router.delete('/detalle_horarios/:id', detalleHorariosController.delete);

    // * FOTOS SEDES
    router.get('/fotos_sedes/activos', checkPermissions('Ver fotos sedes'), fotosSedesController.find);
    router.get('/fotos_sedes', checkPermissions('Ver fotos sedes'), fotosSedesController.find_all);
    router.get('/fotos_sedes/:id', fotosSedesController.findById);
    router.post('/fotos_sedes', fotosSedesController.create);
    router.put('/fotos_sedes/:id', fotosSedesController.update);
    router.delete('/fotos_sedes/:id', fotosSedesController.delete);

    // * RUTAS PARA PERSONAS
    router.get('/personas', checkPermissions('Ver personas'), personasController.find);
    router.get('/personas/activos', checkPermissions('Ver personas activas'), personasController.findActive);
    router.get('/personas/inactivos', checkPermissions('Ver personas inactivas'), personasController.findInactive);
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
    router.get('/comisiones', checkPermissions('Ver comisiones'), comisionesController.find);
    router.get('/comisiones/porevento', comisionesController.findByEvento);
    router.get('/comisiones/activos', checkPermissions('Ver comisiones'), comisionesController.findActive); 
    router.get('/comisiones/inactivos', checkPermissions('Ver comisiones'), comisionesController.findInactive);
    router.get('/comisiones/active', comisionesController.findActiveComiById);
    router.get('/comisiones/:id', comisionesController.findById);
    router.post('/comisiones/create', comisionesController.create);
    router.put('/comisiones/update/:id', comisionesController.update); 
    router.delete('/comisiones/delete/:id', comisionesController.delete); 

    // * RUTAS DE MATERIALES
    router.get('/materiales/all', checkPermissions('Ver materiales'), materialesController.find);
    router.get('/materiales/:id', materialesController.findById);
    router.get('/materialesByName', materialesController.findByName);
    router.post('/materiales', materialesController.create);
    router.put('/materiales/:id', materialesController.update);
    router.delete('/materiales/:id', materialesController.delete);
    
    // * RUTAS DE ROLES
    router.get('/roles', checkPermissions('Ver roles'), rolesController.find);
    router.get('/roles/activos', checkPermissions('Ver roles'), rolesController.findActivateRol); 
    router.get('/roles/inactivos', checkPermissions('Ver roles'), rolesController.findaInactivateRol);
    router.post('/roles/create', rolesController.createRol);
    router.put('/roles/update/:id', rolesController.updateRol); 
    router.delete('/roles/delete/:id', rolesController.deleteRol); 

    // * RUTAS DE TALONARIOS
    router.get('/talonarios', checkPermissions('Ver talonarios'), talonariosController.find);
    router.get('/talonarios/activos', checkPermissions('Ver talonarios'), talonariosController.findActivateTalo); 
    router.get('/talonarios/inactivos', checkPermissions('Ver talonarios'), talonariosController.findaInactivateTalo);
    router.post('/talonarios/create', talonariosController.createTalo);
    router.put('/talonarios/update/:id', talonariosController.updateTalo); 
    router.delete('/talonarios/delete/:id', talonariosController.deleteTalo); 

    // * RUTAS DE VOLUNTARIOS
    router.get('/voluntarios', checkPermissions('Ver voluntarios'), voluntariosController.find);
    router.get('/voluntarios/conProductos', voluntariosController.findWithAssignedProducts);
    router.get('/voluntarios/activos', checkPermissions('Ver voluntarios'), voluntariosController.findActivateVol); 
    router.get('/voluntarios/inactivos', checkPermissions('Ver voluntarios'), voluntariosController.findaInactivateVol);
    router.get('/voluntarios/:id', voluntariosController.findById);
    router.post('/voluntarios/create', voluntariosController.createVol);
    router.put('/voluntarios/update/:id', voluntariosController.updateVol); 
    router.delete('/voluntarios/delete/:id', voluntariosController.deleteVol);

    // * RUTAS DE ACTIVIDADES
    router.get('/actividades', checkPermissions('Ver actividades'), actividadesController.find);
    router.get('/actividades/activos', checkPermissions('Ver actividades'), actividadesController.findActive); 
    router.get('/actividades/inactivos', checkPermissions('Ver actividades'), actividadesController.findInactive);
    router.get('/actividades/:id', actividadesController.findById);
    router.post('/actividades/create', actividadesController.create);
    router.put('/actividades/update/:id', actividadesController.update); 
    router.delete('/actividades/delete/:id', actividadesController.delete); 

    // * RUTAS DE PUBLICACIONES
    router.get('/publicaciones', checkPermissions('Ver publicaciones'), publicacionesController.find);
    router.get('/publicaciones/completas', checkPermissions('Ver publicaciones'), publicacionesController.findCompleto);
    router.get('/publicaciones/activos', checkPermissions('Ver publicaciones'), publicacionesController.findActive); 
    router.get('/publicaciones/inactivos', checkPermissions('Ver publicaciones'), publicacionesController.findInactive);
    router.get('/publicaciones/detalles/:id', publicacionesController.getPublicacionDetalles);
    router.get('/publicaciones/:id', publicacionesController.findById);
    router.post('/publicaciones/create', publicacionesController.create);
    router.post('/publicaciones/completa/create', upload.array('fotos', 30), publicacionesController.createCompleto);
    router.put('/publicaciones/update/:id', publicacionesController.update);
    router.put('/publicaciones/completa/update/:id', upload.array('fotos', 30), publicacionesController.updateCompleto); 
    router.delete('/publicaciones/delete/:id', publicacionesController.delete);

    // * RUTAS DE PUBLICACIONES DE EVENTOS
    router.get('/publicacionesGeneral', checkPermissions('Ver publicaciones'), publicacionGeneralController.find);
    router.get('/publicacionesGeneral/activos', checkPermissions('Ver publicaciones'), publicacionGeneralController.findActive); 
    router.get('/publicacionesGeneral/inactivos', checkPermissions('Ver publicaciones'), publicacionGeneralController.findInactive);
    router.get('/publicacionesGeneral/:id', publicacionGeneralController.findById);
    router.post('/publicacionesGeneral/create', publicacionGeneralController.create);
    router.put('/publicacionesGeneral/update/:id', publicacionGeneralController.update); 
    router.delete('/publicacionesGeneral/delete/:id', publicacionGeneralController.delete);

    // * RUTAS DE PUBLICACIONES DE EVENTOS
    router.get('/publicacionesEvento', checkPermissions('Ver publicaciones'), publicacionEventoController.find);
    router.get('/publicacionesEvento/activos', checkPermissions('Ver publicaciones'), publicacionEventoController.findActive); 
    router.get('/publicacionesEvento/inactivos', checkPermissions('Ver publicaciones'), publicacionEventoController.findInactive);
    router.get('/publicacionesEvento/:id', publicacionEventoController.findById);
    router.post('/publicacionesEvento/create', publicacionEventoController.create);
    router.put('/publicacionesEvento/update/:id', publicacionEventoController.update); 
    router.delete('/publicacionesEvento/delete/:id', publicacionEventoController.delete);

    // * RUTAS DE PUBLICACIONES DE RIFAS
    router.get('/publicacionesRifas', checkPermissions('Ver publicaciones'), publicacionRifasController.find);
    router.get('/publicacionesRifas/activos', checkPermissions('Ver publicaciones'), publicacionRifasController.findActive); 
    router.get('/publicacionesRifas/inactivos', checkPermissions('Ver publicaciones'), publicacionRifasController.findInactive);
    router.get('/publicacionesRifas/:id', publicacionRifasController.findById);
    router.post('/publicacionesRifas/create', publicacionRifasController.create);
    router.put('/publicacionesRifas/update/:id', publicacionRifasController.update); 
    router.delete('/publicacionesRifas/delete/:id', publicacionRifasController.delete);

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
    router.get('/asignacionPermisos',  asignacionPermisosController.findByRole); 
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
      router.get('/solicitudes', checkPermissions('Ver solicitudes de talonarios'), solicitudTalonariosController.getAll);
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
    router.get( "/inscripciones/voluntario/:idVoluntario", inscripcionEventosController.obtenerInscripcionesPorVoluntario);
    router.post('/inscripcion_eventos/create', inscripcionEventosController.create); 
    router.put('/inscripcion_eventos/update/:id', inscripcionEventosController.update);
    router.delete('/inscripcion_eventos/delete/:id', inscripcionEventosController.delete); 

    // * RUTAS DE INSCRIPCION A COMISIONES
    router.get('/inscripcion_comisiones', checkPermissions('Ver inscripciones a comisiones'), inscripcionComisionController.find);
    router.get('/inscripcion_comisiones/activos', checkPermissions('Ver inscripciones a comisiones'), inscripcionComisionController.findActive);
    router.get('/inscripcion_comisiones/inactivos', checkPermissions('Ver inscripciones a comisiones'), inscripcionComisionController.findInactive);
    router.get('/inscripcion_comisiones/:id', inscripcionComisionController.findById);
    router.post('/inscripcion_comisiones/create', inscripcionComisionController.create);
    router.put('/inscripcion_comisiones/update/:id', inscripcionComisionController.update);
    router.delete('/inscripcion_comisiones/delete/:id', inscripcionComisionController.delete);

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
    router.get('/asignacion_stands/voluntarios_por_stand', checkPermissions('Ver asignación de stands'), asignacionStandsController.findVoluntariosByStand);
    router.get('/asignacion_stands/voluntarios_por_stand/activos', checkPermissions('Ver asignación de stands'), asignacionStandsController.findVoluntariosByActiveStands);
    router.get('/asignacion_stands/voluntarios_por_stand/inactivos', checkPermissions('Ver asignación de stands'), asignacionStandsController.findVoluntariosByInactiveStands);
    router.get('/asignacion_stands/activos', asignacionStandsController.findActive);
    router.get('/asignacion_stands/inactivos', asignacionStandsController.findInactive);
    router.get('/asignacion_stands/:id', asignacionStandsController.findById);
    router.post('/asignacion_stands/create', asignacionStandsController.create);
    router.put('/asignacion_stands/update/:id', asignacionStandsController.update);
    router.delete('/asignacion_stands/delete/:id', asignacionStandsController.delete); 

    // * RUTAS DE DETALLE TRASLADOS
    router.get('/detalle_traslados', checkPermissions('Ver detalles de traslados'), detalle_trasladosController.find);
    router.get('/detalle_traslados/:id', detalle_trasladosController.findById);
    router.post('/detalle_traslados/create', detalle_trasladosController.createDetalleTraslado);
    router.put('/detalle_traslados/update/:id', detalle_trasladosController.updateDetalleTraslado);
    router.delete('/detalle_traslados/delete/:id', detalle_trasladosController.deleteDetalleTraslado);

    // * RUTAS DETALLE PEDIDOS
    router.get('/detalle_pedido', detalle_pedidosController.find);
    router.get('/detalle_pedido/:id', detalle_pedidosController.getPedidoConDetalle);
    //router.get('/detalle_pedido/:id', detalle_pedidosController.findById);
    router.post('/detalle_pedido/create', detalle_pedidosController.createDetallePedido);
    router.post('/pedidosCompletos', detalle_pedidosController.createPedidoConDetalle);
    router.put('/pedidosCompletos/:id', detalle_pedidosController.updatePedidoConDetalle);
    router.put('/detalle_pedido/update/:id', detalle_pedidosController.updateDetallePedido);
    router.delete('/detalle_pedido/delete/:id', detalle_pedidosController.deleteDetallePedido);
    

    // * RUTAS DETALLE PRODUCTOS
    router.get('/detalle_productos', checkPermissions('Ver detalles de productos'), detalle_productosController.find);
    router.get('/detalle_productos/:id', detalle_productosController.findById);
    router.post('/detalle_productos/create',  detalle_productosController.createDetalleProducto);
    router.put('/detalle_productos/update/:id',  detalle_productosController.updateDetalleProducto);
    router.delete('/detalle_productos/delete/:id', detalle_productosController.deleteDetalleProducto);
    
    // * RuUTAS DE DETALLE DE INSCRIPCION DE ACTIVIDADES
    router.get('/detalle_inscripcion_actividades', checkPermissions('Ver detalles de inscripciones a actividades'), detalleInscripcionActividadesController.find);
    router.get('/detalle_inscripcion_actividades/activos', checkPermissions('Ver detalles de inscripciones a actividades'), detalleInscripcionActividadesController.findActive);
    router.get('/detalle_inscripcion_actividades/inactivos', checkPermissions('Ver detalles de inscripciones a actividades'), detalleInscripcionActividadesController.findInactive);
    router.get('/detalle_inscripcion_actividades/:id', detalleInscripcionActividadesController.findById);
    router.post('/detalle_inscripcion_actividades/create', detalleInscripcionActividadesController.create);
    router.put('/detalle_inscripcion_actividades/update/:id', detalleInscripcionActividadesController.update);
    router.delete('/detalle_inscripcion_actividades/delete/:id', detalleInscripcionActividadesController.delete);

    // * RUTAS DE DETALLE DE INSCRIPCION DE MATERIALES
    router.get('/detalle_inscripcion_materiales', checkPermissions('Ver detalles de inscripciones a materiales'), detalleInscripcionMaterialesController.find);
    router.get('/detalle_inscripcion_materiales/activos', checkPermissions('Ver detalles de inscripciones a materiales'), detalleInscripcionMaterialesController.findActive);
    router.get('/detalle_inscripcion_materiales/inactivos', checkPermissions('Ver detalles de inscripciones a materiales'), detalleInscripcionMaterialesController.findInactive);
    router.get('/detalle_inscripcion_materiales/:id', detalleInscripcionMaterialesController.findById);
    router.post('/detalle_inscripcion_materiales/create',  detalleInscripcionMaterialesController.create);
    router.put('/detalle_inscripcion_materiales/update/:id', detalleInscripcionMaterialesController.update);
    router.delete('/detalle_inscripcion_materiales/delete/:id', detalleInscripcionMaterialesController.delete);

    // * RUTAS DE EMPLEADO
    router.get('/empleados', checkPermissions('Ver empleados'), empleadosController.find);
    router.get('/empleados/activos', checkPermissions('Ver empleados activos'), empleadosController.findActive);
    router.get('/empleados/inactivos', checkPermissions('Ver empleados inactivos'), empleadosController.findInactive);
    router.get('/empleados/:id', empleadosController.findById);
    router.post('/empleados/create',  empleadosController.create);
    router.put('/empleados/update/:id',  empleadosController.update);
    router.delete('/empleados/delete/:id',  empleadosController.delete);

    // * RUTAS DE ASISTENCIA A EVENTOS
    router.get('/asistencia_eventos', checkPermissions('Ver asistencia a eventos'), asistenciaEventosController.find); 
    router.get('/asistencia_eventos/activos', checkPermissions('Ver asistencia a eventos'), asistenciaEventosController.findActive); 
    router.get('/asistencia_eventos/inactivos', checkPermissions('Ver asistencia a eventos'), asistenciaEventosController.findInactive); 
    router.get('/asistencia_eventos/:id', asistenciaEventosController.findById); 
    router.post('/asistencia_eventos/create', asistenciaEventosController.create); 
    router.put('/asistencia_eventos/update/:id', asistenciaEventosController.update);
    router.delete('/asistencia_eventos/delete/:id', asistenciaEventosController.delete);

    //* RUTAS DE RECAUDACION DE RIFAS
    router.get('/recaudaciones', checkPermissions('Ver recaudación de rifas'), recaudacionRifasController.findAll);
    router.get('/recaudaciones/activas', checkPermissions('Ver recaudación de rifas'), recaudacionRifasController.findActive);
    router.get('/recaudaciones/inactivas', checkPermissions('Ver recaudación de rifas'), recaudacionRifasController.findInactive);
    router.get('/recaudaciones/fecha/:fecha', recaudacionRifasController.getByDate);
    router.get('/recaudaciones/detalle/:idRecaudacionRifa', recaudacionRifasController.getRecaudacionCompleta);
    router.get('/recaudaciones/todas', recaudacionRifasController.getTodasRecaudaciones)
    router.get('/recaudaciones/todas/inactivas', recaudacionRifasController.getTodasRecaudacionesInactive);
    router.post('/recaudaciones',  recaudacionRifasController.create);
    router.post('/recaudaciones/rifa/completa', recaudacionRifasController.createRecaudacionRifa);
    router.put('/recaudaciones/:idRecaudacionRifa',  recaudacionRifasController.update);
    router.delete('/recaudaciones/:idRecaudacionRifa', recaudacionRifasController.delete);

    // * RUTAS DE VENTAS
    router.get('/ventas', ventasController.findAll);
    router.get('/ventas/voluntarios', checkPermissions('Ver ventas voluntarios'), ventasController.findAllVoluntarios);
    router.get('/ventas/stands', checkPermissions('Ver ventas stands'), ventasController.findAllVentasStands);
    router.get('/ventas/activas', ventasController.findActive);
    router.get('/ventas/voluntarios/activas', ventasController.findActiveVoluntarios);
    router.get('/ventas/stands/activas', ventasController.findActiveVentasStands);
    router.get('/ventas/inactivas', ventasController.findInactive);
    router.get('/ventas/voluntarios/inactivas', ventasController.findInactiveVoluntarios);
    router.get('/ventas/stands/inactivas', ventasController.findInactiveVentasStands);
    router.get('/detalle_ventas_voluntarios/ventaCompleta/:idVenta', ventasController.findByVentaId);
    router.get('/detalle_ventas_stands/ventaCompleta/:idVenta', ventasController.findByVentaIdStand);
    router.get('/ventas/:id', ventasController.findById);
    router.post('/ventas/create', ventasController.create);
    router.post('/ventas/create/completa', ventasController.createFullVenta);
    router.post('/ventas/create/stands/completa', ventasController.createFullVentaStand);
    router.put('/ventas/update/:id', ventasController.update);
    router.put('/ventas/update/completa/:id', ventasController.updateFullVenta);
    
    //* RUTAS DETALLE PAGO RIFAS
    router.get('/detallespago', checkPermissions('Ver detalles de pago de rifas'), detallePagoRifasController.findAll);
    router.get('/detallespago/activos', checkPermissions('Ver detalles de pago de rifas'), detallePagoRifasController.findActive);
    router.get('/detallespago/inactivos', checkPermissions('Ver detalles de pago de rifas'), detallePagoRifasController.findInactive);
    router.post('/detallespago', detallePagoRifasController.create);
    router.put('/detallespago/:idDetallePagoRecaudacionRifa', detallePagoRifasController.update);
    router.delete('/detallespago/:idDetallePagoRecaudacionRifa', detallePagoRifasController.delete);

    //* RUTAS ASPIRANTES 
    router.get('/aspirantes', checkPermissions('Ver aspirantes'), aspirantesController.findAll);
    router.get('/aspirantes/activos', checkPermissions('Ver aspirantes'), aspirantesController.findActive);
    router.get('/aspirantes/inactivos', checkPermissions('Ver aspirantes'), aspirantesController.findInactive);
    router.get('/aspirantes/estado/:idAspirante', aspirantesController.verifyStatus); 
    router.post('/aspirantes', aspirantesController.create);
    router.put('/aspirantes/:idAspirante', aspirantesController.update);
    router.get('/aspirantes', aspirantesController.findAll);
    router.put('/aspirantes/aceptar/:idAspirante', aspirantesController.acceptAspirante);
    router.delete('/aspirantes/:idAspirante', aspirantesController.delete);

    // * RUTAS RECAUDACION EVENTOS
    router.get('/recaudacion_evento', checkPermissions('Ver recaudación de eventos'), recaudacion_eventosController.find);
    router.get('/recaudacion_evento/activas', recaudacion_eventosController.findActive);
    router.get('/recaudacion_evento/inactivas', recaudacion_eventosController.findInactive);
    router.get('/recaudacion_evento/:id',  recaudacion_eventosController.findById);
    router.post('/recaudacion_evento/create', recaudacion_eventosController.createRecaudacionEvento);
    router.put('/recaudacion_evento/update/:id', recaudacion_eventosController.updateRecaudacionEvento);
    router.delete('/recaudacion_evento/delete/:id', recaudacion_eventosController.deleteRecaudacionEvento);

    // * RUTAS BITACORAS
    router.get('/bitacora', checkPermissions('Ver bitácoras'), bitacorasController.find);
    router.get('/bitacora/problemas', bitacorasController.findProblemaDetectado);
    router.get('/bitacora/problemasRevision', bitacorasController.findProblemaRevision);
    router.get('/bitacora/problemasSolucionados', bitacorasController.findProblemaSolucionado);
    router.get('/bitacora/notificacionGeneralEvento', bitacorasController.findCatEvento);
    router.get('/bitacora/:id', bitacorasController.findById);
    router.post('/bitacora/create', bitacorasController.createBitacora);
    router.put('/bitacora/update/:id', bitacorasController.updateBitacora);
    router.delete('/bitacora/delete/:id', bitacorasController.deleteBitacora);

    // * RUTAS PARA DETALLE VENTAS STANDS
    router.get('/detalle_ventas_stands', detalle_ventas_standsController.findAll);
    router.get('/detalle_ventas_stands/activos', detalle_ventas_standsController.findActive),
    router.get('/detalle_ventas_stands/inactivos', detalle_ventas_standsController.findInactive),
    router.get('/reporte/playeras', checkPermissions('Generar reporte stands'), detalle_ventas_standsController.obtenerReporteProductos),
    router.get('/detalle_ventas_stands/:id', detalle_ventas_standsController.findById);
    router.get('/reporteVoluntarios/getReporte', checkPermissions('Generar reporte voluntarios'), detalle_ventas_standsController.obtenerReporteMercanciaVoluntarios);
    router.post('/detalle_ventas_stands/create', detalle_ventas_standsController.create);
    router.put('/detalle_ventas_stands/update/:id', detalle_ventas_standsController.update);
    
    // * RUTAS PARA DETALLE VENTAS VOLUNTARIOS
    router.get('/detalle_ventas_voluntarios', detalle_ventas_voluntariosController.findAll);
    router.get('/detalle_ventas_voluntarios/activos', detalle_ventas_voluntariosController.findActive);
    router.get('/detalle_ventas_voluntarios/inactivos', detalle_ventas_voluntariosController.findInactive);
    router.get('/detalle_ventas_voluntarios/:id', detalle_ventas_voluntariosController.findById);
    router.post('/detalle_ventas_voluntarios/create', detalle_ventas_voluntariosController.create);
    router.put('/detalle_ventas_voluntarios/update/:id', detalle_ventas_voluntariosController.update);

    // * RUTAS DETALLE PAGO VENTAS STANDS
    router.get('/detalle_pago_ventas_stands', detalle_pago_ventas_standsController.findAll);
    router.get('/detalle_pago_ventas_stands/activos', detalle_pago_ventas_standsController.findActive);
    router.get('/detalle_pago_ventas_stands/inactivos', detalle_pago_ventas_standsController.findInactive);
    router.get('/detalle_pago_ventas_stands/:id', detalle_pago_ventas_standsController.findById);
    router.post('/detalle_pago_ventas_stands/create', detalle_pago_ventas_standsController.create);
    router.put('/detalle_pago_ventas_stands/update/:id', detalle_pago_ventas_standsController.update);

    // * RUTAS DETALLE PAGO VENTAS VOLUNTARIOS
    router.get('/detalle_pago_ventas_voluntarios', detalle_pago_ventas_voluntariosController.findAll);
    router.get('/detalle_pago_ventas_voluntarios/activos', detalle_pago_ventas_voluntariosController.findActive);
    router.get('/detalle_pago_ventas_voluntarios/inactivos', detalle_pago_ventas_voluntariosController.findInactive);
    router.get('/detalle_pago_ventas_voluntarios/:id', detalle_pago_ventas_voluntariosController.findById);
    router.post('/detalle_pago_ventas_voluntarios/create', detalle_pago_ventas_voluntariosController.create);
    router.put('/detalle_pago_ventas_voluntarios/update/:id', detalle_pago_ventas_voluntariosController.update);

    // * RUTAS PARA DETALLE PRODUCTOS VOLUNTARIOS
    router.get('/detalle_productos_voluntarios', detalle_productos_voluntariosController.find);
    router.get('/detalle_productos_voluntarios/activos', detalle_productos_voluntariosController.findActive);
    router.get('/detalle_productos_voluntarios/inactivos', detalle_productos_voluntariosController.findInactive);
    router.get('/detalle_productos_voluntarios/:id', detalle_productos_voluntariosController.findById);
    router.post('/detalle_productos_voluntarios/create', detalle_productos_voluntariosController.create);
    router.put('/detalle_productos_voluntarios/update/:id', detalle_productos_voluntariosController.update);
    router.delete('/detalle_productos_voluntarios/delete/:id', detalle_productos_voluntariosController.delete);

    // * RUTAS DE TIPOS DE SITUACIONES
    router.get('/tipo_situaciones',  tipo_situacionesController.findAll);
    router.get('/tipo_situaciones/activos', tipo_situacionesController.findActive);
    router.get('/tipo_situaciones/inactivos', tipo_situacionesController.findInactive);
    router.get('/tipo_situaciones/:id', tipo_situacionesController.findById);
    router.post('/tipo_situaciones/create', tipo_situacionesController.create);
    router.put('/tipo_situaciones/update/:id', tipo_situacionesController.update);
    router.delete('/tipo_situaciones/delete/:id', tipo_situacionesController.delete);

    // * RUTAS DE SITUACIONES
    router.get('/situaciones', situacionesController.findAll);
    router.get('/situaciones/reporte', situacionesController.findGroupedByEstadoWithDates);
    router.get('/situaciones/reportadas', checkPermissions('Ver situaciones'), situacionesController.findReportadas);
    router.get('/situaciones/en_revision', checkPermissions('Ver situaciones'), situacionesController.findEnRevision);
    router.get('/situaciones/en_proceso', checkPermissions('Ver situaciones'), situacionesController.findEnProceso);
    router.get('/situaciones/proximo_a_solucionarse', checkPermissions('Ver situaciones'), situacionesController.findProximoASolucionarse);
    router.get('/situaciones/en_reparacion', checkPermissions('Ver situaciones'), situacionesController.findEnReparacion);
    router.get('/situaciones/resueltas', checkPermissions('Ver situaciones'), situacionesController.findResueltas);
    router.get('/situaciones/sin_solucion', checkPermissions('Ver situaciones'), situacionesController.findSinSolucion);
    router.get('/situaciones/:id', situacionesController.findById);
    router.post('/situaciones/create', situacionesController.create);
    router.put('/situaciones/update/reporte/:id', situacionesController.updateReporte);
    router.put('/situaciones/update/respuesta/:id', situacionesController.updateRespuesta);

    // * RUTAS DE NOTIFICACIONES
    router.get('/notificaciones', notificacionesController.find);
    router.put('/notificaciones/:id', notificacionesController.update);

    // * RUTAS DE TIPOS DE NOTIFICACIONES
    router.get('/tipoNotificaciones', tipoNotificacionesController.find);

    // * RUTAS DE REPORTES
    router.post('/reportesAspirantes', checkPermissions('Generar reporte aspirantes'), aspirantesController.reporteAspirantes);
    router.post("/reportesRifas", checkPermissions('Generar reporte rifas'), reportesController.reporteRifas);

    // * ENDPOINT DE PERMISOS 
    router.get('/usuarios/permisos', obtenerPermisosController.getPermissionsForRole);

    // * RUTA DE VOLUNTARIOS DE MES
    router.get('/voluntarioDelMes', voluntarioDelMesController.getVoluntarioDelMes);

    // * TRASLADOS COMPLETOS 
    router.get('/trasladosCompletos/:id', trasladosCompletosController.getDetalleTrasladoById);
    router.post('/trasladosCompletos', trasladosCompletosController.createTrasladoConDetalle);
    router.put('/trasladosCompletos/:id', trasladosCompletosController.updateTrasladoConDetalle);

    app.use('/', router);

};