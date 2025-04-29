const mongoose = require('mongoose');
const Admin = require('./models/AdminModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('12345678', 10);

    const admin = new Admin({
      email: 'admin@gmail.com',
      password: hashedPassword,
    });

    await admin.save();
    console.log('Admin user created successfully!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding admin user:', error);
    mongoose.connection.close();
  }
};

seedAdmin();