const express = require("express");
const router = express.Router();

// Servir archivos estáticos desde la carpeta "public"
router.use(express.static("public"));

module.exports = router;
