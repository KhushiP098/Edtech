const jwt=require("jsonwebtoken");
require("dotenv").config();

const User=require("../models/User");

// auth
exports.auth=async(req,res,next)=>{
    try{
         
        console.log("REQUEST BODY",req.body);
        console.log("REQUEST  COOKIES",req.cookies);
        console.log("REQUEST HEADERS",req.header);
        // extract token
        
        const token=req?.cookies?.studyNotation_cookie || req?.body?.token || req.header("Authorization").replace("Bearer ","");

       
        console.log("Token is",token);
        // verify token
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing!",
            }); 
        }

         // verify the token 
         try{
            const payload= jwt.verify(token,process.env.JWT_SECRET);
             console.log("payload is=>",payload);
             req.user=payload;
         }
         catch(error){
            console.log("Can't verify token!")
            return res.status(401).json({
                success:false,
                message:"Token is invalid."
            })
         }

         console.log("User is authenticated");
        next();

    }catch(error){
        console.log("Can't validate token!")
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token"
        })

    }
}

// is Student
exports.isStudent =async(req,res,next)=>{
    try{

        
        const role=req.user.accountType;
        if(role!="Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for students only!"
            })
        }

        console.log("The user is authorised as Student");
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while checking the account type"
        })

    }
}
// isInstructor
exports.isInstructor =async(req,res,next)=>{
    try{

        
        const role=req.user.accountType;
        if(role!="Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for instructor only!"
            })
        }
        console.log("The user is authorised as Instructor");
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while checking the account type"
        })

    }
}

//IsAdmin
exports.isAdmin =async(req,res,next)=>{
    try{

        
        const role=req.user.accountType;
        if(role!="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for admin only!"
            })
        }
        console.log("The user is authorised as Admin");
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while checking the account type"
        })

    }
}
