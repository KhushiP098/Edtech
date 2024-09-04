const mongoose =require("mongoose");
const mailSender =require("../utils/mailSender")
const emailTemplate =require("../mailTemplates/emailVerification")

const otpSchema=new mongoose.Schema({
     email:{
         type: String,
         required:true,
     },
     otp:{
        type:String,
        required:true,
     },

     createdAt:{
         type:Date,
         default:Date.now(),
         expires:5*60,
         // it will delete after 5 min automatically
     }
})


// a function to send email
async function sendVerificationEmail(email,otp){
    try{
      const mailResponse =await mailSender(email,"Verification mail from Studynotation",emailTemplate(otp))
      console.log("MAIL RESPONSE",mailResponse);
    }
    catch(error){
        console.log("Error occured while sending mails",error);
    }
}


otpSchema.pre("save",async function(next){
   if(this.isNew){ 
    await sendVerificationEmail(this.email,this.otp);
   }
    next();
})


module.exports=mongoose.model("Otp",otpSchema);