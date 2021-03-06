const mongoose = require('mongoose')
const dotenv = require('dotenv').config({path: './config.env'})
const app = require('./app')


const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)
mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con =>{
    console.log('DB Connection successFULL')
})


const port = 3000


const server =app.listen(port,() =>{
    console.log(`Listening on port ${port}`)
})

// process.on('unhandledRejection',err => {
//     console.log(err.name,err.message)
//     console.log('UNHANDLED REJECTION')
//     server.close(() => {
//         process.exit(1)
//     })
// })