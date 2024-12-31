const { Op } = require('sequelize');
const { asistencia_eventos, detalle_inscripcion_actividades, inscripcion_comisiones, recaudacion_rifas, inscripcion_eventos, solicitudTalonarios, voluntarios, personas } = require('../models');

async function getVoluntarioDelMes(req, res) {
  try {
    const fechaInicioMes = new Date();
    fechaInicioMes.setDate(1); // Primer día del mes actual
    fechaInicioMes.setHours(0, 0, 0, 0);
    
    const fechaFinMes = new Date();
    fechaFinMes.setMonth(fechaFinMes.getMonth() + 1); // Primer día del siguiente mes
    fechaFinMes.setDate(1);
    fechaFinMes.setHours(0, 0, 0, 0);

    // Obtener todas las asistencias dentro del mes actual y asociar el idVoluntario
    const asistencias = await asistencia_eventos.findAll({
      where: {
        createdAt: {
          [Op.gte]: fechaInicioMes,
          [Op.lt]: fechaFinMes
        }
      },
      include: [
        {
          model: inscripcion_eventos,
          as: 'inscripcionEvento',
          attributes: ['idVoluntario'],
        }
      ]
    });

    // Obtener todas las actividades en las que los voluntarios están inscritos
    const actividades = await detalle_inscripcion_actividades.findAll({
      where: {
        createdAt: {
          [Op.gte]: fechaInicioMes,
          [Op.lt]: fechaFinMes
        }
      },
      include: [
        {
          model: inscripcion_eventos,
          as: 'inscripcionEvento',
          attributes: ['idVoluntario'],
        }
      ]
    });

    // Obtener todas las inscripciones a comisiones y asociar el idVoluntario
    const inscripcionesComisiones = await inscripcion_comisiones.findAll({
      where: {
        createdAt: {
          [Op.gte]: fechaInicioMes,
          [Op.lt]: fechaFinMes
        }
      },
      include: [
        {
          model: voluntarios,
          attributes: ['idVoluntario'],
        }
      ]
    });

    // Obtener todas las recaudaciones de rifas y asociar el idVoluntario
    const recaudacionesRifas = await recaudacion_rifas.findAll({
      where: {
        createdAt: {
          [Op.gte]: fechaInicioMes,
          [Op.lt]: fechaFinMes
        }
      },
      include: [
        {
          model: solicitudTalonarios,
          attributes: ['idVoluntario'],
        }
      ]
    });

    // Crear un objeto para almacenar el puntaje de cada voluntario
    const puntajes = {};

    // Calcular puntos por asistencias
    asistencias.forEach(asistencia => {
      const idVoluntario = asistencia.inscripcionEvento.idVoluntario;
      puntajes[idVoluntario] = (puntajes[idVoluntario] || 0) + 1;
    });

    // Calcular puntos por actividades en detalle_inscripcion_actividades
    actividades.forEach(actividad => {
      const idVoluntario = actividad.inscripcionEvento.idVoluntario;
      puntajes[idVoluntario] = (puntajes[idVoluntario] || 0) + 1;
    });

    // Calcular puntos por inscripción a comisiones
    inscripcionesComisiones.forEach(inscripcion => {
      const idVoluntario = inscripcion.idVoluntario;
      puntajes[idVoluntario] = (puntajes[idVoluntario] || 0) + 1;
    });

    // Calcular puntos por boletos vendidos en la recaudación de rifas
    recaudacionesRifas.forEach(recaudacion => {
      const idVoluntario = recaudacion.solicitudTalonario.idVoluntario;
      const boletosVendidos = recaudacion.boletosVendidos;
      puntajes[idVoluntario] = (puntajes[idVoluntario] || 0) + boletosVendidos;
    });

    // Encontrar al voluntario con el mayor puntaje
    let voluntarioDelMes = null;
    let maxPuntaje = 0;
    
    for (const [voluntarioId, puntaje] of Object.entries(puntajes)) {
      if (puntaje > maxPuntaje) {
        maxPuntaje = puntaje;
        voluntarioDelMes = voluntarioId;
      }
    }

    if (voluntarioDelMes) {
      // Obtener nombre del voluntario y otros datos
      const voluntario = await voluntarios.findOne({
        where: { idVoluntario: voluntarioDelMes },
        include: [
          {
            model: personas,
            attributes: ['nombre'], // Obtener el nombre del voluntario
          }
        ]
      });

      // Responder con el voluntario del mes y el desglose de puntos
      return res.json({
        voluntarioDelMes: voluntarioDelMes,
        nombreVoluntario: voluntario ? voluntario.persona.nombre : 'Desconocido',
        puntos: {
          punteo: puntajes[voluntarioDelMes],
        }
      });
    } else {
      return res.status(404).json({ message: "No se encontró al voluntario del mes." });
    }
    
  } catch (error) {
    console.error("Error al calcular el voluntario del mes:", error);
    return res.status(500).json({ message: "Hubo un error al calcular el voluntario del mes." });
  }
}

module.exports = { getVoluntarioDelMes };
