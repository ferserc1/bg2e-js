const express = require('express');

const server = express();
server.use('/', express.static(__dirname));
server.use('/tools', express.static(__dirname + '/bg2e-tools'));

server.listen(3000);
