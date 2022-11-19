const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const app = require('../app');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const sendEmail = require('./../utils/email');

// console.log(__);


exports.signup = async (req, res) => {

    const newUser = await User.create(req.body);
    // console.log(newUser.email);
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });  //payload and secret

    //For Sending email

    // let mailTransporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'tribhuwanbisht.nita@gmail.com',
    //         pass: 'qqjclwrtbxauzciw'
    //     }
    // });

    // let mailDetails = {
    //     from: 'tribhuwanbisht.nita@gmail.com',
    //     to: newUser.email,
    //     subject: 'Welcome to the NITA Student Portal',
    //     text: `Thank you ${newUser.name} for registering in the NITA Student Portal.

    //            Your registration has been successfully completed.

    //            You will receive notifications about the events in this registered email.`
    // };

    // mailTransporter.sendMail(mailDetails, function (err, data) {
    //     if (err) {
    //         console.log('Error Occurs', err);
    //     } else {
    //         console.log('Email sent successfully');
    //     }
    // });

    //Email sending end here

    // await sendEmail({
    // email: newUser.email,

    // res.status(200).json({
    //     status: 'success',
    //     message: 'Token sent to email!'
    // });
    // });
    res
        .status(201)
        .json({ status: "success", token, data: newUser });
    // .render('base');
    // .sendFile()

}


exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    // console.log(req.body);
    //1. Check if email and password exist
    // if (!email || !password) {
    //     console.log("Error");
    // }



    //2. Check if the user exists & password is correct
    const user = await User.findOne({ email }).select('+password');
    // console.log(user);


    if (!user || !await user.correctPassword(password, user.password)) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }


    //3. If everything ok send the token back to the client
    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200)
        .render('dashboard');
    // .json({
    //     status: 'success',
    //     token
    // });

}



exports.protect = catchAsync(async (req, res, next) => {
    //1. Getting token and check if its there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }


    //2. Token verification
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

    //3. Check if user still exists
    const currentUser = await User.findById(decoded.id);


    //4. Check if user changed password after the jwt was issued



    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;

    // console.log(req.user);
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};