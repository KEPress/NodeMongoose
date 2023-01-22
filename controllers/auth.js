const bcyrptjs = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const UsersModel = require('../models/user_model')
const { validationResult } = require('express-validator')

//Mail Trap Config
 const authorize = {
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "0e99a94373c6f8",
        pass: "8a449ea6dc35a7"
    }
}

/**
 * //KE Press domain mailer
 * const authorize = {
    host: 'mail.kepressclub.com',
    transportMethod: 'SMTP',
    secureConnection: true,
    port: 465,
    secure: true,
    auth: {
        user: 'admin@kepressclub.com',
        pass: 'Admin465%' 
    }
}
 */



const transport = nodemailer.createTransport(authorize)


exports.getRegisterPage = (request, response, next) => {
    //Flash Messaging
    let message = request.flash('info')
    if (message.length > 0) message = message[0]
    else message = null
    response.render('auth/register', {
        path: '/register',
        pageTitle: 'Register',
        isAuthenticated: false,
        errorMessage: message,
    })
}

exports.postRegister = (request, response, next) => {
    const name = request.body.name
    const surname = request.body.surname
    const email = request.body.email
    const username = request.body.username
    const passcode = request.body.passcode
    const errors = validationResult(request)
    if(!errors.isEmpty()) {
        console.log(errors.array())
        return response.status(422).render('auth/register', {
            path: '/register',
            pageTitle: 'Register',
            errorMessage: errors.array()[0].msg
        })
    } 
    bcyrptjs.hash(passcode, 12).then((hash) => {
            //Create New User
            new UsersModel({
                name: name,
                surname: surname,
                email: email,
                username: username,
                passcode: hash,
                cart: { items: []}
            }).save().then( function () {
                response.redirect('/login')
                return transport.sendMail({
                    to: email,
                    subject: `HELLO ${name} this is a Test`,
                    text: 'This is a sample demonstration email to test for verification purposes, please do not respond to email',
                }, (error, result) => {
                    if (error) console.log(error)
                    else console.log(`Response: ${result}`)
                })
            }).catch((error) => console.log(error))
        }).catch((error) => console.log(error))   
}

exports.getLoginPage = (request, response, next) => {
    //NOTE: console.log(request.flash()) to view what is stored in flash
    let message = request.flash('error')
    if (message.length > 0) message = message[0]
    else message = null
    response.render('auth/login', {
        path: '/login',
        pageTitle: 'Log in',
        isAuthenticated: false,
        errorMessage: message
    })
}

exports.postLogin = (request, response, next) => {
    const username = request.body.username
    const passcode = request.body.passcode
    UsersModel.findOne({username: username}).then((user) => {
        if (!user) {
            request.flash('error', 'Invalid Username')
            return response.redirect('/login')
        }  
        bcyrptjs.compare(passcode, user.passcode).then((result) => {
            if (result) {
                request.session.isOnline = true
                request.session.user = user
                return request.session.save((error) => {
                    console.log(error)
                    response.redirect('/')
                })
            } else {
                request.flash('error', 'Invalid Passcode')
                response.redirect('/login')
            }
        }).catch((error) => {
            console.log(error)
            response.redirect('/login')
        })
    })
     
}

exports.getResetPage = (request, response, next) => {
    let message = request.flash('error')
    if (message.length > 0) message = message[0]
    else message = null
    response.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Passcode Reset',
        errorMessage: message
    })
}

exports.postReset = (request, response, next) => {
    crypto.randomBytes(32, (error, buffer) => {
        if (error) return response.redirect('/reset')
        const token = buffer.toString('hex')
        UsersModel.findOne({ email: request.body.email })
        .then((user) => {
            if (!user) {
                request.flash('error', 'Email not found')
                return response.redirect('/reset')
            } 
            user.resetToken = token
            user.resetTokenExpiration = Date.now() + 3600000
            return user.save()
        }).then(function () {
            response.redirect('/')
            transport.sendMail({
                to: request.body.email,
                from: 'admin@expresshop.com',
                subject: 'Passcode Reset Request',
                html: `<p> You requested a Passcode Reset</p>
                       <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a>to reset passcode</p>`
            })
        }).catch((error) => {
            console.log(error)
        })

    })
}


exports.updatePasscodePage = (request, response, next) => {
    const token = request.params.token
    UsersModel.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then((user) => {
        let message = request.flash('error')
        if (message.length > 0) message = message[0]
        else message = null
        response.render('auth/change-pass', {
            path: '/change',
            pageTitle: 'New Passcode',
            errorMessage: message,
            userId: user._id.toString(),
            token: token
        })
    }).catch((error) => { console.log(error) })
   
}

exports.updatePasscode = (request, response, next) => {
    let resetData //declare outside 
    const newPasscode = request.body.passcode
    const userId = request.body.userId
    const tokenPass = request.body.token 
    UsersModel.findOne({
        resetToken: tokenPass, 
        resetTokenExpiration: {$gt: Date.now()}, 
        _id: userId
    }).then((user) => {
        resetData = user
        return bcyrptjs.hash(newPasscode, 12)
    }).then((hashPasscode) => {
         resetData.passcode = hashPasscode
         resetData.resetToken = null
         resetData.resetTokenExpiration = undefined
         return resetData.save()
    }).then(function (){
        response.redirect('/login')
    }).catch((error) => console.log(error))

}

exports.postLogout = (request, response, next) => {
   request.session.destroy((error) => {
        console.log(error)
        response.redirect('/')
   })

}