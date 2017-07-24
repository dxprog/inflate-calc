const calculateInflationAdjustedValue = require('./inflation-calculator');

const MIN_YEAR = 1913;

/**
 * Checks a value to see if it's an integer
 *
 * @param {number} val The value to check
 * @return {boolean} Whether the number is an integer or not
 */
function isInteger(val) {
  return Math.floor(val - 0) === val;
}

/**
 * Checks a value to see if its numeric
 *
 * @param {number} val The value to check
 * @return {boolean} Whether the number is numeric
 */
function isNumeric(val) {
  return val - 0 === val;
}

/**
 * Returns the current year
 */
function getCurrentYear() {
  return (new Date()).getFullYear();
}

/**
 * Checks to see if a year is valid and can have inflation calculated
 *
 * @param {number} year The year value to check
 * @return {boolean} Whether the year is valid
 */
function isYearValid(year) {
  return isInteger(year) && year >= MIN_YEAR && year <= getCurrentYear();
}

/**
 * Takes a number and converts it into a spoken monetary value
 * @param {number} value The value
 */
function convertNumberToMoneySpeak(value) {
  value = '' + value;
  const bits = value.split('.');
  let retVal = `${bits[0]} dollars`;
  if (bits.length === 2) {
    retVal += ` and ${bits[1]} cents`;
  }
  return retVal;
}

/**
 * Handles an incoming request and performs basic boilerplate checking
 * before running the conversion.
 *
 * @param {*} req The Alexa request
 * @param {*} inYear
 * @param {*} compareYear
 * @param {*} value
 */
function handleConversionRequest(req, inYear, compareYear, value) {
  // Validate the years
  const currentYear = getCurrentYear();
  if (!isYearValid(inYear) || !isYearValid(compareYear)) {
    req.emit('NeedValidYear');
    return false;
  }

  // Validate the value
  if (!isNumeric(value)) {
    req.emit('NeedValidValue');
    return false;
  }

  // Calculate the amount
  return calculateInflationAdjustedValue(inYear, compareYear, value);
}

module.exports = {
  'CurrentToYear': function() {
    const { year, value } = this.event.request.intent.slots;
    const adjustedValue = handleConversionRequest(this, parseInt(year.value), getCurrentYear(), parseFloat(value.value));
    if (adjustedValue) {
      this.emit(':tell', `${convertNumberToMoneySpeak(value.value)} was worth aproximately ${convertNumberToMoneySpeak(adjustedValue)} in ${year.value}.`);
    }
  },
  'YearToYear': function() {
    const { inyear, compareyear, value } = this.event.request.intent.slots;
    const adjustedValue = handleConversionRequest(this, parseInt(compareyear.value), parseInt(inyear.value), parseFloat(value.value));
    if (adjustedValue) {
      this.emit(':tell', `${convertNumberToMoneySpeak(value.value)} in ${inyear.value} was worth aproximately ${convertNumberToMoneySpeak(adjustedValue)} in ${compareyear.value}.`);
    }
  },
  'YearToCurrent': function() {
    const { year, value } = this.event.request.intent.slots;
    const adjustedValue = handleConversionRequest(this, getCurrentYear(), parseInt(year.value), parseFloat(value.value));
    if (adjustedValue) {
      this.emit(':tell', `${convertNumberToMoneySpeak(value.value)} in ${year.value} is worth aproximately ${convertNumberToMoneySpeak(adjustedValue)} today.`);
    }
  },
  'NeedValidYear': function() {
    this.emit(':tell', `Sorry, but I only have information for the years 1913 to ${getCurrentYear()}.`);
  },
  'NeedValidValue': function() {
    this.emit(':tell', `Sorry, but I didn't understand the amount to calculate.`);
  }
};