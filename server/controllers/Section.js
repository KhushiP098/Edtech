const Section=require("../models/section");
const Course=require("../models/Course")
// Every course content consists of sections 
// so whenever we will craete a section we will insert the _id of the section in the course 

exports.createSection=async(req,res)=>{
    try{
        // data fetch
        const {courseId,sectionName}=req.body;
        
        // data validation
        if(!courseId || !sectionName){
            return res.status(400).json({
               success:false,
               message:"Missing Fields"
            })
        }

        // create section
        const newSection =await Section.create({sectionName:sectionName});
         console.log("section created successfully!");


        // update the course by adding the section id
         const updatedCourse=await Course.findByIdAndUpdate(
            {_id:courseId},
            { $push:{courseContent:newSection._id}},
           {new:true}).populate({
            path: "courseContent",
            populate: {
                path: "subSections",
            },
        })
        .exec();

           console.log("course updated successfully!");        

        // send response
        return res.status(200).json({
            success:true,
            message:"Section created successfully!",
            updatedCourse,
         })

    }
    catch(error){
        console.log("Error occured while creating section");
        return res.status(400).json({
            success:false,
            message:"Error occured while creating section"
         })

    }
}

// In updation of a section we can just just change the name of the section ,and the course contains just the id of the sectio
// even after updating teh section name the id remains the same thus there is need of making any changes to the course schema 
exports.updateSection =async(req,res)=>{
    try{
        // data fetch
        const {sectionName,sectionId,courseId}=req.body;

        // data validate
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields arecompulsary!"
             })
        }
           
        //update the section
        const updatedSection=await Section.findByIdAndUpdate(sectionId,{
            sectionName:sectionName
        },
        {new:true});
        console.log("section updated successfully");

        const course=await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSections"
            }
        }).exec();

        console.log("course updated successfully");

        // return res
        return res.status(200).json({
            success:true,
            message:"section updated successfully",
            data:course,

         })

    }
    catch(error){

        console.log(error);
        console.log("error occured while updating section")

        return res.status(500).json({
            success:false,
            message:"error occured while updating section!"
         })

    }
}

exports.deleteSection=async(req,res)=>{
    try{

        // const {sectionId,courseId}=req.user;
        // id may come from routes also
        const {sectionId,courseId}=req.body;

        //delete the section
        const deletedSection=await Section.findByIdAndDelete({_id:sectionId});

        // update the course by deleting the sectionid from the course
        // TODO:Is it required we will see at the time of testing

        const updatedCourse=await Course.findByIdAndUpdate({_id:courseId},
            {$pull :{section:sectionId}},
            {new:true}
        ).populate({
            path:"courseContent",
            populate:{
                path:"subSections"
            }
        }).exec();
        
        console.log("section updated successfully")

        //send res
        return res.status(200).json({
            success:true,
            message:"section deleted successfully",
            data:updatedCourse,

         })

    }
    catch(error){
        return res.status(400).json({
            success:true,
            message:" something went wrong whilw deleting section",

         })

    }
}