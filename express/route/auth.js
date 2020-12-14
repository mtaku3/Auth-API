// load middlewares
const { authenticate, verifySession } = require('../middleware');

// Load in the mongoose models
const { User } = require('../../db/models');

module.exports = function (app) {
	/* ROUTE HANDLERS */

	/* USER ROUTES */

	/**
	 * POST /user
	 * Purpose: Sign up
	 */
	app.post('/user', (req, res) => {
		// User sign up

		let body = req.body;
		let newUser = new User(body);

		newUser
			.save()
			.then(() => {
				return newUser.createSession();
			})
			.then((refreshToken) => {
				// Session created successfully - refreshToken returned.
				// now we geneate an access auth token for the user

				return newUser.generateAccessAuthToken().then((accessToken) => {
					// access auth token generated successfully, now we return an object containing the auth tokens
					return { accessToken, refreshToken };
				});
			})
			.then((authTokens) => {
				// Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
				res.header('x-refresh-token', authTokens.refreshToken)
					.header('x-access-token', authTokens.accessToken)
					.send(newUser);
			})
			.catch((e) => {
				res.status(400).send(e);
			});
	});

	/**
	 * POST /user/login
	 * Purpose: Login
	 */
	app.post('/user/login', (req, res) => {
		let email = req.body.email;
		let password = req.body.password;

		User.findByCredentials(email, password)
			.then((user) => {
				return user
					.createSession()
					.then((refreshToken) => {
						// Session created successfully - refreshToken returned.
						// now we geneate an access auth token for the user

						return user
							.generateAccessAuthToken()
							.then((accessToken) => {
								// access auth token generated successfully, now we return an object containing the auth tokens
								return { accessToken, refreshToken };
							});
					})
					.then((authTokens) => {
						// Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
						res.header('x-refresh-token', authTokens.refreshToken)
							.header('x-access-token', authTokens.accessToken)
							.send(user);
					});
			})
			.catch((e) => {
				res.status(400).send(e);
			});
	});

	/**
	 * GET /user/me/access-token
	 * Purpose: generates and returns an access token
	 */
	app.get('/user/me/access-token', verifySession, (req, res) => {
		// we know that the user/caller is authenticated and we have the user_id and user object available to us
		req.userObject
			.generateAccessAuthToken()
			.then((accessToken) => {
				res.header('x-access-token', accessToken).send({ accessToken });
			})
			.catch((e) => {
				res.status(400).send(e);
			});
	});
};
