const moment = require("moment");

//  This is calculate duration  
const durationFindFun = async (duration, SelectDate) => {
    const CurrentDate = SelectDate ? new Date(SelectDate) : new Date();
    const date = new Date(CurrentDate)
    const currentYear = CurrentDate.getFullYear();
    let start, end
    switch (duration) {
        case "Week":
            const dayOfWeek = date.getDay();
            start = new Date(date.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))).toLocaleDateString('en-CA')
            end = new Date(date.setDate(date.getDate() + (9 - dayOfWeek))).toLocaleDateString('en-CA');
            break;
        case "One Month":
            start = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-CA');
            end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString('en-CA');
            break;
        case "Six Months":
            start = new Date(date.getFullYear(), -1).toLocaleDateString('en-CA');
            end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString('en-CA');
            break;
        case "One Year":
            start = new Date(currentYear, 0, 1).toLocaleDateString('en-CA');
            end = new Date(currentYear, 11, 31).toLocaleDateString('en-CA');
            break;
        case "Five Years":
            start = new Date(currentYear - 5, 0, 1).toLocaleDateString('en-CA');
            end = new Date(currentYear, 11, 31).toLocaleDateString('en-CA');
            break;
        default:
            break;
    }
    return ({ StartDate: moment(start).format("YYYY-MM-DD"), EndDate: moment(end).format("YYYY-MM-DD") })
}

const getPagination = (page, size) => {
    page = parseInt(page) || 1;
    const pageSize = parseInt(size) || 10;
    const offset = (page - 1) * pageSize;
    return { limit: pageSize, offset: offset };
}


module.exports = {
    durationFindFun,
    getPagination
}