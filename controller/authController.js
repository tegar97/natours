const {promisify} = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const AppError = require('./../utils/appError')
const catchAsync = require('../utils/catchAsync')

const crypto = require('crypto')
const Email = require('../utils/email')


const signToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user,statusCode,res) =>{
    const token = signToken(user._id)
    const cookieOptions = {
        expires : new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 *60 *60 *1000
        ),
        httpOnly : true

    }
    // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt',token,cookieOptions)
    user.password = undefined




    res.status(statusCode).json({
        status: 'success',
        token,
        data : {
            user
        }
    })

}

exports.signup = catchAsync(async (req,res,next) =>{
    const newUser = await  User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        role : req.body.role,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangeAt : req.body.passwordChangeAt
    })
    const url = `${req.protocol}://${req.get("host")}/login`
    await new Email(newUser,url).sendWelcome()
    createSendToken(newUser,201,res)
    // const token = jwt.sign({id : newUser._id},process.env.JWT_SECRET,{
    //     expiresIn : process.env.JWT_EXPIRES_IN
    // })

    // res.status(201).json({
    //     status : 'success',
    //     token,
    //     data :{
    //         user : newUser
    //     }
    // })
})

exports.login =  catchAsync(async(req,res,next) =>{
    const {email,password} = req.body 

    if(!email || !password) {
        return next(new AppError('please provide email or password',400))
    }
    const user = await User.findOne({email}).select('password')
    if(!user) {
        return next(new AppError('incorect email',401))
    }
    const correct = await user.correctPassword(password,user.password)
 
    if(!correct) {
        return next(new AppError('incorect  password',401))
    }
    
    createSendToken(user,200,res)

    

})


exports.protect = catchAsync( async(req,res,next) =>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
        token = req.cookies.jwt
    }
 
  
    if(!token) {
        return next(new AppError('invalid token',401))
    }

    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)

    //cek users still exist or not 

    const currentUser =  await User.findById(decoded.id)
    if(!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist',401))
    }

    if(currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('user recently change password! ,please log in again',401 ))
    }
     
    req.user = currentUser
    res.locals.user = currentUser;
    next()

}),

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
 
  };
  
//Only For rendered pages,no errors !!!!!
exports.isLoggedIn =  async(req,res,next) =>{
   //1.VERIFY TOKEN
    if(req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET)

            //2.cek users still exist or not 
        
            const currentUser =  await User.findById(decoded.id)
            if(!currentUser) {
                return next()
            }
        
            // 3.Check if users changed  password  after the token was issued 
            if(currentUser.changePasswordAfter(decoded.iat)) {
                return next()
            }
            
          
        //There is A LOGGED IN USER
            res.locals.user = currentUser
            return next()
            
        } catch (error) {
            // if(error.name === 'undefined') {
            //     const message = 'Anda tidak bisa login selama 1jam'
            //     return new AppError(message,400)
            // }
          
            return next()
        }
    
     
  }
  next()
  
};

exports.checkCookies = async(req,res,next) =>{
    if(req.cookies.jwt) {
        const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET)
         //2.cek users still exist or not 

         res.redirect('/')


    }
    
    
},
exports.restrictTo = (...role) =>{
    return (req,res,next) =>{
        if(!role.includes(req.user.role)) {
            return next(
                new AppError('You dont have permission ',403)
            )

        }    next()
    }

},
exports.forgotPassword = catchAsync(async (req,res,next) =>{

    //1.get user based on posted email
     const user = await User.findOne({email : req.body.email})
     if(!user) {
         return next(new AppError('There is no user with that email address',404))
     }


     //2.Generate the random reset token
     const resetToken = user.createPasswordResetToken()
     await user.save()


     //3.send it to user's email
     
     try {
        const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`
        // await sendEmail({
        //     email : user.email,
        //     subject : 'your password reset token (valid for 10 min)',
        //     message
        // })
        await new Email(user,resetUrl).sendPasswordReset()
        res.status(200).json({
            status : 'success',
            message : 'please check your email'
        })
    } catch (error) {
        console.log(error)
        user.passwordResetExpire = undefined,
        user.passwordResetToken = undefined 
        await user.save({validateBeforeSave: false})
        return next(new AppError('can not send email , please try later ',500))
        
    }
     
}),

exports.resetPassword  = catchAsync(async (req,res,next) =>{
    //1. Get User based on the token
    const hashedToken = crypto
         .createHash('sha256')
         .update(req.params.token)
         .digest('hex')
    const user = await User.findOne({passwordResetToken : hashedToken ,passwordResetExpire :{$gt: Date.now()}})

    //2.if token has not expired and there is user , set the new password

    if(!user) {
        return next(new AppError('Token is invalid or has expired',400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm 
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined
    await user.save()

  
    createSendToken(user,200,res)
})

exports.updatePassword = catchAsync(async(req,res,next) =>{
    //1.GET USER FROM COLLECTION 
     const user = await User.findById(req.user.id).select('password ')

     //2.GET IF POSTER CURRENT 
     if(!(await user.correctPassword(req.body.passwordCurrent,user.password))) {
         return next(new AppError('Your current password is wrong',401))
     }

     //3.if so , update password
     user.password = req.body.password
     user.passwordConfirm = req.body.passwordConfirm 
     await user.save()

     //4.log user in send jwt
     createSendToken(user,200,res)
    
})

