var mongojs = require('mongojs');

var databaseUrl = 'mongodb://localhost/integration';
var collections = ['SensorData'];
var option = {"auth":{"user":"8eeup","password":"tgr2019"}};
var connect = mongojs(databaseUrl, collections, option);

module.exports = {
    connect: connect
};
