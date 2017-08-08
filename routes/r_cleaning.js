'use strict';

//const LoginService = require('qcloud-weapp-server-sdk').LoginService;

var findDocuments = function(db,callback,circm){
    var coll = db.collection(circm.tbnm);
    coll.find(circm.where,circm.sel).toArray(function (err, docs) {
        //assert.equal(err,null);
        console.log('Found the following records');
        console.log(docs);
        callback(docs);
    });
};

var insertDocuments = function(db,callback,circm) {
    var coll = db.collection(circm.tbnm);
    coll.insertMany(circm.insertdt, function (err, result) {
        //assert.equal(err, null);
        //assert.equal(circm.insertdt.length, result.result.n); //result包括了result的document
        //assert.equal(circm.insertdt.length, result.ops.length); //ops是包括了_id的document
        console.log('Inserted  documents into the '+circm.tbnm);
        console.log('Inserted  documents into the '+result);
        callback(result);

    });
};

module.exports = (req, res) => {

    console.log('---------------1');
    console.log(JSON.stringify(req.query));
    console.log('---------------2');
//console.log(req.cltp-radio-group);

    var MongoClient = require('mongodb').MongoClient
//,assert = require('assert');

    var url = 'mongodb://100td:27117/test';
    MongoClient.connect(url,function (err,db) {
        console.log("Connection successfully to server");

        var circm = {
            tbnm:'userc',
            sel:{'username':1,'name':1,'email':1,'_id':0},
            where:{name:/a/},
            insertdt:[{name: '王雪', email: 'aa23a@aaa.com'},
                {name: 'a2bb', email: '3@bbb.com'},
                {name: 'cc3c', email: 'c3cc@ccc.com'}],
            updatedt:{$set:{email:'sh_ek@126.com'}},
            deletedt:{name:/王雪/}
        };


        insertDocuments(db,function () {
            db.close();
        },circm);
    });

};