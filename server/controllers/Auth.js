const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const mailSender=require("../utils/mailSender")
const {passwordUpdated} =require("../mailTemplates/passwordUpdate")
require("dotenv").config();

//send Otp
//This is a part of the signup functionality so for sending an otp we must have an email which we will fetch from the req body
// after that .we will send an otp on the given mail and if the  otp is sentsuccessfully we will craete an 
// entry of the otp in the db. Now ,when the user gives input we can  check if that matchs with the one 
// which is stored in the db if yes then we will craete the entry of the user otherwise we will not create entry for user

exports.sendotp = async (req, res) => {
    try {
        // console.log("Entered otp controller")

        // fetch email from req ki body
        const { email } = req.body;

        // check if the user is already present
        const checkUserPresent = await User.findOne({email });

        //if user is aldready present then send a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already exists!"
            })
        }

        // generate otp
        // first argument is the length and second are optionals
        var otp = otpGenerator.generate(6,
            {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
        console.log("OTP generated", otp);

        // check if otp is unique or not
        //if it already exists in db it means it is not unique

        const otpExist = await OTP.findOne({otp: otp });
        while (otpExist) {
            otp = otpGenerator.generate(6,
                {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false,
                });

            otpExist = await OTP.findOne({ otp });
        }


        // create an entry in db
        const otpBody = await OTP.create({ email, otp });
        console.log("otp Body", otpBody);

        // return response successfully
        res.status(200).json({
            success: true,
            message: "OTP sent successfully!"

        })
    }
    catch (error) {
        console.log(error);
        console.log("Error occured while generating OTP!")
        res.status(500).json({
            success: false,
            message: "Unable to send OTP"
        })
    }
}

//signUp
exports.signup = async (req, res) => {

    try {
        // fetch data  from req body
        const { email, firstName, lastName, accountType, password, confirmPassword, otp } = req.body;

        // validate kero if all fields exist
        if (!firstName || !lastName || !confirmPassword || !password  || !email || !otp) {
            return res.status(403).json({
                succes: false,
                message: "All fields are compulsary",
            })
        }

        // match password and confirmPassword
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm Password must be same!",
            })
        }

        // check if the user exists
        const existingUser =await User.findOne({email: email });
        if (existingUser) {
            return res.status(200).json({
                success: false,
                message: "User is already registered! Please try with different  email.",
            })
        }


        // find most recent otp
        // sort==-1 will sort in decending order and limit will rfeturn the first value of answer
        const recentOTP = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recentotp", recentOTP);

        if (recentOTP.length == 0) {

            //otp not found
            return res.status(400).json({
                success: false,
                message: "OTP  NOT FOUND"
            })
        }
        else if (otp != recentOTP.otp) {

            // otp does not match
            return res.status(400).json({
                success: false,
                message: "INVALID OTP",
            })

        }

        //otp matched

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a profile for the user
        const profile = await Profile.create({ gender:null,
            DOB:null,
            about:null,
            contactNumber:null, });
        // create entry in db
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profile._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
        })

        // return res
        return res.status(200).json({
            success: true,
            message: "User is registered successfully!",
            user: user,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot  be registered.Please try again!"
        })

    }
}


//Login

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "Fill all the details carefully!"
            })
        }

        // check if email exists
        let user = await User.findOne({ email:email });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "User does not exist!"
            })

        }

        //password match 
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            // generate  jwt token and send 
            const token = jwt.sign(payload, process.env.JWT_SECRET,
                 {expiresIn: '24h'}
                
            )

            user=user.toObject();
            user.token=token;
            user.password=undefined;

            const options={
                expiresIn:new Date(Date.now()) + 3*24*60*60*1000,
                httpOnly:true,
            }

            //create a cookie and send response
            res.cookie("studyNotation_cookie",token,options).status(200).json({
                 success:true,
                 user:user,
                 token:token,
                 message:"Loggedin Sucessfully!"

            })
        }
        else {
            return res.status(403).json({
                success: false,
                message: "Password does not match!"
            })

        }

        
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login failure,please try again! "
        })

    }
}

// changepassword

// user is already logged in ,but in forgot password the user is not logged in he has only the
// email with which  he was registered
// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);

		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}


		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
                "Password for your account has been updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse);
		}
         catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });


	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};