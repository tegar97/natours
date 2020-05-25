const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express();
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp =require('hpp')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const appError = require('./utils/appError')
const globalErorrHandler = require('./controller/errorController')
const cookieParser = require('cookie-parser')
const compression = require('compression')
app.use(morgan('dev'))

app.use(express.json({limit : '10kb'}))
app.use(cookieParser())
app.use(express.urlencoded({extended : true, limit : '10kb'}))
app.use((req,res,next) =>{

    next()
})
//setting template engine
app.set('view engine','pug')
app.set('views',path.join(__dirname, 'views'))


app.use(express.static(path.join(__dirname,'public')))



//Data Sanitizalition against nosql query injection
app.use(mongoSanitize())
//Data sanitization agains html/javascript
app.use(xss())

//http population
app.use(hpp({
    whitelist : [
        'ratingQuantity','ratingAverage','maxGroupSize','difficulty','price'
    ]
}))




const tourRouter = require('./route/tourRouter')
const userRouter = require('./route/userRouter')
const reviewRouter = require('./route/reviewRouter')
const viewRouter = require('./route/viewRouter')
const bookingRouter = require('./route/bookingRouter')

app.use(compression)
const limiter = rateLimit ({
    max : 555,
    windowMs : 60 * 60 * 1000,
    message : 'To many reqest from this ip , please try again in an hour'
})

app.use('/api',limiter)


const limiter2 = rateLimit ({
    max : 8,
    windowMs : 60 * 60 * 1000,
    message : 'To many reqest from this ip , please try again in an hour'
})

app.use('/api/v1/users/login',limiter2)

const limitForgotPassword = rateLimit ({
    max : 2,
    windowMs : 15 * 60 * 1000,
    message : 'Limit 2x send email,please try again in 15 minute'
})
app.use('api/v1/users/forgotPassword',limitForgotPassword)



app.use(helmet())
app.use('/',viewRouter)
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/review',reviewRouter)
app.use('/api/v1/booking',bookingRouter)



app.all('*',(req,res,next) =>{
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this Server`
    // })

    next(new appError(`Can't find ${req.originalUrl} on this Server`,404))
} )



app.use(globalErorrHandler)

module.exports = app