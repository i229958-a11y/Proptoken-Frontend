import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('');
    
    // Don't exit in Vercel serverless - let it fail gracefully
    if (process.env.VERCEL === '1') {
      console.error('⚠️  Database connection failed. Check MONGODB_URI in Vercel Environment Variables.');
      throw error; // Re-throw so the API call fails, but don't exit
    }
    
    console.error('📝 Please check your .env file in the backend folder:');
    console.error('   MONGODB_URI=mongodb://localhost:27017/proptoken');
    console.error('');
    console.error('💡 If using MongoDB Atlas:');
    console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proptoken');
    process.exit(1);
  }
};

export default connectDB;





