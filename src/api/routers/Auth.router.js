const authController = require("../services/Auth.Services");

module.exports = (app) => {
    app.post("/api/login", authController.LoginService);
    app.post("/api/forgot-Password", authController.ForgotPasswordService);
    app.post("/api/reset-Password", authController.ResetPasswordService);
    app.post("/api/user/registration", authController.UserRegistrationService);

    // ------------ || Base on project  || ------------ //
}