const express = require('express')
const router = express.Router()
const viewsController = require('../controller/viewsController.js')
const authController = require('../controller/authController')
const bookingController = require('../controller/bookingController')


router.get('/',bookingController.createBookingCheckout,authController.isLoggedIn,viewsController.getOverview)
router.get('/tour/:slug',authController.isLoggedIn,viewsController.getTour)
router.get('/login',authController.isLoggedIn,viewsController.getloginForm)
router.get('/forgotPassword',viewsController.getForgotPasswordForm)
router.get('/resetPassword/:token',viewsController.getResetPassword)
router.get('/me',authController.protect,viewsController.getAccount)
router.get('/myTours',authController.protect,viewsController.getMyTours)

// router.post('/submit-data-user',authController.isLoggedIn,viewsController.updateUserData)
module.exports = router