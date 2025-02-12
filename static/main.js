// Importar librería
require("dotenv").config({ path: './config.env' });
const express = require("express");
const path = require("path");

// Objetos para llamar los métodos de express
const app = express();

// Variables de entorno
const backendUrl = process.env.BACKEND_URL;
console.log("URL del Backend: ", backendUrl);

//Evitando problemas de CORS(Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', backendUrl);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true'); 
    next();
});

// Ruta para la página inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Ruta para servir las variables de entorno
app.get("/env.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`window.env = { BACKEND_URL: "${backendUrl}" };`);
});

// Ruta de archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Configuramos el puerto para nuestro servidor local
app.listen(8080, function () {
    console.log("Servidor iniciado correctamente. Ingrese a http://localhost:8080");
});