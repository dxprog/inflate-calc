const inflationData = require('../data/cpi-data');

/**
 * Calcaultes inflation for a monetary value between two years
 *
 * @param {number} inYear The year that the value is in
 * @param {number} compareYear The year to compare the value to
 * @param {number} value The value to calculate
 */
module.exports = function calculateInflationAdjustedValue(inYear, compareYear, value) {
  const inflationAmount = inflationData[compareYear] / inflationData[inYear];
  value *= 100;
  value /= inflationAmount;
  value = Math.round(value) / 100;
  return value;
}