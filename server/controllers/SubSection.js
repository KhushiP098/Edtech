const Section=require("../models/section");
const SubSection=require("../models/subSection")
const {uploadImageToCloudinary}=require("../utils/imageUploader");

const Course =require("../models/Course")

require("dotenv").config();

exports.createSubSection=async(req,res)=>{
    try{

        // data fetch
        const{name,description,sectionId}=req.body;

        // files extract
        // console.log("data fetched successfully!");
        const file=req.files.videoFile;
        console.log("video fetched successfully!");

        // data validation
        if(!name ||  !description || !file|| !sectionId){
            return res.status(402).json({
                 success:"false",
                 message:"all fields required!"
            })
        }

       
        // upload files on cloudinary,you will get a secure_url of the video
         const uploadFile=await uploadImageToCloudinary(file,process.env.FOLDER_NAME);
          console.log("file uploaded on cloudinary");


        // create  a  subsection
        const newSubSection=await SubSection.create({name,timeDuration: `${uploadFile.duration}`,description,
          videoUrl:uploadFile.secure_url
        });
        console.log("Subsection created");

        // update the section by adding the subsectionid
         const updatedSection=await Section.findByIdAndUpdate({ _id: sectionId },
            {$push :{subSections:newSubSection._id}},
            {new:true},
         ).populate("subSections").exec();

         if(!updatedSection){
          return res.status(404).json({
            success:false,
            messaege:"Could'nt find section"
          })
         }
         console.log("section created");
          
        // return res
        return res.status(202).json({
            success:"true",
            message:"subSection created successfully!",
            data: updatedSection,

       })
    }
    catch(error){
      console.log(error);
        return res.status(403).json({
            success:"false",
            message:" error occured in creating subSection!"
       })

    }
}


exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId,subSectionId, name, description } = req.body

      const subSection = await SubSection.findById(subSectionId);
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (name !== undefined) {
        subSection.name = name
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.videoFile
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      const updatedSection = await Section.findById(sectionId).populate("subSections")


      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }


exports.deleteSubSection=async(req,res)=>{
  
    try{

        // const {sectionId,subSectionId}=req.user;
        // id may come from routes also
        const {sectionId,subSectionId}=req.body;

        const subSection=await SubSection.findById({_id:subSectionId});
        if(!subSection){
          return res.status(404).json({
            success:false,
            message:"subsection Not found"
          })
        }
         
        const updatedSection =await Section.findByIdAndUpdate(sectionId,{$pull :{subSections:subSectionId}},{new:true});
         console.log("section updated"); 

        //delete the section
        const deletedSubSection=await SubSection.findByIdAndDelete(subSectionId);
        
        if(!deletedSubSection){
          return res.status(400).json({
            success:false,
            message:" sub Section to be deleted not found"
          })
        }

        console.log("Section deleted");

        // update the Section by deleting the sectionid from the course
        // TODO:Is it required we will see at the time of testing

        // const course=await Course.findById(courseId)
        // .populate({
        //   path:"courseContent",
        //   populate:{
        //     path:"subSections"
        //   }

        // }).exec();
        // console.log("Course updated ");
          

        //send res
        return res.status(200).json({
            success:true,
            data:updatedSection,
            message:" subSection deleted successfully",

         })

    }
    catch(error){
      // console.log(error);
        return res.status(400).json({
            success:false,
            message:" something went wrong whilw deleting subsection",

         })

    }
}
