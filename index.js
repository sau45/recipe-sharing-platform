const express = require('express');
const connectDb = require('./src/config/db');
const authRouter = require('./src/routes/authRoutes')
const app = express();
dotenv.config();
connectDb();
app.use(express.json());

app.get('/',()=>{
    console.log("All is working fine");
})

app.use("/api/v1/auth", authRouter);
app.listen(PORT,()=>{
    console.log(`Server is listening on port${PORT}`)
})