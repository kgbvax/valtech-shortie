﻿var Datastore = require('nedb');
var mongodb = require('mongodb');

var MONGO_URL = 'mongodb://127.0.0.1:27017/valtech_shorties?w=1';

function create(type, options, callback) {
    switch (type) {
        case 'nedb':
            process.nextTick(function () {
                var inMemoryDb = new Datastore(options);
                inMemoryDb.ensureIndex({ field: 'slug', unique: true });
                callback(null, inMemoryDb);
            });
            break;
        case 'mongodb':
            mongodb.MongoClient.connect(MONGO_URL, function (err, db) {
                if (err)
                    return callback(err);
                var shortiesCollection = db.collection('shorties');
                callback(null, shortiesCollection);
            });
            break;
    }
}
exports.create = create;
