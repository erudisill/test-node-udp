var config = require("./config");
var dgram = require("dgram");
var parserExec = require("packet").createParser();
var mongo = require('mongodb').MongoClient;
var fibrous = require('fibrous');


// MONGO SETUP
var db = null;
mongo.connect(config.mongo.url, function(err, _db) {
	if (err)
		throw err;
	console.log('connected to bitstorm db');
	db = _db;
});


// PARSER SETUP

parserExec.packet("__header",  "b8[8]|ascii() => accountId, 			\
								b8 => control,							\
								b8 => sequence,							\
								b8 => version,							\
								b8 => category,							\
								b8[2] => reserved						\
								");
							
parserExec.packet("proto_A", "b8[10]|ascii() => status");
parserExec.packet("proto_B", "b8[10]|ascii() => currentStatus");


// SERVER FUNCTIONS

var server = dgram.createSocket("udp4");

server.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});


server.on("message", function (msg, rinfo) {
	console.log(handleMessage);
	handleMessage.sync(msg, rinfo);
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});


server.bind(1973);

// DOES NOT WORK - Throws fibrous error "Fibrous expects callback"
/*
var handleMessage = fibrous(function(msg, rinfo) {
	var parser = parserExec.createParser();
	parser.extract("__header", function (record) {
		db.collection("accounts", function (err, c) {
			c.find({ account_id: record.accountId })
			.toArray( function (err, items) {
				console.log("Ping from account " + items[0].name);
				parser.extract(items[0].projects[0].formats[0].pattern, function (record) {
					console.log(record);
				});
			});
		});
	});
	parser.parse(msg);
});
*/

var handleMessage = fibrous(function(msg, rinfo) {
	console.log("fibrous: " + msg);
	return "fibrous: " + msg;
});
