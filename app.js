// Base application. Run from terminal with "node app.js"

var express =     require('express'),
  bodyParser =    require('body-parser'),
  session =       require('express-session'),
  handlebars =    require('express-handlebars'),
  request =       require('request'),
  dbcon =         require('./config/dbcon.js'),
  helmet =        require('helmet'),
  MySQLStore =    require('express-mysql-session')(session),
  sessionStore =  new MySQLStore(dbcon),
  passport =      require('passport'),
  GoogleStrategy = require('passport-google-oauth20').Strategy,
  sql =           require('mysql2/promise'),
  user =          require('./models/user.js');

passport.serializeUser(function(user, cb) {
  console.log('In serializeUser. user:', user);
  cb(null, user.user_id);
});

passport.deserializeUser(async function(userId, cb) {
  try {
    let rows = await user.findUserByUserId(userId);
    // console.log('In deserializeUser. rows: ', rows);
    if (rows.length == 0){
      return cb(new Error('User not found'));
    }
    cb(null, rows[0]);
  }
  catch (error) {
    return cb(error);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: 'https://schedule-fairy.herokuapp.com/auth/google'
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      //Find user or create new one
      let rows = await user.findUserByGoogleId(profile.id);

      // No matching user, create one
      if (rows.length == 0) {
        let email = profile.emails.find(email => email.verified) || profile.emails[0];
        let googleId = profile.id;
        let displayName = profile.displayName;
        await user.createUser(displayName, email.value, googleId, null);
        console.log('profile: ', profile);
        console.log('email: ', email.value);
        console.log('googleId: ', googleId);
        rows = await user.findUserByGoogleId(googleId);

        console.log('rows: ', rows);
      }
      console.log('In use before callback');
      return cb(null, rows[0]);
    }
    catch(error){
      return cb(error);
    }
  }
));


var app = express();

// configure bodyParser
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// set handlebars as view engine, allow omission of .handlebars extension
app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./helpers/handlebarsHelpers.js')
}));
app.set('view engine', 'handlebars');

// set up access to public folder
app.use(express.static(__dirname + '/public'));

// configure sessions
app.use(session({
  secret: "We should pick a real secret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

app.use(passport.initialize());
app.use(passport.session());


// Set security-related http headers
app.use(helmet());

// set up routes
app.use(require('./routes/index.js'));
app.use(require('./routes/manage.js'));
app.use(require('./routes/create.js'));
app.use(require('./routes/pastReservations.js'));
app.use(require('./routes/makeReservations.js'));
app.use(require('./routes/pastEvents.js'));


// handle errors
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err,req,res,next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500');
});

// start server
app.listen(process.env.PORT || 3000, function(){
  console.log('Schedule Fairy server started!');
});
