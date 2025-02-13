// Importar librería
require("dotenv").config({ path: './config.env' });
const express = require("express");
const path = require("path");

// Objetos para llamar los métodos de express
const app = express();

// Variables de entorno
const backendUrl = process.env.BACKEND_URL;
console.log("URL del Backend: ", backendUrl);
/*
//Evitando problemas de CORS(Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://192.168.1.8:8080');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true'); 
    next();
});
*/



// Ruta para la página inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// Ruta de archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta para servir las variables de entorno
app.get("/env.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`window.env = { BACKEND_URL: "${backendUrl}" };`);
});

app.use((req, res, next) => {
    console.log(`Request: ${req.url}`);
    next();
});

//Borrando cache
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
});

// Configuramos el puerto para nuestro servidor local
app.listen(8080, function () {
    console.log("Servidor iniciado correctamente. Ingrese a http://192.168.1.8:8080");
});