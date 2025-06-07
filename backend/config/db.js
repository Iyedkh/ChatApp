const mongoose = require('mongoose')

exports.connectDB = async() =>{
  try{
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected: ' + conn.connection.host);
  }catch(error){
    console.error('Error connecting to MongoDB:',error.message);
  }
};