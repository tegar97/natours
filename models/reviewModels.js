const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema
const Tour = require('./tourModels')
const reviewSchema = new mongoose.Schema({
    review :{
        type: String,
        required : [true,'Review can not be empty !']
    },
    rating : {
        type : Number,
        max : 5,
        min : 1
    },
    createdAt :{
        type : Date,
        default : Date.now

    },
    tour: {
        type : ObjectId,
        ref : 'Tour',
        required : [true,'Review must belong to a tour']
    },
    user : {
        type : ObjectId,
        ref : 'User',
        required : [true,'Review must belong to a users']

    },
    


},
{
    toJSON: {virtuals :true},
    toObject : {virtuals : true}
}
)

reviewSchema.pre(/^find/,function(next) {
    this.populate({
        path : "tour",
        select: "name id slug",
      
    }).populate({
        path : 'user',
        select : 'name photo'
    })
    next()
})


reviewSchema.statics.calcAverageRatings = async function(tourId) {
  
    const stats = await this.aggregate([
        {
            $match : {tour : tourId}
        },
        {
            $group : {
                _id : '$tour',
                nRating : {$sum : 1},
                avgRating : {$avg : '$rating'}
            }
        }
    ])
    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity : stats[0].nRating,
            ratingsAverage : stats[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity : 0,
            ratingsAverage : 4.5
        })
    }
    
}

reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
  });
  
  // findByIdAndUpdate
  // findByIdAndDelete
  reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
  });
  
  reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
  });
reviewSchema.index({tour: 1,user: 1},{unique: true})
// reviewSchema.pre(/^findOneAnd/, async function(next) {
//     this.r = await this.findOne();
//     // console.log(this.r);
//     next();
//   });
  
//   reviewSchema.post(/^findOneAnd/, async function() {
//     // await this.findOne(); does NOT work here, query has already executed
//     await this.r.constructor.calcAverageRatings(this.r.tour);
//   });
const Review = mongoose.model('Review',reviewSchema)
module.exports = Review