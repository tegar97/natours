const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config({path: './config.env'})
const Tour = require('./../../models/tourModels')
const Review = require('./../../models/ReviewModels')
const User = require('./../../models/userModel')

const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)
mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con =>{
    console.log('DB Connection successFULL')
})

//Read JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8' ))
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8' ))
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8' ))

//IMPORT Data Into DB
const importData = async () =>{
    try{
        await Tour.create(tours)
        await Review.create(review)
        await User.create(user,{validateBeforeSave : false})
        console.log('DATA successfully loaded!')

    }catch(err){
        console.log(err)
    }
}

//DELETE ALL DATA FROM COLLECTION

const deleteData = async() =>{
    try{
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
        console.log('DATA sucessfully deleted')

    }catch{
        console.log(err)

    }
}

if(process.argv[2] === '--import'){
    importData()
}else if(process.argv[2] ==='--delete'){
    deleteData();
}