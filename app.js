var config = require("./config");
var dgram = require("dgram");
var parserExec = require("packet").createParser();
var mongo = require('mongodb').MongoClient;


// MONGO SETUP

mongo.connect(config.mongo.url, function(err, db) {
	if (err)
		throw err;
	console.log('connected to bitstorm db');
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
	var parser = parserExec.createParser();
	parser.extract("__header", function (record) {
		console.log(this);
		console.log(record);
		this.extract("proto_A", function (record) {
			console.log(record);
		});
	});
	parser.parse(msg);
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});


server.bind(1973);
