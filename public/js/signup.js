import {showAlert} from './alert'
import axios from 'axios'



export const signup = async(name,email,password,passwordConfirm) => {
    try {
        const res = await axios({
            method : 'POST',
            url : 'http://127.0.0.1:3000/api/v1/users/signup',
            data :{
                name,
                email,
                password,
                passwordConfirm

            }
        })
        if(res.data.status == 'success'){
            showAlert('success', 'Success Signup');
           window.setTimeout(() => {
               location.assign('/')
           },1500)
        }
    } catch (err) {
         showAlert('error', err.response.data.message);
            
    
        
    }
}

export const sendVerifyEmail = async() =>{
    try {
        const res = await axios({
            method : 'PATCH',
            url : 'http://127.0.0.1:3000/api/v1/users/sendEmailVerify'
           
        })
        if(res.data.status == 'success'){
            showAlert('success', 'Success,Please Check Your Email');
        }
    } catch (err) {
         showAlert('error', err.response.data.message);
            
    
        
    }
}