import {showAlert} from './alert'
import axios from 'axios'

export const reviewForm = async(tourId,rating,review) =>{
    try {
        const res = await axios({
            method : 'POST',
            url : `http://127.0.0.1:3000/api/v1/tours/${tourId}/reviews`,
            data : {
                tourId,
                rating,
                review
            }
           
        })
        if(res.data.status == 'success'){
            showAlert('success', 'Reviews success');
        }
        location.reload(true);
    } catch (err) {
         showAlert('error', err.response.data.message);
            
    
        
    }
}

export const deleteReview = async(reviewId) =>{
    try {
        const res = await axios({
            method : 'DELETE',
            url : `http://127.0.0.1:3000/api/v1/review/${reviewId}`
           
        })
        if(res.data.status == null){
            showAlert('success', 'Reviews Deleted');
        }
        location.reload(true);
    } catch (err) {
        console.log(err)
         showAlert('error', err.response.data.message);
            
    
        
    }

}