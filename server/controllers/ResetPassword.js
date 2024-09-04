const User=require("../models/User"); 
const mailsender=require("../utils/mailSender")
const bcrypt=require("bcrypt");

exports.resetPasswordToken =async(req,res)=>{
    try{

        // fetch email
           const {email}=req.body;

        // check if the user exist
        const user=await User.findOne({email});
        if(!user){
            return res.status(402).josn({
                success:false,
                message:"User not registered!"
            })
            console.log("Email does not exist");
        }

        // generate  a token with expiry time  
          const token=crypto.randomUUID();
          // this built-in  crypto function is used to create a token

          // we have created this token ,because we will append this to our url of frontend where password will be changed
          // this  link will be valid for only 5 min after that we will try to update the password using thsi link it will not work

        //update user  by adding token and expiration time
          const updatedUser=await User.findOneAndUpdate({email:email},{
            token:token,
             resetPasswordExpires:Date.now() + 5*60*1000,
          },
        {new:true} // this will give the info of updated user
        );
 
        // create url
        const url=`http://localhost:3000/update-password/${token}`

        // send the frontend link on the email
         await mailsender(email,"Password reset link",`Password reset Link : ${url}`);

    
        //send the response
        return res.json({
            success:true,
            message:"Email sent successfully ,please check email  and change pwd",
            user:updatedUser,
            url:url,
        })
    }
    catch(error){
        console.log("Error occured while changing password try again later!");
        return res.json({
            success:true,
            message:"Error occured while changing password try again later!"
        })

    }
}

exports.resetPassword=async(req,res)=>{
    try{
        // data fetch
        const {password,confirmPassword,token}=req.body;
        
        // validation
        if(password!==confirmPassword){
            return res.json({
                success:false,
                message:`password and confirm password  not  matching password=>${password} and confirmPassword=>${confirmPassword}`,

            })
        }

        // get userdetials from db using token
         const  userDetails= await User.findOne({token:token});
        // if no entry invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token is invalid",

            })
        }

        //token time check (token expire time is less it means it has expired)
        if(userDetails.resetPasswordExpires<Date.now()){
            return res.json({
                success:false,
                message:"Token is expired!",

            })
        }

        // hashpwd
       const hashedPassword= await bcrypt.hash(password,10)

        // password update
       const updatedUser= await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )

        // return repsonse
        return res.json({
            success:true,
            user:updatedUser,
            message:"password changed successfully!",

        })
    }
    catch(error){ 
        
        console.log("Something went wrong while chanaging password! ");
        return res.json({
        success:false,
        message:"Something went wrong while chanaging password! ",
         })
    }
}