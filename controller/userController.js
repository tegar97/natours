const User = require('./../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')

const multer = require('multer')
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({
//     destination : (req,file,cb) =>{
//         cb(null,'public/img/users');
//     },
//     filename : (req,file,cb) =>{
//         const ext = file.mimetype.split('/')[1]
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)

//     }
// })
const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) =>{
    if(file.mimetype.startsWith('image')) {
        cb(null,true)
    }else{
        cb(new AppError('Not And Image ! please upload only images',400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
})

exports.uploadUserPhoto = upload.single('photo')
//conver and resizing using libray sharp
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
  
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);
  
    next();
  });


const filterObj = (obj,...allowedFields) =>{
    const newObj = {}
    Object.keys(obj).forEach(el =>{
        if(allowedFields.includes(el)) {
          newObj[el] = obj[el]
        }
    })
    return newObj

}
exports.getMe = (req,res,next) =>{
    req.params.id = req.user.id
    next() 
}
exports.getAllUsers = factory.getAll(User)
exports.createUsers = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message: 'The Route is not define'
    })
}

exports.updateMe = catchAsync (async(req,res,next) => {

    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('Please if you want update password go to /updatePassword'))
    }

    //filter 
    const filterBody = filterObj(req.body,'name','email');
  
    if(req.file) {
        
        filterBody.photo = req.file.filename;
      
        
    }
  
    const updateUser = await User.findByIdAndUpdate(req.user.id , filterBody,{
        new :true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data : {
            user : updateUser
        }
    })
   
})


exports.deleteMe = catchAsync(async(req,res,next) =>{
    await User.findByIdAndUpdate(req.user.id , {isActive : false})
    res.status(204).json({
        message: 'success',
        data : null
        
    })
 
})

exports.deleteUsers = factory.deleteOne(User)
exports.updateUsers = factory.updateOne(User)
exports.getUsers = factory.getOne(User)

