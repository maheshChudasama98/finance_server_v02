const fs = require("fs");
const path = require("path");

module.exports = (process, envArg) => {
	if (envArg?.includes("env:")) {
		const envValue = envArg.split("env:")[1];
		let envFileName = `.env.${envValue}`;

		const sourcePath = path.join(process.cwd(), envFileName);
		const destinationPath = path.join(process.cwd(), ".env");

		if (!fs.existsSync(sourcePath)) {
			console.log(`\x1b[91mEnvironment file path for ${envFileName} is not defined in environment variables.\x1b[91m`);
			process.exit(1);
		}
		if (!fs.existsSync(destinationPath)) {
			console.log(`\x1b[91mEnvironment file path for ${destinationPath} is not defined in environment variables.\x1b[91m`);
			process.exit(1);
		}

		fs.copyFile(sourcePath, destinationPath, (err) => {
			if (err) {
				console.log("\x1b[91mFailed to copy file: \x1b[91m", err.message);
				process.exit(1);
			}
			console.log(`\x1b[92mEnvironment file copied\x1b[39m `);
		});
	} else {
		console.log("\x1b[91m'env:' not found! \x1b[91m");
		process.exit(1);
	}
};
