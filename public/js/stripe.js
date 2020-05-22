import axios from 'axios'
import {showAlert} from './alert'
const stripe = Stripe('pk_test_ALq5FzD2iG4AqmtKvbrHz1Ij00kVa99ImV');



export const bookTour = async tourId =>{
    try{
        //1)GET cHECKOUT SESSION FROM API
        const session = await axios(
            `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
        )
        console.log(session)
        //2) Create checkout form + chanre creadit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id

        })
       
    }catch(err) {
        showAlert('error',err)

    }
}
