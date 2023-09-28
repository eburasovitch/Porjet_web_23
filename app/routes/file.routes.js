module.exports = app => {
    const file_controller = require("../controllers/file.controllers");
    var router = require("express").Router();
    router.post("/upload", file_controller.uploadController);
    app.use("/api/file", router);
};