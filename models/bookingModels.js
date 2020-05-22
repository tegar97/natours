const mongoose = require('mongoose');

const bookingSchema  = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref : 'Tour',
        required : [true,'booking must belong a tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref : 'User',
        required : [true,'User must belong a tour!']
    },
    price: {
        type: Number,
        required: [true,'Booking Must have a price']
    },
    createdAt : {
        type : Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default : true
    }
})

bookingSchema.pre(/^find/, function(next){
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })
    next()
})
const Booking = mongoose.model('Booking',bookingSchema)

module.exports  = Booking;