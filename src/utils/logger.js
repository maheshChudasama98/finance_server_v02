const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, {recursive: true});
}

// Define log format
const logFormat = winston.format.combine(
	winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
	winston.format.errors({stack: true}),
	winston.format.json()
);

// Define log format for console (more readable)
const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
	winston.format.printf(({timestamp, level, message, ...meta}) => {
		let msg = `${timestamp} [${level}]: ${message}`;
		if (Object.keys(meta).length > 0) {
			msg += ` ${JSON.stringify(meta)}`;
		}
		return msg;
	})
);

// Create separate transports for each log type
const loginLogTransport = new winston.transports.File({
	filename: path.join(logsDir, "login-log.log"),
	level: "info",
	format: logFormat,
	maxsize: 5242880, // 5MB
	maxFiles: 10,
});

const apiLogTransport = new winston.transports.File({
	filename: path.join(logsDir, "api-log.log"),
	level: "info",
	format: logFormat,
	maxsize: 5242880, // 5MB
	maxFiles: 10,
});

const errorLogTransport = new winston.transports.File({
	filename: path.join(logsDir, "error-log.log"),
	level: "error",
	format: logFormat,
	maxsize: 5242880, // 5MB
	maxFiles: 10,
});

// Create loggers
const loginLogger = winston.createLogger({
	transports: [
		loginLogTransport,
		// No console logging - only file logging
	],
});

const apiLogger = winston.createLogger({
	transports: [
		apiLogTransport,
		// No console logging - only file logging
	],
});

const errorLogger = winston.createLogger({
	transports: [
		errorLogTransport,
		// Always log errors to console
		new winston.transports.Console({format: consoleFormat}),
	],
});

// Helper function to get client IP address
const getClientIp = (req) => {
	return (
		req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
		req.headers["x-real-ip"] ||
		req.connection?.remoteAddress ||
		req.socket?.remoteAddress ||
		req.ip ||
		"unknown"
	);
};

// Login Logger Functions
exports.logLogin = (req, userInfo, success, message, error = null) => {
	const ip = getClientIp(req);
	const logData = {
		timestamp: new Date().toISOString(),
		ip: ip,
		user_name: req.body?.user_name || "N/A",
		user_id: userInfo?.user_id || null,
		user_email: userInfo?.email || null,
		user_phone: userInfo?.phone || null,
		success: success,
		message: message,
		user_agent: req.headers["user-agent"] || "N/A",
		...(error && {error: error.message || error, stack: error.stack}),
	};

	if (success) {
		loginLogger.info("Login Success", logData);
	} else {
		loginLogger.warn("Login Failed", logData);
	}
};

// API Logger Functions
exports.logApiCall = (req, res, responseTime = null) => {
	const ip = getClientIp(req);
	const logData = {
		timestamp: new Date().toISOString(),
		method: req.method,
		url: req.originalUrl || req.url,
		path: req.path,
		ip: ip,
		user_id: req.user?.user_id || null,
		user_email: req.user?.email || null,
		user_uuid: req.user?.user_uuid || null,
		status_code: res.statusCode || null,
		response_time: responseTime ? `${responseTime}ms` : null,
		user_agent: req.headers["user-agent"] || "N/A",
		query_params: Object.keys(req.query).length > 0 ? req.query : null,
	};

	// Log based on status code
	if (res.statusCode >= 500) {
		apiLogger.error("API Error", logData);
	} else if (res.statusCode >= 400) {
		apiLogger.warn("API Warning", logData);
	} else {
		apiLogger.info("API Call", logData);
	}
};

// Error Logger Functions
exports.logError = (error, req = null, additionalInfo = {}) => {
	const ip = req ? getClientIp(req) : "N/A";
	const logData = {
		timestamp: new Date().toISOString(),
		error: error.message || "Unknown error",
		stack: error.stack || null,
		ip: ip,
		url: req?.originalUrl || req?.url || "N/A",
		method: req?.method || "N/A",
		user_id: req?.user?.user_id || null,
		user_email: req?.user?.email || null,
		...additionalInfo,
	};

	errorLogger.error("Error Occurred", logData);
};

// General logger for other purposes
exports.logInfo = (message, meta = {}) => {
	apiLogger.info(message, meta);
};

exports.logWarning = (message, meta = {}) => {
	apiLogger.warn(message, meta);
};



