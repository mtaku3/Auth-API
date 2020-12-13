const express = require('express');
const app = express();

const { mongoose } = require('../db/mongoose');

const bodyParser = require('body-parser');

// Load middleware
app.use(bodyParser.json());

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE'
	);
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id'
	);

	res.header(
		'Access-Control-Expose-Headers',
		'x-access-token, x-refresh-token'
	);

	next();
});

/** Load routes */
const { authRoute } = require('./route');
authRoute(app);

app.listen(3000, () => {
	console.log('Server is listening on port 3000');
});
