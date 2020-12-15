const acl = require('./acl.js');
const exclude = require('./exclude.js').backend;

const { User } = require('../../../db/models');

// return array of routes(<-object) that matches in the permission array
const getRoute = function (permission) {
	let route = [];
	for (var i of permission) {
		route = route.concat(acl[i].backend);
	}
	return route;
};

const patternMatch = function (target, pattern) {
	// make regex for pattern matching
	pattern = pattern.split('/');
	for (var i in pattern) {
		if (pattern[i] == '*' || /:[^/]+(?=\/)/.test(pattern[i]))
			pattern[i] = '[^/]+';
	}
	pattern = pattern.join('/');
	pattern = new RegExp(pattern);

	return pattern.exec(target) == target; // string that matches with the pattern is the same as the original target or not
};

/**
 * Check the route is allowed for the user
 * param if forAll true then exclude match will execute
 */
const check = function (req, res, next) {
	return new Promise((resolve, reject) => {
		// get current route from req.route
		const currentRoute = req.path;
		const currentMethod = req.method.toLowerCase();

		return new Promise((resolve, reject) => {
			return User.findById(req.user_id)
				.lean() // convert into json
				.populate('info.permissions', 'acl') // populate info.permissions with Permission Collection only of acl
				.then((user) => {
					resolve(user.info.permissions.acl); // return only user's acl
				})
				.catch((err) => reject(400)); // if err happens then reject with bad request 400
		})
			.then((permissions) => {
				// if permission doesn't exist then reject with forbidden 403
				if (!permissions) reject(403);
				// if permission contains -1 means allowed * so resolve() immediatelly
				else if (permissions.some((i) => i == -1)) resolve();

				const allowedRoute = getRoute(permissions); // get allowed route from permission

				// if currentRoute exists in allowedRoute then resolve()
				if (
					allowedRoute.some(
						(i) =>
							i.method == currentMethod &&
							patternMatch(currentRoute, i.route)
					)
				)
					resolve();
				// else reject with forbidden 403
				else reject(403);
			})
			.catch((err) => reject(err));
	})
		.then(() => {
			next();
		})
		.catch((err) => res.sendStatus(err));
};

module.exports = { check, exclude, patternMatch };
