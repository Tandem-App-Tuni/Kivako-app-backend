const apiRoute = require('./apis');

const init = (server) => 
{
    server.use('/api', apiRoute);
}
module.exports = {
    init: init
};