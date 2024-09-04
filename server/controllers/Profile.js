const Profile=require("../models/Profile");
const User=require("../models/User")
const Course=require("../models/Course")
const {uploadImageToCloudinary}=require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const CourseProgress =require("../models/CourseProgress")

exports.updateProfile=async(req,res)=>{
  try{

    // fetch data
    const {
      firstName = "",
      lastName = "",
      DOB = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    
    //user id
    const userId=req.user.id;

    // validate
    if(!gender || !contactNumber || !about || !DOB ){
        return res.status(402).json({
            success:false,
            message:"All fields are required"
        })
    }

    // find profile 
    const user=await User.findById({_id:userId});
     const profileId=user.additionalDetails;
    //  console.log("user found")

     const updatedUser = await User.findByIdAndUpdate(userId, {
      firstName,
      lastName,
    });
    

    //   update
    const userProfile=await Profile.findByIdAndUpdate({_id:profileId},{
        gender:gender,
        about:about,
        DOB:DOB,
        contactNumber:contactNumber,
    },
   {new:true});

   const updatedUserDetails = await User.findById(userId)
   .populate("additionalDetails")
   .exec()

    //return res
    return res.status(202).json({
        success:true,
        message:"profile updated successfully",
         updatedUserDetails:updatedUserDetails,

    })

  }
  catch(error){
    console.log(error);
    return res.status(402).json({
        success:false,
        message:"Something went wrong while upadating profile"
    })

  }
}

// TODO:  we  want to schedule the task of deletion of the account after 2 days.
// chrone job
exports.deleteAccount=async(req,res)=>{
    try{
        // get Id
        const userId=req.user.id;

        // validation
        const userDetails=await User.findById({_id:userId});
         
        if(!userDetails){
            return res.status(403).json({
                success:false,
                message:"User does not exist!"
            })
        }
        // delete profile
        const profileId=userDetails.additionalDetails;
        const deletedProfile=await Profile.findByIdAndDelete({_id:profileId});
           
        // //unenroll user from all the enrolled courses
        //   const enrolledCourses=userDetails.courses;
        //   console.log(enrolledCourses);

        //   enrolledCourses.forEach(async(cid)=>{
        //      await Course.findByIdAndUpdate({_id:cid},
        //         {$pull:{enrolledStudents:userId}})
        //   });

        // delete user
        const deletedUser=await User.findByIdAndDelete({_id:userId});

        // return res
        return res.status(200).json({
            success:true,
            message:"User deleted successfully!",
            deletedUser,
        })
    }
    catch(error){
        return res.status(200).json({
            success:false,
            message:"Unable to delete  user",
        })

    }
}


exports.getAllUserDetails=async(req,res)=>{
    try{
        // fetch id
     const  userId=req.user.id;
     
     console.log("user id",userId);
     //user details
     const userDetails=await User.findById(userId).populate("additionalDetails").exec();
     
     return res.status(200).json({
        success:true,
        data:userDetails,
        message:"User data fetched",
    })

    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:"Unable to fetch user data",
        })

    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
  try {

    const userId = req.user.id

    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSections",
          },
        },
      })
      .exec()

      // console.log("User mil gya")

    userDetails = userDetails.toObject()
    var SubsectionLength = 0

    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
      totalDurationInSeconds += userDetails.courses[i].courseContent[j]
        .subSections.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)

        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSections.length
      }

      let courseProgressCount = await CourseProgress.findOne({
        courseId: userDetails.courses[i]._id,
        userId: userId,
      })
      
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}