const {mongoose}=require('mongoose');


const connectDb = async()=>{
    try{
      await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
       console.log(`MongoDB connected: ${conn.connection.host}`);
    }catch(error){
          
        console.error("MongoDB connection error:", err.message);
        process.exit(1);

    }
}

module.exports=connectDb;