import fs from "fs";
import express from "express";
import https from "https";
import cors from "cors";
var app = express();
var ExpressPeerServer = require("peer").ExpressPeerServer;
var peerjs_options = {
  debug: true,
};
var ssl_options = {
  key: fs.readFileSync("peerjs.key"),
  ca: fs.readFileSync("PeerjsCA.pem"),
  cert: fs.readFileSync("peerjs.crt"),
  honorCipherOrder: true,
  ciphers:
    "ECDHE-RSA-AES128-SHA256:AES128-GCM-SHA256:HIGH:!RC4:!MD5:!aNULL:!EDH",
};
var server = https.createServer(ssl_options, app);
var peerServer = ExpressPeerServer(server, peerjs_options);

app.use(cors());
app.use("/myapp", peerServer);
server.listen(
  `${Number(process.env.PORT) + 1}`,
  process.env.HOST,
  function (err) {
    console.log(`Peer Server running:`);
    console.log(err, server.address());
  }
);
