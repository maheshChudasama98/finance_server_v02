const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UserProfileUpload = async (payloadFile, uuid, oldFile) => {
    try {
        const uploadDir = path.join(__dirname, '../../public/profiles', uuid);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (fs.existsSync(path.join(uploadDir, oldFile))) {
            fs.unlink(path.join(uploadDir, oldFile), (err) => { });
        }
        const fileExtension = path.extname(payloadFile.name);

        const folderName = uuidv4();
        const newFileName = `${folderName}${fileExtension}`;

        const uploadPath = path.join(uploadDir, newFileName);
        await payloadFile.mv(uploadPath, (err) => { });

        if (fs.existsSync(path.join(uploadDir, oldFile))) {
            fs.unlink(path.join(uploadDir, oldFile), (err) => { });
        }

        return newFileName

        // if (payloadFile?.profile) {
        //     const folderName = uuidv4();
        //     const uploadDir = await path.join(__dirname, '../../../public/profiles', folderName);

        //     if (!fs.existsSync(uploadDir)) {
        //         fs.mkdirSync(uploadDir, { recursive: true });
        //     }

        //     if (UUID) {
        //         const removeDir = await path.join(__dirname, '../../../public/profiles', UUID);
        //         if (fs.existsSync(removeDir)) {
        //             fs.rm(removeDir, { recursive: true, force: true }, (err) => { });
        //         }
        //     }

        //     const uploadedFile = payloadFile.profile;
        //     const fileExtension = path.extname(uploadedFile.name);
        //     const newFileName = `profile${findUser?.User_Id}${fileExtension}`;
        //     const uploadPath = path.join(uploadDir, newFileName);
        //     uploadedFile.mv(uploadPath, (err) => { });

        //     UserImgPath = newFileName
        //     UUID = folderName

        // }

    } catch (error) {
        return false
    }
};

const BranchLogoUpload = async (payloadFile, uuid, oldFile) => {
    try {
        const uploadDir = path.join(__dirname, '../../public/branches', uuid);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (fs.existsSync(path.join(uploadDir, oldFile))) {
            fs.unlink(path.join(uploadDir, oldFile), (err) => { });
        }
        const fileExtension = path.extname(payloadFile.name);

        const folderName = uuidv4();
        const newFileName = `${folderName}${fileExtension}`;

        const uploadPath = path.join(uploadDir, newFileName);
        await payloadFile.mv(uploadPath, (err) => { });

        if (fs.existsSync(path.join(uploadDir, oldFile))) {
            fs.unlink(path.join(uploadDir, oldFile), (err) => { });
        }

        return newFileName

    } catch (error) {
        return false
    }
};

module.exports = {
    UserProfileUpload,
    BranchLogoUpload
};