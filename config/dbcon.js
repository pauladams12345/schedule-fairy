// Configuration details for connecting to MySQL database

let uri = new URL(process.env.CLEARDB_DATABASE_URL);

module.exports = {
  connectionLimit : 10,
  host            : 'uri.host',
  user            : 'uri.username',
  password        : 'uri.password',
  database        : 'uri.pathname',
  waitForConnections: true,
  queueLimit: 0,
  timezone: 'Z'
};