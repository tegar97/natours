/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import {forgotPassword,resetPassword} from './forgotPassword'
import {bookTour} from './stripe'
import {reviewForm,deleteReview} from './review'
import {signup,sendVerifyEmail} from './signup'

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const forgotPasswordBtn = document.querySelector('.form-forgot-password')
const resetPasswordBtn = document.querySelector('.form-reset-password')
const bookBtn = document.getElementById('book-tour')
const signUpBtn = document.getElementById('form-sign-up')
const verifBtn = document.getElementById('verifAccount')
const reviewBtn = document.getElementById('form--review')
const deleteReviewBtn = document.getElementById('form--review__delete')

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
  

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

  if(bookBtn){
      bookBtn.addEventListener('click',e =>{
          e.target.textContent = 'Processing.....'
          const {tourId} = e.target.dataset
          bookTour(tourId)
      })
  }
  if(forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('submit', async e => {
      e.preventDefault()
      document.querySelector('.btn-email').textContent = 'Processing....';
      const email = document.getElementById('email').value

      await forgotPassword(email)
      document.querySelector('.btn-email').textContent = 'Send Email'
  
    })
  }
  if(resetPasswordBtn) {
    resetPasswordBtn.addEventListener('submit',e => {
      e.preventDefault()
      const password = document.getElementById('password').value
      const passwordConfirm = document.getElementById('passwordConfirm').value
      const resetBtn = document.getElementById('resetBtn')
    
      const tokenId = resetBtn.dataset.usertoken

      resetPassword(tokenId,password,passwordConfirm)
    })
  }

if(signUpBtn){
  signUpBtn.addEventListener('submit', e =>{
    e.preventDefault()
    document.querySelector('.btn-signup').textContent = 'Processing....';
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('passwordConfirm').value
    console.log(passwordConfirm)
    signup(name,email,password,passwordConfirm)

  })
}

if(verifBtn) {
  verifBtn.addEventListener('click' , e =>{
   sendVerifyEmail()
  })
}

if(reviewBtn) {
  reviewBtn.addEventListener('submit',e =>{
    e.preventDefault()
    const rating = document.getElementById('rating').value
    const review = document.getElementById('review').value
    const btnReview = document.getElementById('btnReview')
    const tourId = btnReview.dataset.tourid
  

    reviewForm(tourId,rating,review)
  })
}

if(deleteReviewBtn) {
  deleteReviewBtn.addEventListener('submit',e => {
    e.preventDefault()
    const btnDeleteReview = document.querySelector('.btnDeleteReview')
    const reviewId = btnDeleteReview.dataset.reviewid
    // console.log(reviewId)
    deleteReview(reviewId)
  })
}