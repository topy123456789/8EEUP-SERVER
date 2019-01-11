var mongojs = require('mongojs');

var databaseUrl = 'mongodb://localhost/integration';
var collections = ['SensorData'];
var option = {"auth":{"user":"query","password":"09"}};
var connect = mongojs(databaseUrl, collections, option);

module.exports = {
    connect: connect
};
