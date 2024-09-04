 const {instance}=require("../config/razorpay")
const Course=require("../models/Course")
const User=require("../models/User")
const mailSender=require("../utils/mailSender")
const {courseEnrollmentEmail}=require("../mailTemplates/courseEnrollmentEmail")
const { default: mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mailTemplates/paymentSuccessEmail");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress")


//initiate the razorpay order
exports.capturePayment = async(req, res) => {

    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0) {
        return res.json({success:false, message:"Please provide Course Id"});
    }

    let totalAmount = 0;

    for(const course_id of courses) {
        let course;
        try{
           
            course = await Course.findById(course_id);
            if(!course) {
                return res.status(200).json({success:false, message:"Could not find the course"});
            }

            const uid  = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({success:false, message:"Student is already Enrolled"});
            }

            totalAmount += course.price;
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success:true,
            message:paymentResponse,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({success:false, mesage:"Could not Initiate Order"});
    }

}


//verify the payment
exports.verifyPayment = async(req, res) => {
    console.log("Verify payment controller");
    console.log("req=>",req);

    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;
    
    console.log("fetching fata")
    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({success:false, message:"Payment Failed"});
    }

    console.log("payment data fetched");

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");


        if(expectedSignature === razorpay_signature) {
            //enroll karwao student ko
            console.log("signature matched!")
            await enrollStudents(courses, userId, res);
            //return res
            return res.status(200).json({success:true, message:"Payment Verified"});
        }
        return res.status(200).json({success:"false", message:"Payment Failed"});

}


const enrollStudents = async(courses, userId, res) => {

    if(!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    for(const courseId of courses) {
        try{
            //find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
            {_id:courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true},
        )

        if(!enrolledCourse) {
            return res.status(500).json({success:false,message:"Course not Found"});
        }

        const courseProgress=await CourseProgress.create({
            courseId:courseId,
            userId:userId,
            completedVideos:[],
        })

        //find the student and add the course to their list of enrolledCOurses
        const enrolledStudent = await User.findByIdAndUpdate(userId,
            {$push:{
                courses: courseId,
                courseProgress:courseProgress._id

            }},{new:true})

    
            
        ///bachhe ko mail send kardo
        const emailResponse = await mailSender(
            enrollStudents.email,
            `Successfully Enrolled into ${enrolledCourse.courseName}`,
            courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
        )    
        //console.log("Email Sent Successfully", emailResponse.response);
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }

}

exports.sendPaymentSuccessEmail = async(req, res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try{
        //student ko dhundo
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
             paymentSuccessEmail(`${enrolledStudent.firstName}`,
             amount/100,orderId, paymentId)
        )
    }
    catch(error) {
        console.log("error in sending mail", error)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}

// capture the instance and initiate the razorpay order

// exports.capturePayment=async (req,res)=>{
//     try{

//         // data fetch
//         const {courseId}=req.body;
//         const userId=req.user.id;

//         // valid courseId
//         if(!courseId){
//             return res.json({
//                 success:false,
//                 message:"Please provoide valid course Id"
//             })
//         }

//         // valid coursedetail
//         const course =await Course.findById(courseId);
//         if(!course){
//             return res.json({
//                 success:false,
//                 message:"Could not find the course!",
//             });
//         }
//         // user already pay for the same course
//         const  uId=new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uId)){
//             return res.json({
//                 success:false,
//                 message:"Student is alredy enrolled",
//             });
//         }

//         // order create
//         const amount=course.price;
//         const currency="INR";

//         const options={
//             amount:amount*100,
//             currency,
//             recipt:Math.random(Date.now()).toString,
//             notes:{
//                 courseId:courseId,
//                 userId
//             }
//         }

//         try{
//             // initiate the  payment
//             const paymentResponse=await instance.orders.create(options);
//             console.log(paymentResponse);

//             return res.status(200).json({
//                 success:true,
//                 courseName:course.courseName,
//                 orderId:paymentResponse.id,
//                 amount:paymentResponse.amount,
//                 message:"Student is successfully enrolled",
//             });
//         }
//         catch(error){
//           console.log(error);
//           res.json({
//              success:false,
//              message:"Could not initiate order"
//           })
//         }
//     }
//     catch(error){
//         return res.json({
//             success:false,
//             message:"something went wrong while doing payment!",
//         });

//     }
// }

// verify signature of razorpay and server

// exports.verifySignature =async(req,res)=>{
//     try{

//         const webhookSecret="123456";
//         const signature=req.headers["x-razorpay-signature"]; 
          
//         // HMAC is basically a hashing alogo which takes two  things one is hashing alogo and SECRET_KEY

//          crypto.createHmac("sha256",webhookSecret);
//          // it will convert the input in string format
//          shasum.update(JSON.stringify(req.body));
//          const digest=shasum.digest("hex");


//          // match ,payment is authorisedit means now  we have to add student is students_enrolled of the given course
//          // and the in the useres list we must add the course in the courses taken  by user
//          if(signature===digest)
//         {

//             console.log("Payment is autgorised");

//             const{courseId,userId}=req.body.payload.payment.entity.notes;
//             try{
                
//                 // find the student and enroll in the course
//                 const enrolledCourse=await Course.findByIdAndUpdate(
//                     {_id:courseId},
//                     {$push :{studentsEnrolled:userId}},
//                     {new:true}
//                 ).populate("studentsEnrolled").exec();

//                 if(!enrolledCourse){
//                     return res.status(500).json({
//                         success:false,
//                         message:"Course not found",
//                     })
//                 }

//                 // also push the course in the courses taken by user
//                    const enrolledStudent=await User.findByIdAndUpdate({_id:userId},
//                     {$push:{courses:courseId}},
//                     {new:true}
//                    ).populate("courses").exec();

//                     // send mail to the enrolled student ko confirmation wala
//                     const mailResponse= await mailSender(enrolledStudent.email,"Congratualations! You have successfully registered!","Congratulations ,you have onboarded on new codehelp course!")
                   
//                     console.log(mailResponse);

//                     return res.status(200).json({
//                         success:true,
//                         message:"Signature verified and course added"
//                     })
//             }
//             catch(error){
//                 console.log(error);
//                 return res.status(500).json({
//                     success:false,
//                     message:error.message

//                 })

//             }

//          }

//          else{
//             console.log("Invalid signature! ")
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message

//             })

//          }
//     }catch(error){
//         console.log("something went wrong ! Can't  register you!")
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message

//         })

//     }
// }