

//FIUMBA

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express(); //Creamos una constante con la carga de server express
const PUERTO = 3000;

console.log('Estoy vivo!' + '\n');

console.log('Desarrollo Backend grupo 4' + '\n');


app.use(cors()); //Aplicamos filtros sobre todos los paquetes recibidos a cors
app.use(express.json()); //Convierte el texto plano en un objeto JavaScript

// Crear/limpiar log.txt
const logFile = path.join(__dirname, 'log.txt');
fs.writeFileSync(logFile, `=== LOG INICIADO: ${new Date().toISOString()} ===\n\n`);

// Función para escribir en log
function log(mensaje) {
  console.log(mensaje);
  fs.appendFileSync(logFile, mensaje + '\n');
}

let tiempos = {};

app.post('/api/escanear',(req, res)=>{ //Generamos una excepcion a POST
//Tenemos 2 objetos generados para las requerst y response	
  const id = Date.now();
  tiempos[id] = {};
  
  tiempos[id].t1 = Date.now();
  log(`[T1] Frontend → Backend: ${tiempos[id].t1}`);
  
  const urlRecibida = req.body.url;
  log(`[URL RECIBIDA] ${urlRecibida}`);
  
  tiempos[id].t2 = Date.now();
  log(`[T2] Backend → Robot: ${tiempos[id].t2} (Delay: ${tiempos[id].t2 - tiempos[id].t1}ms)`);
  
  // Enviar al robot
  fetch('http://localhost:5000/api/procesar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: urlRecibida, id })
  }).then(res => res.json()).then(data => {
    log(`[RESPUESTA ROBOT - HTTP 200] ${JSON.stringify(data)}`);
  }).catch(err => {
    log(`[ERROR ROBOT] ${err.message}`); //Atrapamos el error en caso de quel robot falle por cuestiones de seguridad, etc
  });

  res.json({ estado: 'EXITO', id });
});

// T4: Robot responde
app.post('/api/respuesta', (req, res) => {
  const { id, t3, datos } = req.body;
  
  tiempos[id].t3 = t3;
  tiempos[id].t4 = Date.now();
  
  log(`[T3] Robot → Backend: ${t3}`);
  log(`[T4] Backend recibió: ${tiempos[id].t4}`);
  log(`[DATOS ROBOT] ${JSON.stringify(datos)}`); //Convertimos la data en string para 
  log(`TIEMPO TOTAL: ${tiempos[id].t4 - tiempos[id].t1}ms`);
  log(`${'─'.repeat(60)}\n`); //Separamos texto para saber cuando arranca y termina cada log
  
  res.json({ ok: true });
});

app.listen(PUERTO, () => {
  log(`[BUNKER CENTRAL] Escuchando en puerto ${PUERTO}`); //Constante 3000
});





