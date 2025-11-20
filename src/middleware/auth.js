const jwt = require('jsonwebtoken');
const User = require('../modal/userSchema');
const auth = async(req,res,next)=>{
    try{
        const header = req.header("Authorization") || "";
        const token = header.replace("Bearer", "");
        if (!token)return res.status(401).json({ message: "No token provided" });
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(payload.userId).select("-password");
        if(!user)return res.status(401).json({message:"Token Invalid(User not valid)!"})

        req.user = user;
         next();
    }catch(error){

        console.log("Something went wrong while authentication",error.message);
        res.status(401).json({message:"Unauthorized!"});

    }

}

module.exports=auth;


