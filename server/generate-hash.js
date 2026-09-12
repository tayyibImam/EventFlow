const bcrypt = require('bcrypt');

const password = 'password123'; // the plain-text password you'll log in with
bcrypt.hash(password, 10).then(hash => console.log(hash));