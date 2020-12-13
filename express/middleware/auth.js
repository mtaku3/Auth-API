// Load in the mongoose models
const { User } = require('../../db/models');

const jwt = require('jsonwebtoken');

/* MIDDLEWARE  */

// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
	let token = req.header('x-access-token');

	// verify the JWT
	jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
		if (err) {
			// there was an error
			// jwt is invalid - * DO NOT AUTHENTICATE *
			res.status(401).send(err);
		} else {
			// jwt is valid
			req.user_id = decoded._id;
			next();
		}
	});
};

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
	// grab the refresh token from the request header
	let refreshToken = req.header('x-refresh-token');

	// grab the _id from the request header
	let _id = req.header('_id');

	User.findByIdAndToken(_id, refreshToken)
		.then((user) => {
			if (!user) {
				// user couldn't be found
				return Promise.reject({
					error:
						'User not found. Make sure that the refresh token and user id are correct',
				});
			}

			// if the code reaches here - the user was found
			// therefore the refresh token exists in the database - but we still have to check if it has expired or not

			req.user_id = user._id;
			req.userObject = user;
			req.refreshToken = refreshToken;

			let isSessionValid = false;

			user.sessions.forEach((session) => {
				if (session.token === refreshToken) {
					// check if the session has expired
					if (
						User.hasRefreshTokenExpired(session.expiresAt) === false
					) {
						// refresh token has not expired
						isSessionValid = true;
					}
				}
			});

			if (isSessionValid) {
				// the session is VALID - call next() to continue with processing this web request
				next();
			} else {
				// the session is not valid
				return Promise.reject({
					error:
						'Refresh token has expired or the session is invalid',
				});
			}
		})
		.catch((e) => {
			res.status(401).send(e);
		});
};

/* END MIDDLEWARE  */

module.exports = {
	authenticate,
	verifySession,
};
