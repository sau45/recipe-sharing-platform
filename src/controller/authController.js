const User = require("../modal/userSchema");
const bycrypt = require('bycrypt');
const jwt = require('jsonwebtoken');


const signup = async(req,res)=>{
    try{
      const { name, email, password } = req.body;

       if(!email || !password) return res.status(400).json("email and password required!");
       const isUserExist = await User.findOne({email});
       if(isUserExist)return res.status(400).json({message:"User already exist!"});
       
       const salt = await bycrypt.genSalt(10);
       const hashedPassword = await bycrypt.hash(password, salt);
       const userData = await User.create({name,email,password:hashedPassword})

       return res
         .status(200)
         .json({ message: "User created!", data: userData });



    }catch(error){
        console.log("Something went wrong",error.message);
        return res.status(500).json({ message: "Signup failed" });


    }

}
const login = async(req,res)=>{
    try{

        const {email,password} = req.body;
        const isUserExist = await User.findOne({email});
        if(!isUserExist)return res.status(400).json({message:"User not exist!"});
        const hashedPassword = isUserExist.hashedPassword;
        const isCorrectPass = await  bycrypt.compare(password, hashedPassword);
        if(!isCorrectPass)return res.status(400).json({message:"User password incorrect!"});
        const token = await jwt.sign({userId:isUserExist?._id},process.env.JWT_SECRET,{expiresIn:'24hr'});
        return res
          .status(200)
          .json({ message: "Login success", token: token, user: isUserExist });
    }catch(error){
        console.log("Something went wrong",error.message);
        return res.status(500).json({message:"Login failed"})
    }
                 
                  


}

const becomeChef = async(req,res)=>{
    try{
        req.user.isChef=true;
        await req.user.save();
        return res.status(200).json({message:"User is now chef",user: { id: req.user._id, isChef: req.user.isChef } })

    }catch(error){
        console.log("Something went wrong",error.message);
        return res.status(500).json({message:"failed to update role"})

    }

}


module.exports={signup,login,becomeChef}