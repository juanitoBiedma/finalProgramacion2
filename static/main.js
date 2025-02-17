// Importar librería
require("dotenv").config({ path: "./config.env" });
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Objetos para llamar los métodos de express
const app = express();

// Cargar el certificado SSL
const options = {
  key: fs.readFileSync("./certs/key.pem"),
  cert: fs.readFileSync("./certs/cert.pem"),
};

// Variables de entorno
const backendUrl = process.env.BACKEND_URL;
console.log("URL del Backend: ", backendUrl);

// Ruta para la página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/login.html"));
});

// Ruta de archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

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
https.createServer(options, app).listen(3000, () => {
  console.log(
    "Servidor iniciado correctamente. Ingrese a https://192.168.1.3:3000"
  );
});
