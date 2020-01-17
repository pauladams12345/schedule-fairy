// Base application. Run from terminal with "node app.js"

var express =       require('express'),
  bodyParser =    require('body-parser'),
  session =       require('express-session'),
  handlebars =    require('express-handlebars'),
  request =       require('request'),
  dbcon =         require('./config/dbcon.js'),
  helmet =        require('helmet'),
  MySQLStore =    require('express-mysql-session')(session),
  sessionStore =  new MySQLStore(dbcon),
  passport =      require('passport'),
  GoogleStrategy = require(passport-google-oauth20).Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: 'https://schedule-fairy.herokuapp.com/auth'
  },
  async function(accessToken, refreshToken, profile, cb) {
    //Find user or create new one
    let rows = await user.findUser(profile.id);

    // No matching user, create one
    if (rows.length == 0) {
      await user.createUser(onid, firstName, lastName, email);
      rows = await user.findUser(attributes.onid);
    }

    return cb(null, rows[0]);

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
