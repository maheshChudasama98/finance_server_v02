require("dotenv").config();
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const {decode} = require("entities");
const {readFile} = require("fs/promises");
const nodemailer = require("nodemailer");

const {ProjectName, resetLink} = require("../api/constants/constants");

const db = require("../api/models/index");
const EmailsmsModel = db.EmailsmsModel;

const emailFormat = async (details) => {
	try {
		const emailMessage = {
			from: `${ProjectName} <${process.env.EMAIL_USER}>`,
			to: `${details?.to}`,
			subject: details?.subject,
			html: `
            <div style="background-color: #fff; margin-ton: 10px ; width : 100%; border-radius: 8px;" >
                <div style="max-width:600px ; margin:0 auto; border-color:#e5e5e5; border-style :solid ; border-width :0 1px 1px 1px;">
                    <div style="background-color: #4CAF50 ;font-size:1px;height:3px"> </div>
                        <div style="margin:50px 20px 50px 20px">
                            ${details?.description}
                        </div>
                    </div>
                </div>
            </div>
            `,
		};
		const response = await emailSendHelper(emailMessage);
		return response;
	} catch (error) {
		throw error;
	}
};

const emailSendHelper = async (emailMessage) => {
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
		console.log(`At email send error :- ${error}`);
		throw error;
	}
};

const emailForgetPasswordSendOTP = async (details) => {
	try {
		const emailMessage = {
			from: `${process.env.PROJECT_NAME} <${process.env.EMAIL_USER}>`,
			to: `${details.to}`,
			subject: `Forgot Password`,
			html: `
        <div style="background-color: #f5f5f5; margin-ton: 10px ; width : 100%; >
        <table border="0" cellpadding="0" cellspacing="0"  style="max-width:600px ; margin:0 auto">
            <tbody>
                <tr>
                    <td align="center" valign="top">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard"
                            style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                            <tbody>
                                <tr>
                                    <td style="background-color:${process.env.PROJECT_THEME_COLOR};font-size:1px;line-height:3px" class="topBorder"
                                        height="3">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style=" padding-top: 60px; padding-bottom: 5px; padding-left: 20px; padding-right: 20px;"
                                        align="center" valign="top" class="mainTitle">
                                        <h2 class="text"
                                            style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">
                                            Dear  ${details.firstName} ${details?.lastName} </h2>
                                    </td >
                                </tr >
                                <tr>
                                    <td style="padding-bottom: 30px;  padding-left: 20px; padding-right: 20px;"
                                        align="center" valign="top" class="subTitle">
                                        <h4 class="text"
                                            style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">
                                    OTP Verification </h4>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-left:20px;padding-right:20px" align="center" valign="top"
                                        class="containtTable ui-sortable">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                            class="tableDescription" style="">
                                            <tbody>
                                                <tr>
                                                    <td style="padding-bottom: 20px;" align="center" valign="top"
                                                        class="description">
                                                        <p class="text"
                                                            style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">
                                                            This OTP is valid for the next 15 minutes. If you did not request a password reset, please ignore this email.</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton"
                                            style="padding-bottom: 50px;">
                                            <tbody>
                                                <tr>
                                                    <td style="padding-top:20px;padding-bottom:20px" align="center"
                                                        valign="top">
                                                        <table border="0" cellpadding="0" cellspacing="0" align="center">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="background-color: ${process.env.PROJECT_THEME_COLOR}; padding: 12px 35px; border-radius: 50px;"
                                                                        align="center" class="ctaButton"> <a href="#"
                                                                            style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-transform:uppercase;text-decoration:none;display:block"
                                                                            target="_blank" class="text">${details?.optNumber}</a>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody >
                        </table >
                    </td >
                </tr >
            </tbody >
        </table >
        </div >
`,
		};
		const response = await emailSendHelper(emailMessage);
		return response;
	} catch (error) {
		throw error;
	}
};

