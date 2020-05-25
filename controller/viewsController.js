const Tour = require('../models/tourModels')
const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')
const User = require('./../models/userModel')
const Booking = require('./../models/bookingModels')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const Reviews = require('./../models/reviewModels')
exports.getOverview = catchAsync(async(req,res) =>{
    const tours = await Tour.find()

    res.status(200).render('overview',{
        title : 'overview',
        tours
    })
})
exports.getTour = catchAsync(async(req,res,next) =>{
    
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
      });
    if(!tour) {
        return next(new AppError('No tours with that name',404));
    }
    res.status(200).render('tour',{
        title : `${tour.name} Tour`,
        tour
    })
  
})

exports.getloginForm = catchAsync(async(req,res,next) => {
    if(req.cookies.jwt === 'loggedout' || !req.cookies.jwt) {
        res.status(200).render('login',{
            title : 'Natours Login'
        })
    }else if(req.cookies.jwt){
        return res.redirect('/')
    }
   
  
})

exports.getForgotPasswordForm = catchAsync(async(req,res,next) => {
    if(req.cookies.jwt === 'loggedout' || !req.cookies.jwt) {
        res.status(200).render('forgotPassword',{
            title : 'Natours || Forgot Password'
        })
    }else if(req.cookies.jwt){
        return res.redirect('/')
    }
   
  
})
exports.getResetPassword = catchAsync(async(req,res,next) =>{
     //1. Get User based on the token
     const token = req.params.token
     const hashedToken = crypto
     .createHash('sha256')
     .update(req.params.token)
     .digest('hex')
    
    
    const user = await User.findOne({passwordResetToken : hashedToken ,passwordResetExpire :{$gt: Date.now()}})

    if(!user) {
        return res.redirect('/')
    }
 
    res.status(200).render('resetPassword',{
        title : ` reset password ${user.name}`,
        token
    })
})

exports.getAccount = (req,res) =>{
    res.status(200).render('account',{
        title : 'Your Account',
       
        
    })
}

exports.getMyTours = catchAsync(async(req,res,next) =>{
    //1.find all booking
    const bookings = await Booking.find({user: req.user.id })

    //2.find tours wtih the returned Ids
    const toursIDs = bookings.map(el => el.tour );
    const tours = await Tour.find({_id : {$in : toursIDs}})

    res.status(200).render('toursBooked',{
        title : 'My Tours',
        tours
    })
})

exports.MyTours = catchAsync(async(req,res,next) =>{
    
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
      });
    const review = await Reviews.findOne({tour : tour.id,user : req.user.id})
    // console.log(review)
    if(!tour) {
        return next(new AppError('Yo dont have tour with that name',404));
    }

   
    res.status(200).render('tourBooked',{
        title : `${tour.name} Tour`,
        tour,
        review
        
        
    })
 

    
})


exports.getSignUp = catchAsync((req,res) =>{
    res.status(200).render('signup',{
        title : 'Signup',
        
    })
})

