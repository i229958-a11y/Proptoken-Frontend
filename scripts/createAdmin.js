import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: './.env' });

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      if (existingAdmin.isAdmin) {
        console.log('✅ Admin user already exists');
        process.exit(0);
      } else {
        // Update existing user to admin
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('✅ Existing user updated to admin');
        process.exit(0);
      }
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin123',
      isAdmin: true,
      kycStatus: 'approved',
      loginMethod: 'email'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();





