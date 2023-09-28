module.exports = (app)=>{
    const user_controller = require("../controllers/user.controller");
    var router = require("express").Router();
    router.get("/:us", user_controller.validUsername);
    //router.post("/signup", user_controller.createNewUser);
    //router.post("/login", user_controller.login);
    //router.get("/", authJwt, user_controller.getAllUsers);
    //router.put("/:id", authJwt, user_controller.updateUserCtrl);
    app.use("/api/auth", router);
};