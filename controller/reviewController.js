const catchAsync = require('../utils/catchAsync')
const Review = require('../models/reviewModels')
const factory = require('./handlerFactory')

//Reusable version
exports.allReview = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)

//reguler version

// exports.allReview = catchAsync(async (req,res) =>{
//     let filter = {}
//     if(req.params.tourId) {
//         filter = {tour :req.params.tourId}
//     }
//     const review = await Review.find(filter)

//     res.status(200).json({
//         status : 'success',
//         result : review.length,
//         data : review
//     })


// })
// exports.createReview = catchAsync(async (req,res) =>{
//     //allow nested route
//     if(!req.body.tour) {
//         req.body.tour = req.params.tourId
//     }
//     if(!req.body.user) {
//         req.body.user = req.user.id
//     }

//     const newReview = await Review.create(req.body)
//     res.status(201).json({
//         statsu : 'success',
//         review : newReview
//     })




// })
exports.setTourUserIds = (req,res,next) =>{
    if(!req.body.tour) {
        req.body.tour = req.params.tourId
    }
    if(!req.body.user) {
        req.body.user = req.user.id
    }
    next()
}
