const cloudinary=require("cloudinary").v2

exports.cloudinaryConnect=async(req,res)=>{
    try{
        cloudinary.config({ 
            cloud_name: process.env.CLOUD_NAME, 
            api_key: process.env.API_KEY, 
            api_secret: process.env.API_SECRET, 
          });
          

          console.log("Connection made to cloudinary successfully!");
    }
    catch(error){
        console.log("error occured while conncting to cloudinary");
        console.log(error);
    }
}