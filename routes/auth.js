//NOTE: Can add as many methods in the get, post, put routes and these are parsed from LEFT to RIGHT
//Be mindful of where these methods are positioned
//Destructuring { }

const express = require('express')
const { check, body } = require('express-validator')
const authController = require('../controllers/auth')
const User = require('../models/user_model')
const router = express.Router()

router.get('/register',  authController.getRegisterPage)
      .post('/register', [ check('email').isEmail().withMessage('Please enter valid email')
      .custom((value) => {
          return User.findOne({email: value}).then((user)  => {
                  if (user) return Promise.reject('Email already exists')
            })
      }), body('passcode', 'Passcode too short').exists({checkFalsy: true})
                  .withMessage('Please enter Passcode').isLength({min: 5}).isAlphanumeric(),
          body('confirmPass').exists({checkFalsy: true}).withMessage('Please enter Confirm')
            .custom((value, {request}) => {
                  if (value !== request.body.passcode) throw new Error('Passcode confirm wrong')
                  return true
            }) ], authController.postRegister)



router.get('/login', authController.getLoginPage)
      .post('/login', authController.postLogin)

router.get('/reset', authController.getResetPage)
      .post('/reset', authController.postReset)

router.get('/reset/:token', authController.updatePasscodePage)
      .post('/change', authController.updatePasscode)

router.post('/logout', authController.postLogout)


module.exports = router