const path = require('path')
const express = require('express') 
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csurf = require('csurf')
const flash = require('connect-flash')
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const User = require('./models/user_model')
const error = require('./controllers/error')


//NOTE: Order of code matters as Express is run from Top to Bottom

//Works with MongoDB connection string to connect to cluster/server
// Use database & passcode from MongoDB cluster/server
// Setup session data 
const database = 'shop-express', passcode = 'KE_Pressltd2025'
const MONGODB_URI = `mongodb+srv://KEPressUser:${passcode}@cluster0.lp345ou.mongodb.net/${database}`

const app = express(), port = 3000

const store = new MongoDBStore({ uri: MONGODB_URI, collection: 'sessions'})

//Intiate csurf protection middleware
const csurfProtect = csurf({})

//This view engine is for ejs platform
app.set('view engine', 'ejs').set('views', 'views')

//parse url code in url address
app.use(bodyParser.urlencoded({ extended: false }))

//Access to public folder where css and other stuff are stored
app.use(express.static(path.join(__dirname, 'public')))

//Setup User session middleware
//Chain both csurf Protection and flash (These must be intialized after the session)
app.use(session({
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false, 
    store: store
})).use(csurfProtect).use(flash())


//Load User Session 
 app.use( (request, response, next) => {
    if (!request.session.user) return next()
    User.findById(request.session.user._id).then((user) => {
       request.user = user
       next()
    }).catch((error) => console.log(error)) 
})
 
app.use( (request, response, next) => {
    response.locals.isAuthenticated = request.session.isOnline
    response.locals.csurfToken = request.csrfToken()
    next()
})


//Load html pages - These must be called after everything is processed - note code process from top to bottom
app.use('/admin', adminRoutes).use(shopRoutes).use(authRoutes)

//Can also use this: app.use('/', error.getErrorPage)
app.use(error.getErrorPage)

mongoose.connect(MONGODB_URI).then( function() {
    app.listen(port)
}).catch((error) => console.log(error))




