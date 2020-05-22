
const express = require('express')
const router = express.Router()
const multer = require('multer')
const userController = require('./../controller/userController')
const authController = require('./../controller/authController')


//auth
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/logout', authController.logout);
//RESET PASSWORD

router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)

// Protetect all after this middleware
router.use(authController.protect)
//updatePassword
router.patch('/updatePassword',authController.updatePassword)
//update current  data
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe)
router.patch('/deleteMe',userController.deleteMe)


//get login user
router.get('/me',userController.getMe,userController.getUsers)
//Api users

router.use(authController.restrictTo('admin'))
router
   .route('/')
   .get(userController.getAllUsers)
   
   .post(userController.createUsers)
   

router
   .route('/:id')
   .get(userController.getUsers)
   .patch(userController.updateUsers)
   .delete(userController.deleteUsers)
   

   module.exports = router