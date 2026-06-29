

//FIUMBA

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express(); //Creamos una constante con la carga de server express
const PUERTO = 3001;

const ejecutarExtraccion = require('./robot_mod');

console.log('Estoy vivo!' + '\n');

console.log('Desarrollo Backend grupo 4' + '\n');


app.use(cors()); //Aplicamos filtros sobre todos los paquetes recibidos a cors
app.use(express.json()); //Convierte el texto plano en un objeto JavaScript

// Crear log.txt
const logFile = path.join(__dirname, 'log.txt');
fs.appendFileSync(
    logFile,
    `\n\n=== SERVIDOR INICIADO: ${new Date().toLocaleString()} ===\n`
);
//AJUSTAR EL LOG PARA QUE GUARDE LA DATA

// Función para escribir en log
function log(mensaje) {
  console.log(mensaje);
  fs.appendFileSync(logFile, mensaje + '\n');
}

let tiempos = {};

app.post('/api/escanear', async (req, res) => { //Generamos una excepcion a POST, se agrega async
//Tenemos 2 objetos generados para las requerst y response	
  const id = Date.now();
  tiempos[id] = {};
  
  tiempos[id].t1 = Date.now();
  log(`[T1] Frontend → Backend: ${tiempos[id].t1}`);
  
  const urlRecibida = req.body.url;
  log(`[URL RECIBIDA] ${urlRecibida}`);
  
  tiempos[id].t2 = Date.now();
  log(`[T2] Backend → Robot: ${tiempos[id].t2} (Delay: ${tiempos[id].t2 - tiempos[id].t1}ms)`);
  
  // // Enviar al robot PARTE VIEJA PEGANDO POR HTTP REQUESTs
  // fetch(`http://localhost:${PUERTO}/api/procesar`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ url: urlRecibida, id })
  // }).then(res => res.json()).then(data => {
  //   log(`[RESPUESTA ROBOT - HTTP 200] ${JSON.stringify(data)}`);
  // }).catch(err => {
  //   log(`[ERROR ROBOT] ${err.message}`); //Atrapamos el error en caso de quel robot falle por cuestiones de seguridad, etc
  // });

  //NUEVA COMUNICACION CON ROBOT
  try {

      const resultado = await ejecutarExtraccion(urlRecibida);

      tiempos[id].t3 = Date.now();
      tiempos[id].t4 = Date.now();

      log(`[T3] Robot finalizó: ${tiempos[id].t3}`);
      log(`[T4] Backend recibió resultado: ${tiempos[id].t4}`);
      log(`[DATOS ROBOT] ${JSON.stringify(resultado)}`);
      log(`TIEMPO TOTAL: ${tiempos[id].t4 - tiempos[id].t1}ms`);
      log(`${'─'.repeat(60)}`);

      res.json(resultado);

  } catch (err) {

      log(`[ERROR ROBOT] ${err.message}`);

      res.status(500).json({
          estado: "ERROR",
          mensaje: err.message
      });

  }
  res.json({ estado: 'EXITO', id });
});

// // T4: Robot responde TAMBIEN ES VERSION POR HTTP REQUESTs
// app.post('/api/respuesta', (req, res) => {
//   const { id, t3, datos } = req.body;
  
//   tiempos[id].t3 = t3;
//   tiempos[id].t4 = Date.now();
  
//   log(`[T3] Robot → Backend: ${t3}`);
//   log(`[T4] Backend recibió: ${tiempos[id].t4}`);
//   log(`[DATOS ROBOT] ${JSON.stringify(datos)}`); //Convertimos la data en string para 
//   log(`TIEMPO TOTAL: ${tiempos[id].t4 - tiempos[id].t1}ms`);
//   log(`${'─'.repeat(60)}\n`); //Separamos texto para saber cuando arranca y termina cada log
  
//   res.json({ ok: true });
// });

app.listen(PUERTO, () => {
  log(`[BUNKER CENTRAL] Escuchando en puerto ${PUERTO}`); //Constante 3000
});

//HACER MOCKEO DE LA INFO QUE VIENE DEL ROBOT





