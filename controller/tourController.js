const fs = require('fs')
const Tour = require('./../models/tourModels')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')



const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) =>{
    if(file.mimetype.startsWith('image')) {
        cb(null,true)
    }else{
        cb(new AppError('Not And Image ! please upload only images',400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
})

exports.uploadTourImages = upload.fields([
  {name :'imageCover',maxCount: 1},
{name : 'images', maxCount: 3}
])

//upload.single('image') req.file
//upload.array('images',5) req.files
exports.resizeTourImage = catchAsync(async(req,res,next) =>{
   if(!req.files.imageCover || !req.files.images ) return next()

   //1) Cover Image
   req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
   await sharp(req.files.imageCover[0].buffer)
         .resize(2000,1333)
         .toFormat('jpeg')
         .jpeg({quality: 90})
         .toFile(`public/img/tours/${req.body.imageCover}`)

  //2)multiple images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file,i) =>{
      const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg `

      await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality : 90})
        .toFile(`public/img/tours/${filename}`)
        

        req.body.images.push(filename)
    })
  )

  next()
})

exports.aliasTopTours = (req,res,next) =>{
     req.query.limit = '5'
     req.query.sort =  'ratingsAverage,price'
     req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
     next()

    }
   
exports.getAllTours = factory.getAll(Tour)
// exports.createTours =  catchAsync(async(req,res) =>{
 
//     const newTour = await Tour.create(req.body)
//             res.status(201).json({
//                 status: 'success',
//                 data:{
//                     tour: newTour
//                 }
//             })

        
    
//     })

exports.createTours = factory.createOne(Tour)
    
// exports.getTours =  catchAsync(async(req,res) =>{
     
//      const tour = await Tour.findById(req.params.id).populate({path : 'reviews',select: '-tour _id review rating'});
    

//      if(!tour) {
//          return next(new AppError('Not Found with that id',404))
//      }
//     res.status(200).json({
//         status: 'sukses',
//          data: {
//                 tour
//                 }
//             })

        
     
    
//     })
exports.getTours = factory.getOne(Tour,{path : 'reviews',select: '-tour _id review rating'})
    
// exports.updateTours =  catchAsync(async(req,res) =>{
//     const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
//          new: true,
//         runValidators: true

//     })
//     if(!tour) {
//         return next(new appError('Not Found with that id',404))
//     }
//      res.status(200).json({
//          status: 'data has been update',
//          data: {
//                 tour 
//                }
//         })

    
       
        
    
//     })
exports.updateTours = factory.updateOne(Tour)
    


// exports. deleteTours = catchAsync(async(req,res) =>{
//     const tour = await Tour.findByIdAndDelete(req.params.id)
//     if(!tour) {
//         return next(new AppError('Not Found with that id',404))
//     }
//     res.status(200).json({
//         status: 'success',
//         tour: null
//         })

      
    
//     })

exports.deleteTour = factory.deleteOne(Tour)

exports.getTourStats = catchAsync(async (req,res) => {
    const stats = await Tour.aggregate([
      {
        $match : {ratingsAverage : {$gte: 4.5} }

     },{
        $group: {
                   _id: {$toUpper : '$difficulty'},
                    numTours: {$sum: 1},
                    numsRating: {$sum : '$ratingQuantity'},
                    avgRating : {$avg: '$ratingsAverage'},
                    avgPrice : {$avg: '$price'},
                    minPrice : {$min: '$price'},
                    maxPrice : {$max: '$price'}
                    
                }
            }]
            )


       
    })
exports.getMonthlyPlan = catchAsync(async (req,res) => {
            const year = req.params.year * 1
            const plan = await Tour.aggregate([
            {
                $unwind : '$startDates'
            },
            {
                $match:{
                    startDates: {
                        $gte : new Date(`${year}-01-01`),
                        $lte : new Date(`${year}-12-31`)
                    }
                }
            },
                {
                $group:{
                    _id : {$month : '$startDates'},
                    numTourStarts : {$sum: 1},
                    tours: {$push: '$name'}

                },
                
            },
            {
                $addFields: {month : '$_id'}
            },
            {
                $project: {
                    _id: 0,
                }

            },
            {
                $sort: {numTourStarts: -1}
            }
            
            
            ])
            res.status(200).json({
                status: 'success',
                data :{
                    plan
                }
            })
        
    })

exports.getToursWithin = catchAsync(async(req,res,next) =>{
    const {distance,latlng,unit} = req.params;
   const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    if(!lat || !lng){
        next(
            new AppError('please provide latitutr and longitude in the format lat ,lng',400)
        )
    }
    const tours = await Tour.find({startLocation: {$geoWithin : {$centerSphere : [[lng,lat],radius]}}  })
 
    res.status(200).json({
        statatus : 'success',
        result : tours.length,
        data :{
            data : tours
        }
    })
 })

 exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });
