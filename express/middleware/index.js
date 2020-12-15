<<<<<<< HEAD
const {
	authenticate,
	authenticateWithExclude,
	verifySession,
} = require('./auth.js');
const { check, patternMatch } = require('./permission');

module.exports = {
	authenticate,
	authenticateWithExclude,
	verifySession,
	check,
=======
const { authenticate, verifySession } = require('./auth.js');

module.exports = {
	authenticate,
	verifySession,
>>>>>>> origin/master
};
