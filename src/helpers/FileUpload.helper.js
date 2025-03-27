const fs = require("fs");
const path = require("path");
const {v4: uuidv4} = require("uuid");

const FileUpload = async (payloadFile, uuid, rootFolder, oldFile) => {
	try {
		const uploadDir = path.join(__dirname, "../../public", rootFolder, uuid);
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, {recursive: true});
		}

		if (oldFile && fs.existsSync(path.join(uploadDir, oldFile))) {
			fs.unlink(path.join(uploadDir, oldFile), (err) => {});
		}

		const fileExtension = path.extname(payloadFile.name);

		const folderName = uuidv4();
		const newFileName = `${folderName}${fileExtension}`;

		const uploadPath = path.join(uploadDir, newFileName);

		await payloadFile.mv(uploadPath, (err) => {});

		return newFileName;
	} catch (error) {
		throw error;
	}
};

module.exports = {FileUpload};
