const { PasswordRegex } = require("../api/constants/constants");
const db = require("../api/models/index");
const OrgUsersModel = db.OrgUsersModel;

const moment = require("moment");

const durationFindFun = async (duration, SelectDate) => {
    const CurrentDate = SelectDate ? new Date(SelectDate) : new Date();
    const date = new Date(CurrentDate);
    const currentYear = CurrentDate.getFullYear();
    let start, end;

    switch (duration) {
        case "Last_Seven_Days":
            start = new Date(date.setDate(date.getDate() - 6)).toLocaleDateString('en-CA');
            end = new Date().toLocaleDateString('en-CA');
            break;

        case "Last_Thirty_Days":
            start = new Date(date.setDate(date.getDate() - 30)).toLocaleDateString('en-CA');
            end = new Date().toLocaleDateString('en-CA');
            break;

        case "This_Week":
            const dayOfWeek = date.getDay();
            start = new Date(date.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))).toLocaleDateString('en-CA')
            end = new Date(date.setDate(date.getDate() + (9 - dayOfWeek))).toLocaleDateString('en-CA');
            break;

        case "Last_Week":
            const lastWeekStartDate = new Date(date.setDate(date.getDate() - date.getDay() - 6));
            const lastWeekEndDate = new Date(date.setDate(lastWeekStartDate.getDate() + 6));
            start = lastWeekStartDate.toLocaleDateString('en-CA');
            end = lastWeekEndDate.toLocaleDateString('en-CA');
            break;

        case "This_Month":
            start = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-CA');
            end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString('en-CA');
            break;

        case "Last_Month":
            start = new Date(date.getFullYear(), date.getMonth() - 1, 1).toLocaleDateString('en-CA');
            end = new Date(date.getFullYear(), date.getMonth(), 0).toLocaleDateString('en-CA');
            break;

        case "Six_Month":
            start = new Date(date.getFullYear(), date.getMonth() - 5, 1).toLocaleDateString('en-CA');
            end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString('en-CA');
            break;

        case "This_Year":
            start = new Date(currentYear, 0, 1).toLocaleDateString('en-CA');
            end = new Date(currentYear, 11, 31).toLocaleDateString('en-CA');
            break;

        case "Last_Year":
            start = new Date(currentYear - 1, 0, 1).toLocaleDateString('en-CA');
            end = new Date(currentYear - 1, 11, 31).toLocaleDateString('en-CA');
            break;

        case "Last_Five_Year":
            start = new Date(currentYear - 5, 0, 1).toLocaleDateString('en-CA');
            end = new Date(currentYear, 11, 31).toLocaleDateString('en-CA');
            break;

        default:
            throw new Error("Invalid duration specified");
    }

    return {
        StartDate: moment(start).format("YYYY-MM-DD"),
        EndDate: moment(end).format("YYYY-MM-DD")
    };
};

const getPagination = (page, size) => {
    page = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const offset = (page - 1) * pageSize;
    return { limit: pageSize, offset: offset };
};

const generatePassword = (length = 12) => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '#?@$%&';

    let password =
        upper[Math.floor(Math.random() * upper.length)] +
        lower[Math.floor(Math.random() * lower.length)] +
        numbers[Math.floor(Math.random() * numbers.length)] +
        special[Math.floor(Math.random() * special.length)];

    const allChars = upper + lower + numbers + special;
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    return PasswordRegex.test(password) ? password : generatePassword(length);
};

const defaultOrgSetAction = async (UserId, OrgUserId) => {
    await OrgUsersModel.update({
        DefaultOrg: false
    }, {
        where: {
            UserId: UserId
        }
    });

    await OrgUsersModel.update({
        DefaultOrg: true
    }, {
        where: {
            OrgUserId: OrgUserId
        }
    });

    return true;
};

const orgSetAdminAction = async (BranchId, OrgId) => {
    await OrgUsersModel.create({
        UserId: 1,
        RoleId: 1,
        BranchId: BranchId,
        OrgId: OrgId
    },);
    return true;
};

module.exports = {
    durationFindFun,
    getPagination,
    generatePassword,
    defaultOrgSetAction,
    orgSetAdminAction,
}