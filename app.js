require('dotenv').config();
const path = require('path');
const fs = require('fs');
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const express       = require('express');
const cors          = require('cors');
const logger        = require('morgan');
const bodyParser    = require('body-parser');
const http = require('http');
const EventEmitter = require('events'); // Importar EventEmitter
const app = express();

/*  require('./routes')(app); */

// Crear una instancia de EventEmitter y configurar el límite de listeners
const bus = new EventEmitter();
bus.setMaxListeners(20); // Incrementar el límite de listeners a 20

//app.use(logger('dev'));
app.use(logger('combined', { stream: logStream })); // Usar el stream de escritura para guardar los logs


//validacion de rutas
app.use(cors());
// habilitar body-parser
/* app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); */

/* app.use(bodyParser.json());npm
app.use(bodyParser.urlencoded({ extended: true })); */


/* Agruegué el de express que el de bodyparser daba deprecate */
app.use(express.json({limit:"50mb"}));  
app.use(express.urlencoded({limit:"50mb" , extended: false }));  


require("./routes")(app);


/* genera  las tablas en la base de datos */
/*    const db = require("./models");

 db.sequelize.sync();    */

 app.use(express.static('./public'));

 // Middleware para servir imágenes de publicaciones
app.use('/publicaciones_image', express.static(path.join(__dirname, 'src/publicaciones')));
app.use('/productos_image', express.static(path.join(__dirname, 'src/productos')));
app.use('/personas_image', express.static(path.join(__dirname, 'src/personas')));
app.use('/fotos_sedes_image', express.static(path.join(__dirname, 'src/fotos_sedes')));

app.get('*', (req, res) => res.status(200).send({
     message: 'Index.',
}));




const port = parseInt(process.env.PORT, 10) || 5000;
app.set('port', port);
const server = http.createServer(app);
server.listen(port, '0.0.0.0', () => {
     console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});
module.exports = app;