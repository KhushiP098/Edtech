const Course=require("../models/Course");
const Category=require("../models/Category")
const User=require("../models/User")
const Section=require("../models/section")
const SubSection=require("../models/subSection")
const CourseProgress =require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const {uploadImageToCloudinary}=require("../utils/imageUploader");

// create Course handler function

exports.createCourse=async(req,res)=>{
    try{

        // fetch data ,file
        const {courseName,courseDescription,whatYouWillLearn,price,category}=req.body;

        //get thumbnail
        const thumbnail =req.files.thumbnailImage;

        // validation
        if(!courseName|| !courseDescription ||!whatYouWillLearn ||!price||!category){
            return  res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        // check for instructor, becz we to add the name of the instructor in the course
           const userId=req.user.id;
           const instructorDetails=await User.findOne({_id:userId})
           console.log("instructor details",instructorDetails);

           if(!instructorDetails){
             return res.status(404).json({
                success:false,
                message:"Instructor Details not found!"
             })
           }

        // category validation ,check if the tag is valid or not
        // the category we have recieved is an id
        const  categoryDetails =await Category.findById({_id:category});
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"invalid category"
             })
        }
         
        console.log("creating a course of this category",categoryDetails)
        /// uploadimage to cloudinary
        const thumbnailImage =await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
         console.log("image uploaded on cloudinary");

        // create an entry for new course
        const newCourse =await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            category,
            thumbnail:thumbnailImage.secure_url,
        });

        console.log("Successfullly created course",newCourse);

        // add the course to the instructor db entry
        await User.findByIdAndUpdate(
          {_id: instructorDetails._id},
            {
                 $push:{
                    courses:newCourse._id,
                 }
            },
            {new:true}
        )

        // update the tag schema 
        //(Jo tag humne use kiya h usme jaakr course me jaake newCourse ki id push ekrni h)
         const updatedCategory= await Category.findByIdAndUpdate({_id:category},
            {
                $push:{
                    courses:newCourse._id,
                } 
            },
            {new:true},
         );

        return res.status(201).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
        })

    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Error occured while creating course",
        })

    }
}

exports.getAllCourses=async (req,res)=>{
    try{

        const allCourses=await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndreview:true,
            studentsEnrolled:true,
        }).populate("instructor").exec();
       
        return res.status(401).json({
            success:true,
            courses:allCourses,
            message:"Fetched all courses",
        })

    }
    catch{
        return res.status(401).json({
            success:false,
            message:"Error occured while fetching course",
        })

    }
}

exports.getCourseDetails=async(req,res)=>{
    try{

        // fetch the course Id from the body
        console.log("ENTERED THE COURSE DETAILS CONTROLLER SUCCESSFULLY")
        const {courseId}=req.body;

        //fetch all teh details of teh course from the db
        const courseDetails=await Course.find({_id:courseId})
         .populate({
            path:"instructor",
            populate:{
                path:"additionalDetails"
            }
        })
        .populate({
            path:"courseContent",
            populate:{
                path:"subSections"
            }
        })
        .populate("ratingAndReview")
        .populate("category")
        .populate({
            path:"studentsEnrolled",
            populate:{
                path:"additionalDetails"
            }
        }).exec();   
        console.log("Successfully fetched");

        
        return res.status(200).json({
            success:true,
            courseDetails:courseDetails,
            message:"Successfully fetched the details of the course",
        })
        
    }
    catch(error){

        return res.status(400).json({
            success:false,
            message:"Could not fetch the details of the course.",
        })

    }
}

exports.getFullCourseDetails = async (req, res) => {

    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReview")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSections",
          },
        })
        .exec()

        if (!courseDetails) {
          return res.status(400).json({
            success: false,
            message: `Could not find course with id: ${courseId}`,
          })
        }

        
        console.log("course detials fetched successfully");
      

      let courseProgressCount = await CourseProgress.findOne({
        courseId: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
    
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails?.courseContent.forEach((content) => {
        content?.subSections.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds);
      console.log("totalDuration",totalDuration);
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },

      })

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Could'nt fetch the course details",
      })
    }
  }

exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
      

  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSections
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }
  
  // Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }

  // Edit Course Details
exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReview")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSections",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }
