const { Router } = require('express');
const express = require('express');
const path = require('path');
const router = Router();
const { checkPermissions } = require('../middlewares/permissionToken');
const authenticateToken = require('../middlewares/authenticateToken');
const upload = require('../middlewares/multerConfig'); // para las fotos
const uploadP = require('../middlewares/mullerProduConfig');
const uploadPerson = require('../middlewares/uploadPerson');
const uploadLocation = require('../middlewares/uploadLocation');

// Aqui van los imports
//RUTAS
const usuariosController = require('../controllers/usuariosController');
const horariosController = require('../controllers/horariosController');
const tipoStandsController = require('../controllers/tipoStandsController');
const categoriaHorariosController = require('../controllers/categoriaHorariosController');
const sedesController = require('../controllers/sedesController');
const eventosController = require('../controllers/eventosController');
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
const tipoPublicoController = require('../controllers/tipoPublicosController');
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
const standHorariosController = require('../controllers/standHorariosController');
const { ro } = require('date-fns/locale');

module.exports = (app) => {

  // * LOGIN AND LOGOUT
  router.post('/usuarios/login', usuariosController.login); // Ruta para iniciar sesión, no requiere autenticación

  // * QR (lo puse aqui porque no me dejaba usarlo a pesar de tener el token)
  router.get('/generateQR', voluntariosController.generateQR);

  // * RUTAS DE MUNICIPIOS Y DEPARTAMENTOS PARA REGISTRO ASPIRANTES
  router.get('/municipios', municipiosController.find);
  router.get('/departamentos', departamentosController.find);
  router.get('/aspirantes', aspirantesController.findAll);
  router.post('/aspirantes', aspirantesController.create);
  router.post('/personasAsp/create', personasController.createPerAspirante);

    // * RUTAS DE NOTIFICACIONES (a mi parecer deberian ir antes del token)
    router.get('/notificaciones', notificacionesController.find);
    router.post('/notificaciones/create', notificacionesController.create);
    router.put('/notificaciones/:id', notificacionesController.update);

  // * RUTA DE INVITADO (ver publicaciones, no usa permisos ni token)
  router.get('/publicaciones/invitado', publicacionesController.findInvitado);

  // ! Todas las rutas a continuación requieren autenticación
   router.use(authenticateToken); // Middleware para proteger las rutas con autenticación

  // * USUARIOS
  router.get('/usuarios/activos', usuariosController.find);
  router.get('/usuarios/me', usuariosController.getLoggedUser);
  router.get('/usuarios', usuariosController.findAllUsers);
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
  router.get('/sedes', sedesController.findAll);
  router.get('/sedes/activas', sedesController.findActive);
  router.get('/sedes/inactivas', sedesController.findInactive);
  router.get('/sedes/:idSede', sedesController.findById);
  router.post('/sedes', sedesController.create);
  router.put('/sedes/:idSede', sedesController.update);
  router.delete('/sedes/:idSede', sedesController.delete);

  // * RUTAS DE EVENTOS
  router.get('/eventos', eventosController.findAll);
  router.get('/eventos/reporte', checkPermissions('Generar reporte eventos'), eventosController.obtenerReporteEventos);
  router.get('/eventos/activas', eventosController.findActive);
  router.get('/eventos/inactivas', eventosController.findInactive);
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
  router.post('/stand/createHorarios', standsController.createStandWithHorarios);
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
  router.get('/tipo_publicos/inactivos',  tipoPublicoController.findInactive);
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
  router.get('/categoriaHorarios',  categoriaHorariosController.findAll);
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
  router.post('/productos', uploadP.single('foto'), productosController.create);
  router.put('/productos/estado/:id', productosController.updateEstado);
  router.put('/productos/:id', uploadP.single('foto'), productosController.update);
  router.delete('/productos/:id', productosController.delete);

    // * RIFAS
    router.get('/rifas', rifasController.find);
    router.get('/rifas/activos', rifasController.findActive);
    router.get('/rifas/inactivos', rifasController.findInactive);
    router.get('/rifas/talonarios/:idRifa', rifasController.findTalonariosVoluntarios);
  router.get('/rifas/voluntarios/talonarios/:idVoluntario/:idRifa', rifasController.findVoluntariosTalonarios);
    router.get('/rifas/:id', rifasController.findById);
    router.get('/rifas/withTalonarios/:id', rifasController.findRifaWithTalonarios);
    router.post('/rifas', rifasController.create);
    router.put('/rifas/:id', rifasController.update);
    router.delete('/rifas/:id', rifasController.delete);
    
    // * RUTAS DE PEDIDOS
    router.get('/pedidos', pedidosController.findAll);
    router.get('/pedidos/activas', pedidosController.findActive);
    router.get('/pedidos/inactivas', pedidosController.findInactive);
    router.get('/pedidos/:idPedido', pedidosController.findById);
    router.get('/pedidos/:descripcion', pedidosController.findPedido);
    router.post('/pedidos', pedidosController.create);
    router.put('/pedidos/:id', pedidosController.update);
    router.delete('/pedidos/:idPedido', pedidosController.delete);


      // * RUTAS DE STAND
      router.get('/stand', standsController.find);
      router.get('/stand/activas', standsController.findActivateStand);
      router.get('/stand/inactivas', standsController.findaInactivateStand);
      router.get('/stands/virtual/products', standsController.findVirtualStandProducts);
    router.get('/stands/virtual/productos/detalles', standsController.findDetalleProductosVirtual);
      router.get('/stands/detalles', standsController.findStandDetalles);
      router.get('/stands/voluntarios/:idStand', standsController.getVoluntariosEnStands);
    router.get('/stands/voluntarios/inscritos/:idVoluntario', standsController.getStandsDeVoluntario);
      router.post('/stand/create', standsController.createStand);
      router.put('/stand/update/:id', standsController.updateStand);
      router.delete('/stand/:id', standsController.deleteStand);
        
        // * RUTAS DE MUNICIPIOS
    router.get('/municipios', municipiosController.find);
    router.get('/municipios/activas', municipiosController.findActivateMunicipios);
    router.get('/municipios/inactivas', municipiosController.findInactiveMunicipios);
    router.post('/municipios/create',  municipiosController.createMunicipio);
    router.put('/municipios/update/:id', municipiosController.updateMunicipio);
    router.delete('/municipios/:id', municipiosController.deleteMunicipio);

  // * DETALLE HORARIOS
  router.get('/detalle_horarios', detalleHorariosController.findAll);
  router.get('/detalle_horarios/comisiones', detalleHorariosController.findByCategoriaComisiones);
  router.get('/detalle_horarios/activos', detalleHorariosController.findActive);
  router.get('/detalle_horarios/inactivos', detalleHorariosController.findInactive);
  router.get('/detalle_horarios/:id', detalleHorariosController.findById);
  router.post('/detalle_horarios',  detalleHorariosController.create);
  router.put('/detalle_horarios/:id',  detalleHorariosController.update);
  router.delete('/detalle_horarios/:id', detalleHorariosController.delete);

  // * FOTOS SEDES
  router.get('/fotos_sedes/activos', fotosSedesController.find);
  router.get('/fotos_sedes', fotosSedesController.find_all);
  router.get('/fotos_sedes/:id', fotosSedesController.findById);
  router.post('/fotos_sedes', uploadLocation.single('foto'), fotosSedesController.create);
  router.put('/fotos_sedes/:id', uploadLocation.single('foto'), fotosSedesController.update);
  router.delete('/fotos_sedes/:id', fotosSedesController.delete);

  // * RUTAS PARA PERSONAS
  router.get('/personas', personasController.find);
  router.get('/personas/activos', personasController.findActive);
  router.get('/personas/inactivos', personasController.findInactive);
  router.get('/personas/:id', personasController.findById);
  router.post('/personas/create', personasController.create);
  router.put('/personasFoto/:id/foto', uploadPerson.single('foto'), personasController.updateFoto);
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
  router.get('/comisiones/porevento', comisionesController.findByEvento);
  router.get('/comisiones/poreventoFr', comisionesController.findByEventoFront); 
  router.get('/comisiones/activos', comisionesController.findActive);
  router.get('/comisiones/inactivos', comisionesController.findInactive);
  router.get('/comisiones/active', comisionesController.findActiveComiById);
  router.get('/inscripciones/comision/:idComision/voluntario/:idVoluntario', comisionesController.findInscripcionesByComision);
  router.get('/comisiones/:id', comisionesController.findById);
  router.post('/comisiones/create', comisionesController.create);
  router.put('/comisiones/update/:id', comisionesController.update);
  router.delete('/comisiones/delete/:id', comisionesController.delete);

  // * RUTAS DE MATERIALES
  router.get('/materiales/all', materialesController.find);
  router.get('/materiales/:id', materialesController.findById);
  router.get('/materialesByName', materialesController.findByName);
  router.get('/materiales/comision/:idComision', materialesController.findByComision);
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
    router.get('/voluntarios/conProductos', voluntariosController.findWithAssignedProducts);
    router.get('/voluntarios/conProductos/:idVoluntario', voluntariosController.findWithAssignedProductsById);
    router.get('/voluntarios/activos', voluntariosController.findActivateVol); 
    router.get('/voluntarios/inactivos', voluntariosController.findaInactivateVol);
    router.get('/voluntarios/:id', voluntariosController.findById);
    router.post('/voluntarios/create', voluntariosController.createVol);
    router.put('/voluntarios/update/:id', voluntariosController.updateVol); 
    router.delete('/voluntarios/delete/:id', voluntariosController.deleteVol);

  // * RUTAS DE ACTIVIDADES
  router.get('/actividades', actividadesController.find);
  router.get('/actividades/activos', actividadesController.findActive);
  router.get('/actividades/inactivos', actividadesController.findInactive);
  router.get('/actividades/comision/:idComision', actividadesController.findByComision);
  router.get('/actividades/:id', actividadesController.findById);
  router.post('/actividades/create', actividadesController.create);
  router.put('/actividades/update/:id', actividadesController.update);
  router.delete('/actividades/delete/:id', actividadesController.delete);

  // * RUTAS DE PUBLICACIONES
  router.get('/publicaciones', publicacionesController.find);
  router.get('/publicaciones/completas', publicacionesController.findCompleto);
  router.get('/publicaciones/activos', publicacionesController.findActive);
  router.get('/publicaciones/inactivos',  publicacionesController.findInactive);
  router.get('/publicaciones/detalles/:id', publicacionesController.getPublicacionDetalles);
  router.get('/publicaciones/:id', publicacionesController.findById);
  router.post('/publicaciones/create', publicacionesController.create);
  router.post('/publicaciones/completa/create', upload.array('fotos', 30), publicacionesController.createCompleto);
  router.put('/publicaciones/update/:id', publicacionesController.update);
  router.put('/publicaciones/completa/update/:id', upload.array('fotos', 30), publicacionesController.updateCompleto);
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
  router.get("/inscripciones/voluntario/:idVoluntario", inscripcionEventosController.obtenerInscripcionesPorVoluntario);
  router.get("/inscripciones/:idVoluntario", inscripcionEventosController.obtenerInscripciones);
  router.post('/inscripcion_eventos/create', inscripcionEventosController.create);
  router.put('/inscripcion_eventos/update/:id', inscripcionEventosController.update);
  router.delete('/inscripcion_eventos/delete/:id', inscripcionEventosController.delete);

  // * RUTAS DE INSCRIPCION A COMISIONES
  router.get('/inscripcion_comisiones', inscripcionComisionController.find);
  router.get('/inscripcion_comisiones/activos', inscripcionComisionController.findActive);
  router.get('/inscripcion_comisiones/inactivos', inscripcionComisionController.findInactive);
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
  router.get('/asignacion_stands/voluntarios_por_stand', asignacionStandsController.findVoluntariosByStand);
  router.get('/asignacion_stands/voluntarios_por_stand/activos', asignacionStandsController.findVoluntariosByActiveStands);
  router.get('/asignacion_stands/voluntarios_por_stand/inactivos', asignacionStandsController.findVoluntariosByInactiveStands);
  router.get('/asignacion_stands/activos', asignacionStandsController.findActive);
  router.get('/asignacion_stands/inactivos', asignacionStandsController.findInactive);
  router.get('/asignacion/voluntario/:idVoluntario', asignacionStandsController.findAsignacionByVoluntario);
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
  router.get('/detalle_productos', detalle_productosController.find);
    router.get('/detalle_productos/activos', detalle_productosController.findActive);
    router.get('/detalle_productos/inactivos', detalle_productosController.findInactive);
  router.get('/detalle_productos/:id', detalle_productosController.findById);
  router.post('/detalle_productos/create',  detalle_productosController.createDetalleProducto);
  router.put('/detalle_productos/update/:id',  detalle_productosController.updateDetalleProducto);
  router.delete('/detalle_productos/delete/:id', detalle_productosController.deleteDetalleProducto);

  // * RuUTAS DE DETALLE DE INSCRIPCION DE ACTIVIDADES
  router.get('/detalle_inscripcion_actividades', detalleInscripcionActividadesController.find);
  router.get('/detalle_inscripcion_actividades/activos', detalleInscripcionActividadesController.findActive);
  router.get('/detalle_inscripcion_actividades/inactivos', detalleInscripcionActividadesController.findInactive); 
  router.get('/detalle_inscripcion_actividades/:id', detalleInscripcionActividadesController.findById);
  router.get('/inscripcion_evento/:idVoluntario/:idEvento', detalleInscripcionActividadesController.findInscripcionByComisionAndVoluntario);
  router.post('/detalle_inscripcion_actividades/create', detalleInscripcionActividadesController.create);
  router.put('/detalle_inscripcion_actividades/update/:id', detalleInscripcionActividadesController.update);
  router.delete('/detalle_inscripcion_actividades/delete/:id', detalleInscripcionActividadesController.delete);

  // * RUTAS DE DETALLE DE INSCRIPCION DE MATERIALES
  router.get('/detalle_inscripcion_materiales', detalleInscripcionMaterialesController.find);
  router.get('/detalle_inscripcion_materiales/activos', detalleInscripcionMaterialesController.findActive);
  router.get('/detalle_inscripcion_materiales/inactivos', detalleInscripcionMaterialesController.findInactive);
  router.get('/detalle_inscripcion_materiales/:id', detalleInscripcionMaterialesController.findById);
  router.post('/detalle_inscripcion_materiales/create',  detalleInscripcionMaterialesController.create);
  router.put('/detalle_inscripcion_materiales/update/:id', detalleInscripcionMaterialesController.update);
  router.delete('/detalle_inscripcion_materiales/delete/:id', detalleInscripcionMaterialesController.delete);

  // * RUTAS DE EMPLEADO
  router.get('/empleados', empleadosController.find);
  router.get('/empleados/activos', empleadosController.findActive);
  router.get('/empleados/inactivos', empleadosController.findInactive);
  router.get('/empleados/:id', empleadosController.findById);
  router.post('/empleados/create',  empleadosController.create);
  router.put('/empleados/update/:id',  empleadosController.update);
  router.delete('/empleados/delete/:id',  empleadosController.delete);

  // * RUTAS DE ASISTENCIA A EVENTOS
  router.get('/asistencia_eventos', asistenciaEventosController.find);
  router.get('/asistencia_eventos/evento/:idEvento', asistenciaEventosController.findByEvento);
  router.get('/asistencia_eventos/activos', asistenciaEventosController.findActive);
  router.get('/asistencia_eventos/inactivos', asistenciaEventosController.findInactive);
  router.get('/asistencia_eventos/:id', asistenciaEventosController.findById);
  router.post('/asistencia_eventos/create', asistenciaEventosController.create);
  router.put('/asistencia_eventos/update/:id', asistenciaEventosController.update);
  router.delete('/asistencia_eventos/delete/:id', asistenciaEventosController.delete);

    //* RUTAS DE RECAUDACION DE RIFAS
    router.get('/recaudaciones', recaudacionRifasController.findAll);
    router.get('/recaudaciones/activas', recaudacionRifasController.findActive);
    router.get('/recaudaciones/inactivas', recaudacionRifasController.findInactive);
    router.get('/recaudaciones/fecha/:fecha', recaudacionRifasController.getByDate);
    router.get('/recaudaciones/detalle/:idRecaudacionRifa', recaudacionRifasController.getRecaudacionCompleta);
    router.get('/recaudaciones/todas', recaudacionRifasController.getTodasRecaudaciones)
    router.get('/recaudaciones/todas/inactivas', recaudacionRifasController.getTodasRecaudacionesInactive);
    router.post('/recaudaciones/rifa/completa', recaudacionRifasController.createRecaudacionRifa);
    router.put('/recaudaciones/:idRecaudacionRifa',  recaudacionRifasController.update);
    router.put('/recaudaciones/rifa/completa/update/:idRecaudacionRifa', recaudacionRifasController.updateRecaudacionRifa);
    router.delete('/recaudaciones/:idRecaudacionRifa', recaudacionRifasController.delete);

    // * RUTAS DE VENTAS
    router.get('/ventas', ventasController.findAll);
    router.get('/ventas/voluntarios', ventasController.findAllVoluntarios);
    router.get('/ventas/stands', ventasController.findAllVentasStands);
    router.get('/ventas/activas', ventasController.findActive);
    router.get('/ventas/voluntarios/activas', ventasController.findActiveVoluntarios);
    router.get('/ventas/stands/activas', ventasController.findActiveVentasStands);
    router.get('/ventas/inactivas', ventasController.findInactive);
    router.get('/ventas/voluntarios/inactivas', ventasController.findInactiveVoluntarios);
    router.get('/ventas/stands/inactivas', ventasController.findInactiveVentasStands);
    router.get('/detalle_ventas_voluntarios/ventaCompleta/:idVenta', ventasController.findByVentaId);
    router.get('/detalle_ventas_stands/ventaCompleta/:idVenta', ventasController.findByVentaIdStand);
    router.get('/ventas/:id', ventasController.findById);
    router.post('/ventas/create/completa', ventasController.createFullVenta);
    router.post('/ventas/create/stands/completa', ventasController.createFullVentaStand);
    router.put('/ventas/update/:id', ventasController.update);
    router.put('/ventas/update/completa/:idVenta', ventasController.updateFullVenta);
    router.put('/ventas/update/stands/completa/:idVenta', ventasController.updateFullVentaStand);
    
    //* RUTAS DETALLE PAGO RIFAS
    router.get('/detallespago', detallePagoRifasController.findAll);
    router.get('/detallespago/activos', detallePagoRifasController.findActive);
    router.get('/detallespago/inactivos', detallePagoRifasController.findInactive);
    router.post('/detallespago', detallePagoRifasController.create);
    router.put('/detallespago/:idDetallePagoRecaudacionRifa', detallePagoRifasController.update);
    router.delete('/detallespago/:idDetallePagoRecaudacionRifa', detallePagoRifasController.delete);

  //* RUTAS ASPIRANTES 
    router.get('/aspirantes', aspirantesController.findAll);
  router.get('/aspirantes/activos', aspirantesController.findActive);
  router.get('/aspirantes/inactivos', aspirantesController.findInactive);
  router.get('/aspirantes/estado/:idAspirante', aspirantesController.verifyStatus);
  router.get('/aspirantes/:idAspirante', aspirantesController.findOne);
    router.post('/aspirantes', aspirantesController.create);
  router.put('/aspirantes/:idAspirante', aspirantesController.update);
  router.get('/aspirantes', aspirantesController.findAll);
  router.put('/aspirantes/aceptar/:idAspirante', aspirantesController.acceptAspirante);
  router.put('/aspirantes/denegar/:idAspirante', aspirantesController.denyAspirante);
  router.delete('/aspirantes/:idAspirante', aspirantesController.delete);

  // * RUTAS RECAUDACION EVENTOS
  router.get('/recaudacion_evento', recaudacion_eventosController.find);
  router.get('/recaudacion_evento/activas', recaudacion_eventosController.findActive);
  router.get('/recaudacion_evento/inactivas', recaudacion_eventosController.findInactive);
  router.get('/recaudacion_evento/:id',  recaudacion_eventosController.findById);
  router.post('/recaudacion_evento/create', recaudacion_eventosController.createRecaudacionEvento);
  router.put('/recaudacion_evento/update/:id', recaudacion_eventosController.updateRecaudacionEvento);
  router.delete('/recaudacion_evento/delete/:id', recaudacion_eventosController.deleteRecaudacionEvento);

  // * RUTAS BITACORAS
  router.get('/bitacora', checkPermissions('Ver bitácoras'), bitacorasController.find);
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
  router.get('/situaciones/usuario/:idUsuario', situacionesController.findByUsuario);
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

  // * RUTAS DE TIPOS DE NOTIFICACIONES
  router.get('/tipoNotificaciones', tipoNotificacionesController.find);

  // * RUTAS DE REPORTES
  router.post('/reportesAspirantes', checkPermissions('Generar reporte aspirantes'), aspirantesController.reporteAspirantes);
  router.post("/reportesRifas", checkPermissions('Generar reporte rifas'), reportesController.reporteRifas);
  router.get('/reportePedidos', checkPermissions('Generar reporte pedidos'), detalle_pedidosController.reportePedidosConDetalle);
  router.get('/reporteContabilidad', checkPermissions('Generar reporte contabilidad'), reportesController.reporteContabilidad);
    // * ENDPOINT DE PERMISOS 
    router.get('/usuarios/permisos', obtenerPermisosController.getPermissionsForRole);

    // * RUTA DE VOLUNTARIOS DE MES
    router.get('/voluntarioDelMes', voluntarioDelMesController.getVoluntarioDelMes);

    // * TRASLADOS COMPLETOS 
    router.get('/trasladosCompletos/:id', trasladosCompletosController.getDetalleTrasladoById);
    router.get('/reporteTraslados', checkPermissions('Generar reporte traslados'), trasladosCompletosController.reporteTrasladosConDetalle);
    router.post('/trasladosCompletos', trasladosCompletosController.createTrasladoConDetalle);
    router.put('/trasladosCompletos/:id', trasladosCompletosController.updateTrasladoConDetalle);

    // * HORARIOS STANDS 
    router.get('/standHorario/:idStand', standHorariosController.findByStand);
    router.get('/standHorario', standHorariosController.findAll);
    router.post('/standHorario', standHorariosController.create);
    router.put('/standHorario/:id', standHorariosController.update);
    router.delete('/standHorario/:id', standHorariosController.delete);

  // Ruta para servir fotos de personas
  app.use('/personas_image', express.static(path.join(__dirname, 'src/personas')));
  app.use('/fotos_sedes_image', express.static(path.join(__dirname, 'src/fotos_sedes')));

  app.use('/', router);

};