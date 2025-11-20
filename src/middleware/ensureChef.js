module.exports = (req,res,next)=>{
    if(!req.user || !req.user.isChef){
        return res.status(403).json({message:"Only chefs can perform this action"});
    }
    next();
}