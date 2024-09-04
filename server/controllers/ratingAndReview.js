const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")
const User = require("../models/User")

exports.createRating = async (req, res) => {
    try {

        // fetch data from re body
        const { rating, review, courseId } = req.body;
        const userId=req.user.id;
        console.log("data fetched!")

        //check if the user exist

        const studentEnrolled = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $elemMatch: {$eq: userId } },

        });


        if (!studentEnrolled) {
            console.log("user is not enrolled in the course");
            return res.status(400).json({
                success: false,
                message: "user is not enrolled in the course"
            })
        }
        console.log("Student found in the enrolled course")

        // check if user has not already created review
        const reviewed = await RatingAndReview.findOne({ user: userId, course: courseId });

        if (reviewed) {
            // user has already given review
            return res.status(400).json({
                success: false,
                message: "user has already given review!"
            })
        }

        // create a  new reviewandRating instance
        const ratingReview = await RatingAndReview.create({
            review,
            rating,
            course: courseId,
            user: userId,
        });

        // course me add kero review ki id
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            { $push: { ratingAndReview: ratingReview._id } },
            { new: true },
        );
        console.log("Course updated")

        //send response
        return res.status(200).json({
            success: true,
            data: ratingReview,
            message: "Course Reviewed!"
        })

    }
    catch (error) {
        return res.status(400).json({
            succes: false,
            message: "Can't give review .try again later!"
        })

    }
}

exports.getAverageRating = async (req, res) => {
    try {

        // fetch the course Id
        const { courseId } = req.body;

        // this aggregate func will return an array
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    // courseId was in string we have converted itin id
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ])

        // rating exist
        if (result.length > 0) {
            return res.status(200).json({
                succes: true,
                averagerating: result[0].averageRating,
            })

        }

        // rating does not exist
        return res.status(200).json({
            succes: true,
            averagerating: "Average rating is 0.No rating given till now",
        })




    }
    catch (error) {
        return res.status(400).json({
            succes: false,
            message: "Can't get Reviews!"
        })

    }
}

exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .populate({
                path: "user",
                select: "firstName lastName email image"
            }).populate({
                path: "course",
                select: "courseName"
            }).exec();

        return res.status(200).json({
            succes: success,
            data: allReviews,
            message: "Fetched all reviews",
        })

    }
    catch (error) {
        return res.status(400).json({
            succes: false,
            message: "Can't fetch reviews.try again later!"
        })

    }
}