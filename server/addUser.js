/**
 * Usage: node addUser.js <email> <name> <surname> <password>
 * Example: node addUser.js mario.rossi@polito.it Mario Rossi password123
 */
import db from './db.js';
import crypto from 'crypto';

const [,, email, name, surname, password] = process.argv;

if (!email || !name || !surname || !password) {
  console.error('Usage: node addUser.js <email> <name> <surname> <password>');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
crypto.scrypt(password, salt, 64, (err, hash) => {
  if (err) { console.error(err); process.exit(1); }

  db.run(
    'INSERT INTO users(email, name, surname, password, salt) VALUES (?, ?, ?, ?, ?)',
    [email, name, surname, hash.toString('hex'), salt],
    function(err) {
      if (err) { console.error(err.message); process.exit(1); }
      console.log(`User created — id: ${this.lastID}, email: ${email}`);
      db.close();
    }
  );
});
