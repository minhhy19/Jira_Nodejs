const { MongoClient } = require('mongodb');
var mongodb = require('mongodb');
var url = 'mongodb://localhost:27017'; // đường dẫn database
var opt = { useUnifiedTopology: true }; // khai báo để tránh lỗi
var dataBase = 'CyberSoft';

exports.getId = (id) => {
	return mongodb.ObjectId(id);
}

exports.getNewId = () => {
    return mongodb.ObjectId();
}

exports.fetchAll = async (table) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db = client.db(dataBase); //khi co  tin hieu thi 
	var a = await db.collection(table).find().toArray();
	await client.close();
	return a;
}

exports.add = async(table, o) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db = client.db(dataBase); //khi co  tin hieu thi 
    var ret = await db.collection(table).insertOne(o); // mo member va insert 1 oject
    await client.close();
    return ret;
}

exports.edit = async(table, id, o) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db =client.db(dataBase); //khi co  tin hieu thi 
    var ret = await db.collection(table).updateOne({_id: mongodb.ObjectId(id)}, {$set: o}); // mo member va insert 1 oject
    await client.close();
    return ret;
}

exports.editAll = async(table, o) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db =client.db(dataBase); //khi co  tin hieu thi 
    var ret = await db.collection(table).updateMany({}, {$set: o}); // mo member va insert 1 oject
    await client.close();
    return ret.result;
}

exports.fetchOne = async(table, id) => {
    var hex = /[0-9A-Fa-f]{6}/g; // kiểm tra có đúng định dạng id hay k?
    id = (hex.test(id)) ? mongodb.ObjectId(id) : mongodb.ObjectId();
	var client = new MongoClient(url, opt); //tao bien doi ket noi
	await client.connect();
    var db = client.db(dataBase); //khi co  tin hieu thi 
    var a = await db.collection(table).findOne({_id: id});
    await client.close();
	return a;
}

exports.delete = async(table, id) => {
    var hex = /[0-9A-Fa-f]{6}/g; // kiểm tra có đúng định dạng id hay k?
    id = (hex.test(id)) ? mongodb.ObjectId(id) : mongodb.ObjectId();
    var client = new MongoClient(url, opt); //tao bien doi ket noi
	await client.connect();
    var db =client.db(dataBase); //khi co  tin hieu thi 
    var ret = await db.collection(table).deleteOne({_id: id}); // mo member va insert 1 oject
    await client.close();
    return ret;
}

//============================================================================================================
// USER
exports.fetchByEmail = async(table, email) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db = client.db(dataBase); //khi co  tin hieu thi 
    var a = await db.collection(table).findOne({email: email});
    await client.close();
    return a;
}

// exports.fetchNameById = async(table, id) => {
//     var hex = /[0-9A-Fa-f]{6}/g; // kiểm tra có đúng định dạng id hay k?
//     id = (hex.test(id)) ? mongodb.ObjectId(id) : mongodb.ObjectId();
// 	var client = new MongoClient(url, opt); //tao bien doi ket noi
// 	await client.connect();
//     var db = client.db(dataBase); //khi co  tin hieu thi 
//     var a = await db.collection(table).findOne({_id: id});
//     await client.close();
// 	return a;
// }

//================================================================================================================
exports.fetchTokenByIdUser = async(table, idUser) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db = client.db(dataBase); //khi co  tin hieu thi 
    var a = await db.collection(table).findOne({idUser: idUser});
    await client.close();
    return a;
}

exports.fetchTokenByRefreshToken = async(table, token) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db = client.db(dataBase); //khi co  tin hieu thi 
    var a = await db.collection(table).findOne({value: token});
    await client.close();
    return a;
}

exports.fetchTokenByRefreshTokenArray = async(table, token) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db = client.db(dataBase); //khi co  tin hieu thi 
    var a = await db.collection(table).findOne({value: { $all: [token] }});
    await client.close();
    return a;
}

exports.updateTokenByIdUser = async(table, idUser, o) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
    await client.connect();
    var db =client.db(dataBase); //khi co  tin hieu thi 
    var ret = await db.collection(table).updateOne({idUser: idUser}, {$set: o}); // mo member va insert 1 oject
    await client.close();
    return ret;
}

exports.deleteTokenByUserId = async(table, idUser) => {
    var client = new MongoClient(url, opt); //tao bien doi ket noi
	await client.connect();
    var db = client.db(dataBase);
    var ret = await db.collection(table).deleteOne({idUser: idUser}); 
    await client.close();
    return ret;
}