const getHtml = async (filePath, data = false) => {
	try {
		if (!fs.existsSync(filePath)) {
			return null;
		}

		let result = await readFile(filePath, "utf8");

		if (data && Object.entries(data).length > 0) {
			for (const [key, value] of Object.entries(data)) {
				result = result.replace(new RegExp(`\\{${key}}`, "g"), value);
			}
		}

		return result;
	} catch (error) {
		return error;
	}
};

const emailHelper = async (content, subject, title, to, attachments, ...other) => {
	try {
		const htmlManagement = await getHtml(path.join(__dirname, "../templates/main.html"), {
			title: title,
			content: content,
			current_time: moment(new Date()).format("YYYY"),
		});

		const emailMessage = {
			from: `${process.env.PROJECT_NAME} <${process.env.EMAIL_USER}>`,
			to: `${to}`,
			subject: subject,
			html: htmlManagement,
			attachments: attachments,
		};

		const transporter = nodemailer.createTransport({
			host: "smtp.mailtrap.io",
			port: 587,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		const info = transporter.sendMail(emailMessage);
		return info.response;
	} catch (error) {
		console.log(`At email send error :- ${error}`);
		throw error;
	}
};

const serverRestarted = async () => {
	const find = await EmailsmsModel.findOne({
		where: {Slug: "server_restarted"},
		raw: true,
	});

	let decodeContent = decode(find.Content);
	const data = moment(new Date()).format("DD/MM/YYYY - HH:mm A");

	const emailContent = decodeContent
		.replace(/\{__RestartedTime__}/g, data)
		.replace(/\{__ProjectName__}/g, process.env.PROJECT_NAME)
		.replace(/\{__ServerPort__}/g, process.env.PORT)
		.replace(/\{__DatabaseName__}/g, process.env.DATABASE_COLLECTION)
		.replace(/\{__DefaultUrl__}/g, process.env.PROJECT_API_URL);

	await emailHelper(emailContent, find?.Subject, find?.Title, process.env.MAIN_USER_EMAIL);
};

const serverDownRestarted = async () => {
	const find = await EmailsmsModel.findOne({
		where: {Slug: "server_down"},
		raw: true,
	});

	let decodeContent = decode(find.Content);
	const data = moment(new Date()).format("DD/MM/YYYY - HH:mm A");
	const statusCode = 504;
	const errorMessage = "Gateway Timeout - Server not responding";

	const emailContent = decodeContent
		.replace(/\{__DownTime__}/g, new Date().toLocaleString())
		.replace(/\{__ProjectName__}/g, process.env.PROJECT_NAME)
		.replace(/\{__ServerPort__}/g, process.env.PORT)
		.replace(/\{__DatabaseName__}/g, process.env.DATABASE_COLLECTION)
		.replace(/\{__DefaultUrl__}/g, process.env.PROJECT_API_URL)
		.replace(/\{__StatusCode__}/g, statusCode)
		.replace(/\{__ErrorMessage__}/g, errorMessage);

	await emailHelper(emailContent, find?.Subject, find?.Title, process.env.MAIN_USER_EMAIL);
};

const registrationUser = async (firstName, lastName, email, password) => {
	const find = await EmailsmsModel.findOne({
		where: {Slug: "registration"},
		raw: true,
	});

	let decodeContent = decode(find.Content);

	const emailContent = decodeContent
		.replace(/\{__FirstName__}/g, firstName)
		.replace(/\{__LastName__}/g, lastName)
		.replace(/\{__UserEmail__}/g, email)
		.replace(/\{__TemporaryPassword__}/g, password)
		.replace(/\{__LoginLink__}/g, resetLink);

	await emailHelper(emailContent, find?.Subject, find?.Title, email);
};

module.exports = {
	emailSendHelper,
	emailFormat,
	emailForgetPasswordSendOTP,
	emailHelper,
	serverRestarted,
	serverDownRestarted,
	registrationUser,
};
