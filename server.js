
(const express = require('express');)

const cors = require('cors');

const app = express(); //Creamos una constante con la carga de server express

const PUERTO = 3000;

app.use(cors()); //Aplicamos filtros sobre todos los paquetes recibidos a cors

app.use(express.json()); //Convierte el texto plano en un objeto JavaScript

app.post('/api/escanear',(req, res)=>{ //Generamos una excepcion a POST
//Tenemos 2 objetos generados para las requerst y response	
	const urlRecibida = req.body.url;
	console.log(`[ALERTA]: Objetivo recibido en coordenadas: ${urlRecibida}`);

	res.json({
		estado: 'EXITO',
		mensaje: '[ENLACE ESTABLECIDO]: Servidor a la espera del Robot.',
		objetivo: urlRecibida
	});
});

app.listen(PUERTO,()=>{
	console.log(`[BUNKER CENTRAL]: Escuchando cumunicaciones en puerto ${PUERTO}`);
});