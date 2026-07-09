const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
async function run() {
  await mongoose.connect('mongodb://localhost:27017/kppdf');
  const db = mongoose.connection.db;
  const hash = await bcrypt.hash('admin', 10);
  const collection = db.collection('users');
  await collection.updateOne(
    { username: 'admin' },
    { $set: { passwordHash: hash } }
  );
  console.log('Password updated.');
  await mongoose.disconnect();
}
run();
