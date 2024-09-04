const Category = require("../models/Category")
const { Mongoose } = require("mongoose");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }
exports.createCategory = async (req, res) => {
    try {
        const { name,description }=req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // craete entry in db
        const CategoryDetails = await Category.create({ name, description });
        console.log(CategoryDetails);

        return res.status(200).json({
            success: true,
            data: CategoryDetails,
            message: "Category created successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Could not create Category",
        })

    }
}

exports.showAllCategories = async (req, res) => {
    try {

        const categories = await Category.find().populate("courses").exec();

        return res.status(200).json({
            success: true,
            data: categories,
            message: "fetched all categories!",
        })


    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Could not get Categories!",
        })

    }

}

// show all the courses of a particular activity
// for eg development is a  category and all the  courses related to development are like web dev,app dev
// also we wil show courses of other category so ,as to attract users



exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      // Get courses for the specified category

      const selectedCategory = await Category.findById({_id:categoryId})
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: "ratingAndReview",
        })
        .exec();
  
      // console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
   
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
       
      // Handle the case when there are no courses
      
      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec()

        // console.log("Different COURSE", differentCategory)
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)

      //  console.log("mostSellingCourses COURSE", mostSellingCourses)
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
        message:"Fetched page catalog data"
      })
    } catch (error) {
      console.log("Error occured while fetching the pages details of the category")
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }