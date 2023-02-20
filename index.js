const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const bodyParser = require("body-parser")
const User = require('./models/User')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const { graphqlHTTP } = require("express-graphql")

const graphqlSchema = require('./graphql/mutation')
const graphqlResolver = require('./graphql/resolver')

const auth = require('./middleware/auth')

dotenv.config()
const app = express()

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended: true, limit: '50mb', parameterLimit: 50000}))
app.use(express.json())

// app.use(auth)

app.use('/verify', async (req, res, next) => {
    const cookies = req.headers.cookie
    const token = req.cookies.JWT_HTTPONLY_Cookie
    
    if (!token) {
        return res
        .status(400)
        .json({ status: false })
    }

    jwt.verify(token, String(process.env.JWT_SECRET_KEY), (err, user) => {
        if (err) {
            // console.log("error in verifying token!!")
            res
            .status(400)
            .json({ status: false, token: "Cannot verify token!" })
        }

        let currentUser
        // console.log(user)
        try {
            User.findOne({ _id: user.id }).exec().then((data) => {
                currentUser = data
            })
        } catch (err) {
            // console.log(err)
        }
    })
    console.log("Inside auth", req.isAuth)
    req.isAuth = true
    next()
})

app.use('/api/login', async (req, res, next) => {
    const { email, password } = req.body
    console.log(email, password)

    var existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        return (err)
    }
    console.log(email, password)


    if (!existingUser) {
        return res
        .status(404)
        .json({ message: "User does not exist. You should sign up instead." })
    }
    console.log(email, password)
    
    const passwordCompare = await bcrypt.compare(password, existingUser.password)
    if (!passwordCompare) {
        return res
        .status(400)
        .json({ message: "Password is wrong" })
    }
    console.log(email, password)

    const token = jwt.sign({ id: existingUser._id }, String(process.env.JWT_SECRET_KEY), {
        expiresIn: "3h"
    })

    res.cookie('JWT_HTTPONLY_Cookie', token, {
        path: '/',
        expires: new Date(Date.now() + 1000*60*60*3),
        httpOnly: true,
        sameSite: 'lax'
    })
    console.log(email, password)
    // console.log("Logged in successfully!!")

    // return res
    // .status(201)
    // // .json({ message: "Logged in successfully", user: existingUser, token })
    // .json(existingUser)
    return res.status(201).json({ 
        token: token, 
        userId: existingUser._id.toString(),
        user: existingUser
    })
})

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    context: ({res}) => ({res})
}))

mongoose.
    connect(`mongodb+srv://prasad178:${process.env.MONGODB_PASSWORD}@cluster0.hvwuyz0.mongodb.net/auth?retryWrites=true&w=majority`)
    .then(() => {
    app.listen(5000, () => {
        console.log("Server live on port 5000")
    })
}).catch((err) => console.log(err))