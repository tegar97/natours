import {showAlert} from './alert'
import axios from 'axios'

export const forgotPassword = async(email) =>{
    try {
        const res = await axios ({
            method : 'POST',
            url:'/api/v1/users/forgotPassword',
            data :{
                email
            }
        })
        if(res.data.status == 'success') {
            showAlert('success','Email Sent!, Please check your email')
        }

    } catch (err) {
        console.log(err)
        showAlert('error',err.response.data.message)
    }

}

export const resetPassword = async (token,password,passwordConfirm) =>{
    try {
        const res = await axios ({
            method : 'PATCH',
            url: `/api/v1/users/resetPassword/${token}`,
            data :{
                password,
                passwordConfirm
            }
        })
        // console.log(token)
        if(res.data.status == 'success') {
            showAlert('success','Success ! Password has changed')
            window.setTimeout(() => {
                location.assign('/login')
            },1500)
        }

    } catch (err) {
        console.log(err)
        showAlert('error',err.response.data.message)
    }


}