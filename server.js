const express = require('express');
const cors = require('cors');
const dns = require('dns/promises');
const path = require('path');

const Logger = require('../utils/logger');
const ejecutarExtraccion = require('../robot/robot_mod');

const app = express();
const PUERTO = process.env.PORT || 3000;
const logger = new Logger('Server');

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'target-analyzer-integrado' });
});

app.post('/api/escanear', async (req, res) => {
  const tiempos = {
    recibidoEn: Date.now(),
  };

  try {
    const urlRecibida = req.body?.url || req.body?.urlObjetivo;

    if (!urlRecibida || typeof urlRecibida !== 'string') {
      logger.warn('La URL objetivo no es correcta');
      return res.status(400).json({
        estado: 'ERROR',
        mensaje: 'Debe enviar una URL valida.',
      });
    }

    logger.info(`[T1] Frontend -> Backend: ${tiempos.recibidoEn}`);
    logger.info(`[URL RECIBIDA] ${urlRecibida}`);

    tiempos.enviadoRobotEn = Date.now();
    logger.info(`[T2] Backend -> Robot: ${tiempos.enviadoRobotEn}`);

    const resultadoRobot = await ejecutarExtraccion(urlRecibida);

    tiempos.recibidoRobotEn = Date.now();
    logger.info(`[T3] Robot -> Backend: ${tiempos.recibidoRobotEn}`);

    const ipDetectada = await resolverIp(urlRecibida);

    tiempos.respondidoFrontendEn = Date.now();
    const respuestaFrontend = construirRespuestaFrontend(resultadoRobot, ipDetectada, tiempos);

    logger.info(`[T4] Respuesta enviada al Frontend: ${tiempos.respondidoFrontendEn}`);
    logger.info(`TIEMPO TOTAL: ${respuestaFrontend.tiemposBackend.totalMs} ms`);

    return res.json(respuestaFrontend);
  } catch (error) {
    logger.error(`[ERROR ROBOT] ${error.message}`);

    return res.status(500).json({
      estado: 'ERROR',
      mensaje: error.message || 'Falla en la extraccion del objetivo.',
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PUERTO, () => {
  logger.info(`[BUNKER CENTRAL] Escuchando en puerto ${PUERTO}`);
});

async function resolverIp(urlObjetivo) {
  try {
    const dominio = new URL(String(urlObjetivo).trim()).hostname;
    const resultado = await dns.lookup(dominio);
    return resultado.address;
  } catch {
    return null;
  }
}

function construirRespuestaFrontend(resultado, ipDetectada, tiempos) {
  const metricas = resultado.metricas || {};
  const seguridad = resultado.seguridad || {};
  const medios = resultado.medios || {};

  return {
    estado: resultado.estado,
    mensaje: resultado.mensaje,
    objetivo: resultado.objetivo,
    identidad: {
      titulo: resultado.identidad?.titulo || medios.coreHeadline || 'Sin titulo',
      descripcion: resultado.identidad?.descripcion || 'Sin descripcion',
      dominio: medios.targetDomain || obtenerDominioSeguro(resultado.objetivo),
      ip: ipDetectada,
    },
    tecnologias: resultado.tecnologias || { detected: [], byCategory: {}, all: [] },
    seguridad: {
      tipoConexion: metricas.certSslVigente ? 'HTTPS' : 'HTTP',
      sslVigente: Boolean(metricas.certSslVigente),
      score: typeof seguridad.score === 'number' ? seguridad.score : null,
      headers: seguridad.headers || [],
    },
    metricas: {
      tiempoRespuestaMs: metricas.tiempoRespuestaMs ?? null,
      pesoDocumentoKb: metricas.pesoDocumentoKb ?? null,
      conteo: metricas.conteo || {},
      topWords: metricas.topWords || [],
    },
    medios,
    enlaces: resultado.enlaces || { vectorCount: 0, items: [] },
    redesSociales: resultado.redesSociales || [],
    tiemposBackend: {
      recibidoEn: tiempos.recibidoEn,
      enviadoRobotEn: tiempos.enviadoRobotEn,
      recibidoRobotEn: tiempos.recibidoRobotEn,
      respondidoFrontendEn: tiempos.respondidoFrontendEn,
      totalMs: tiempos.respondidoFrontendEn - tiempos.recibidoEn,
    },
  };
}

function obtenerDominioSeguro(urlObjetivo) {
  try {
    return new URL(String(urlObjetivo).trim()).hostname;
  } catch {
    return null;
  }
}