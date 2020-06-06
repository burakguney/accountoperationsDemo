const express = require('express')
const expressSession = require('express-session');
const app = express()

const mongoose = require('mongoose');
const connectMongo = require('connect-mongo');

const port = process.env.PORT || 3000

const handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

const bodyParser = require('body-parser')

const methodOverride = require("method-override")


mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/webodev',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
).then(() => {
    console.log("Mongodb Connected")
})


const mongoStore = connectMongo(expressSession)
app.use(expressSession({
    secret: "kadripasa",
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({ mongooseConnection: mongoose.connection })
}))

app.use((req, res, next) => {
    const { userId, email, userName } = req.session
    if (userId) {
        res.locals = {
            displayLink: true,
            user: userName
        }
    } else {
        res.locals = {
            displayLink: false
        }
    }
    next()
})


app.use((req, res, next) => {
    res.locals.sessionMessage = req.session.sessionMessage
    delete req.session.sessionMessage
    next()
})


app.use(express.static("public"))
app.use(methodOverride("_method"))

app.engine("handlebars", expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(handlebars),
    helpers: {}
}));
app.set("view engine", "handlebars");



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const main = require("./routes/main")
app.use("/", main)


app.listen(port, () => { console.log(`Example app listening on http://localhost:${port}/`) })