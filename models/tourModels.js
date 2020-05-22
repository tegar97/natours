const mongoose = require('mongoose')
const slugify = require('slugify')
const validator  = require('validator')
const {ObjectId} = mongoose.Schema
// const User = require('./userModel')
const tourSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true,'A tour must have a name'],
        unique: true,
        trim: true,
        minlength : [6,'A tour name must have more or equel than 6 characher'],
        maxlength : [100,'A tour name must have more or equel than 6 characher'],
        valdiate : validator.isAlpha
    },
    slug:  String,
    duration:{
        type: Number,
        required: [true,'A tour must have a duration']

    },maxGroupSize: {
        type: Number,
        required: [true,'A tour must have a group size']

    },difficulty: {
        type: String,
        required: [true,'A tour must have a diffuculty'],
        enum : ['easy','medium','difficult']

    },
    
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min : [1,'A tour must bigger than 1'],
        max : [5,'A tour must less  than 5'],
        set: val => Math.round(val * 10) /10
    },
    ratingsQuantity:{
        type: Number,
        default: 0

    },
    price: {
        type: Number,
        required: [true,'A tours must have price']
    },
    priceDiscount: {
     type : Number,
     validate :{
        validator : function(val) {
             return val < this.price
        },
     message: "Discount price ({VALUE}) should below regular price"
      }
    },
     

    summary:{
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover:{
        type: String,
        required: [true,'a tour mus have a cover image']
    },
    
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startLocation: {
        type : {
            type: String,
            default : 'Point',
            enum : ['Point']
        },
        coordinates : [Number],
        address: String,
        description : String
    },
    locations : [{
        type :{
            type :String,
            default : 'Point',
            enum : ['Point']
        },
        coordinates : [Number],
        address : String,
        description : String,
        day : Number
    }],
    guides : [{
        type: ObjectId,
        ref: 'User'
    }],
  
  
    startDates: [Date]

     },
       {
        toJSON: { virtuals: true },

        toObject: { virtuals: true }
      }
      
      )
    tourSchema.virtual('reviews' ,{
        ref: "Review",
        foreignField: "tour",
        localField: "_id"
    });
    tourSchema.virtual('durationWeek').get(function(){
        return this.duration / 7

    });
 
    ///Document middleware
    tourSchema.pre(/^find/,function() {
        this.populate({
            path : 'guides',
            select : '-__v -passwordChangeAt'
        })
    })

    tourSchema.pre('save',function(next){
        this.slug = slugify(this.name,{lower :true})
        next()
    })
    // tourSchema.pre('save',async function(next) {
    //     const guidesPromises = this.guides.map(async id => await User.findById(id) )
    //     this.guides = await Promise.all(guidesPromises)
    //     next()
    // })

tourSchema.index({price: 1,ratingsAverage: -1})
tourSchema.index({slug: 1})
tourSchema.index({startLocation : '2dsphere'})

const Tour = mongoose.model('Tour',tourSchema)

// const testTour = new Tour({
//     name: "THE camp ",
//     price: 25
// })
// testTour.save().then(doc =>{
//     console.log(doc)
// }).catch(err =>{
//     console.log("error",err)
// })

module.exports = Tour