const express = require('express')
const tourController = require('./../controller/tourController')
const router = express.Router()
const authController = require('../controller/authController')
// const reviewController = require('./../controller/reviewController')
const reviewRoute = require('./reviewRouter')
// router.param('id',tourController.checkId)

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours ,tourController.getAllTours)

router
     .route('/tour-stats')
     .get(tourController.getTourStats)

router
     .route('/monthly-plan/:year')
     .get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan)


router
   .route('/')
   .get(tourController.getAllTours)
   .post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTours)


router.route('/tours-within/:distance/center/:latlng/unit/:unit')
      .get(tourController.getToursWithin)
router.get('/distance/:latlng/unit/:unit',tourController.getDistances)
router
    .route('/:id')
    .get(tourController.getTours)
    .patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.uploadTourImages,tourController.resizeTourImage,tourController.updateTours)
    .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour)



//versi 1
// router.post('/:tourId/reviews',authController.protect,authController.restrictTo('user'),reviewController.createReview )
//versi 2 
router.use('/:tourId/reviews',reviewRoute)
module.exports = router