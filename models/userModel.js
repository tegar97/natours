const crypto = require('crypto')
const mongoose = require('mongoose')
const validator  = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,'Please tell us your name!'],
     
    },
    email : {
        type : String,
        required : [true,'Please provide your email'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail]
    },
    photo : {
        type : String,
        default : 'default.jpg'
    },
    role : {
        type : String,
        enum : ['user','guide','lead-guide','admin'],
        default : 'user'
    
    
    },
    password : {
        type : String,
        required : [true,'please provide a password'],
        minLength : 8,
        select : false
    },
    passwordConfirm : {
        type : String,
        required : [true,'please confirm  your  password'],
        validate  :{
            validator : function(el) {
                return el === this.password
            },
            message : 'Password are not the sane'
        },
        select : false
    },
    passwordChangeAt : Date,
    passwordResetToken : String,
    passwordResetExpire : Date,
    isActive : {
        type : Boolean,
        default : true,
        select : false
    },
    isVerif : {
        type: Boolean,
        default :false
    },
    emailVerifToken : String,
    emailVerifExpire : Date
})

userSchema.pre('save',async function(next) {
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password,12)

    this.passwordConfirm = undefined

    this.emailVerifToken
    next()
})

userSchema.pre('save',function(next) {
    if(!this.isModified('password') || this.isNew) {
        return next()
    }
    this.passwordChangeAt = Date.now() - 1000
    next()

})

userSchema.methods.correctPassword = async function(
    cadidatepassword,
    userPassword
){
     return await bcrypt.compare(cadidatepassword,userPassword) 
  
    
}
userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangeAt) {
        const changeTimeStamp = parseInt(this.passwordChangeAt.getTime() / 1000,10)
        // console.log(changeTimeStamp,JWTTimestamp);
        return JWTTimestamp < changeTimeStamp

    }


},
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
     
    // console.log({resetToken},this.passwordResetToken)
     this.passwordResetExpire = Date.now() + 10 * 60 * 1000

     return resetToken
}



userSchema.pre(/^find/,function(next) {
    this.find({active : {$ne : false}})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User