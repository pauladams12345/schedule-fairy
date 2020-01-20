// Defines routes for login, logout, and homepage

var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js'),
	helpers = 		require('../helpers/helpers.js'),
	email =			require('../helpers/email.js'),
	passport = 		require('passport'); 

// // Redirects new arrivals to landing page. Handles authentication
// // for users redirected from CAS login then redirects to personal homepage
// router.get('/:destination', async function (req, res, next) {

// 	// If the user is not logged in, store their destination and redirect to login
// 	if (!req.session.user_id) {
// 		req.session.destination = req.query.destination || "/";	// If destination is not specified, 
// 		res.redirect('/login');									// redirect to their homepage after login.
// 	}

// 	// If user is logged in, redirect to the homepage
// 	else {
// 		res.redirect('/home');
// 	}
	
// });

// Displays user's personal homepage
router.get('/home', async function (req, res, next) {
	console.log('In home. req.session: ', req.session);
	// If there is no session established, redirect to the landing page
	if (!req.user.user_id) {
		//res.redirect('/login');
		res.render('home', {});
	}
	// If there is a session, render user's homepage
	else {
		let context = {};
		context.eventsManaging = await createsEvent.getUpcomingUserEvents(req.session.user_id);
		context.eventsAttending = await helpers.processUpcomingReservationsForDisplay(req.session.user_id);
		context.name = req.user.name;
		context.stylesheets = ['main.css'];
		context.scripts = ['convertISOToLocal.js', 'home.js'];
		res.render('home', context);
	}

});

// Displays landing page
router.get('/login', async function (req, res, next) {
	let context = {};
	context.layout = 'no_navbar.handlebars';
	context.stylesheets = ['main.css', 'login.css'];
	res.render('login.handlebars', context);
});

router.get('/login/google',
	passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google',
	passport.authenticate('google', { failureRedirect: '/login/failed'}),
	function(req, res) { res.redirect('/home'); }
);

// Log user in and redirect to their destination, else return user to login page
// router.post('/login', 
// 	passport.authenticate('local', {failureRedirect: '/login'}),
// 	function(req, res) {
// 		res.redirect(req.session.destination);
// 	});

// Destroys current session and redirects to landing page
router.get('/logout', async function (req, res, next) {
	if (req.session) {
		req.session.destroy(function(err) {
			if(err){
				return next(err);
			}
			else {
				return res.redirect('/');
			}
		});
	}
});

module.exports = router;
