require("dotenv").config(); // evn file Database details

module.exports = async (emailMessage) => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
		const info = await transporter.sendMail(emailMessage);
		return info.response;
	} catch (error) {
		throw error;
	}
};
