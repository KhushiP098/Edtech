const express=require("express");
const app=express();

//Routes import
const  userRoutes=require("./routes/User")
const  paymentRoutes=require("./routes/Payment")
const  profileRoutes=require("./routes/Profile")
const  courseRoutes=require("./routes/Course")
const  contactRoutes=require("./routes/Contact")


// load config file
const dotenv=require("dotenv");
dotenv.config();
const PORT=process.env.PORT || 4000;

// db connect
const {dbConnect}=require("./config/database");
dbConnect();

//cloudinary connect
const {cloudinaryConnect}=require("./config/cloudinary")
cloudinaryConnect();

//middlewares 
const cookieParer=require("cookie-parser");

app.use(express.json());
app.use(cookieParer());

// to entertain all the requests that are coming from the frontend
const cors=require("cors");
app.use(
    cors({
    origin:"*", // url where frontend is running we dont know that what will be the port where our project will run where we have deployed it
    credentials:true,
    })
)

const fileUpload=require("express-fileupload")
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)


// routesMount
app.use("/api/StudyNotation/auth",userRoutes);
app.use("/api/StudyNotation/profile",profileRoutes);
app.use("/api/StudyNotation/payment",paymentRoutes);
app.use("/api/StudyNotation/course",courseRoutes);
app.use("/api/StudyNotation/reach",contactRoutes);


// default route
app.get("/",(req,res)=>{
    // res.send("This is home page of the Studynotation");
    return res.json({
        success:true,
        message:`Your server is running at ${PORT} port no`
    })
})

//server activate /listen
app.listen(PORT,(req,res)=>{
    console.log(`App is running  successfully at PORT ${PORT}`);
})
