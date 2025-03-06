const moment = require("moment");

//  This is calculate duration  
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
}


module.exports = {
    durationFindFun,
    getPagination
}