const moment = require("moment");

const TimeFormat = "";
const MonthFormat = "MMM";
const DateFormat = 'DD/MM/YYYY';
const DateAndTimeFormat = "DD/MM/YYYY - HH:mm A";

// ----------------------------------------------------------------------

function fDate(date) {
  const DefaultDateFormat = localStorage.getItem('DefaultDateFormat') || DateFormat;

  return date ? moment(date).format(DefaultDateFormat) : 'N/A';
}

function fDateTime(date) {
  return date ? moment(date).format(DateAndTimeFormat) : 'N/A';
}

function fTimestamp(date) {
  return date ? moment(date).format(TimeFormat) : 'N/A';
}

function fToNow(date) {
  return date ? moment(date).format(MonthFormat) : 'N/A';
}

function fDateTime12hr(date) {
  const now = new Date(date);
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const displayHours = hours % 12 || 12;
  const time = `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  const amPm = hours >= 12 ? 'PM' : 'AM';

  return `${fDate(date)} ${time} ${amPm}`;
}

function fDateDuration(date) {
  const now = new Date(date);
  const hours = now.getHours();
  const minutes = now.getMinutes();


  let durEn = '';
  let durGu = '';

  if (hours >= 1 && hours < 5) { // Midnight (1 AM to 5 AM)
    durGu = 'મધ્યરાત્રિ';
    durEn = 'Midnight';
  } else if (hours >= 5 && hours < 8) { // Early Morning (5 AM to 8 AM)
    durGu = 'વહેલી સવારે';
    durEn = 'Early Morning';
  } else if (hours >= 8 && hours < 13) { // Morning (8 AM to 1 PM)
    durGu = 'સવારે';
    durEn = 'Morning';
  } else if (hours >= 13 && hours < 17) { // Noon (1 PM to 5 PM)
    durGu = 'બપોરે';
    durEn = 'Noon';
  } else if (hours >= 17 && hours < 22) { // Evening (5 PM to 10 PM)
    durGu = 'સાંજ';
    durEn = 'Evening';
  } else if (hours >= 22 || hours < 1) { // Night (10 PM to 1 AM)
    durGu = 'રાત્રે';
    durEn = 'Night';
  }

  const displayHours = hours % 12 || 12;
  const time = `${displayHours}:${minutes.toString().padStart(2, '0')} `;

  return {
    date: fDate(date),
    time,
    durGu,
    durEn,
    stringEn: `${fDate(date)} ${time} ${durGu} `,
    stringGu: ``
  };
}

module.exports = {
  fDate,
  fToNow,
  fDateTime,
  fTimestamp,
  fDateTime12hr,
  fDateDuration,
}