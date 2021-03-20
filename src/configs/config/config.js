const _ = require('lodash');
// const env = process.env.NODE_ENV || 'local';
// const envConfig = require('./' + env);
const change = 'fake';
// let defaultConfig = {
//   env: env
// };
module.exports = _.merge(change, change);