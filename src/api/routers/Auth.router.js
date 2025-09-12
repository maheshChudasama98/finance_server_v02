const authController = require("../services/Auth.Services");

module.exports = (app) => {
    app.post("/api/login", authController.LoginService);
    app.post("/api/singup", authController.SignupService);
    app.post("/api/forgot-Password", authController.ForgotPasswordService);
    app.post("/api/reset-Password", authController.ResetPasswordService);

    // ------------ || Base on project  || ------------ //
}