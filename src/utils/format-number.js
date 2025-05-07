const numeral = require("numeral");


// ----------------------------------------------------------------------

module.exports = function fNumber(number) {
  return numeral(number).format();
}

function fCurrency(number) {
  const format = number ? numeral(number).format('$0,0.00') : '';

  return result(format, '.00');
}

function fPercent(number) {
  const format = number ? numeral(Number(number) / 100).format('0.0%') : '';

  return result(format, '.0');
}

function fShortenNumber(number) {
  const format = number ? numeral(number).format('0.00a') : '';

  return result(format, '.00');
}

function fData(number) {
  const format = number ? numeral(number).format('0.0 b') : '';

  return result(format, '.0');
}

function result(format, key = '.00') {
  const isInteger = format.includes(key);

  return isInteger ? format.replace(key, '') : format;
}

function formatToINR(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return 'Invalid input';

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: "INR",
    minimumFractionDigits: 0,
  });

  return formatter.format(number).replace('₹', '₹ ');
}

module.exports = {
  fData,
  result,
  fPercent,
  fCurrency,
  fShortenNumber,
  formatToINR,
}