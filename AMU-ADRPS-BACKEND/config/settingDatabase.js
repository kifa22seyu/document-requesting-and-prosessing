import mongoose from 'mongoose';

const connectSettingDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Settings database connected');
  } catch (error) {
    console.error('Settings database connection error:', error);
    process.exit(1);
  }
};

export default connectSettingDatabase;