const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const resolvers = {
    createUser: async ({ userInput }, req) => {
        const existingUser = await User.findOne({ email: userInput.email })

        if (existingUser) {
            const error = new Error('User already exists!')
            console.log("User already exists!")
            throw error
        }

        const hashedPassword = bcrypt.hashSync(userInput.password, 5)

        const user = new User({
            name: userInput.name,   
            email: userInput.email,
            password: hashedPassword,
            verified: false
        })

        let createdUser
        try {
            createdUser = await user.save()
        } catch (err) {
            console.log(err)
        }

        return { ...createdUser._doc, _id: createdUser._id.toString() }
    },

    getUser: async ({ userEmail }, req) => {
        const existingUser = await User.findOne({ email: userEmail })

        if (!existingUser) {
            const error = new Error('User already exists!')
            console.log("User already exists!")
            throw error
        }

        return { ...existingUser._doc, _id: existingUser._id.toString() }
    },

    login: async ({ email, password }, req, {res}) => {
        const user = await User.findOne({ email: email })

        if (!user) {
            const error = new Error('No such user!')
            console.log("No such user!")
            throw error
        }

        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
            const error = new Error('Password incorrect!')
            console.log('Password incorrect!')
            throw error
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
            }, 
            'secretString', 
            { expiresIn: '1h' }    
        )

        // res.cookie('JWT', token, {
        //     path: '/',
        //     expires: new Date(Date.now() + 1000*60*60),
        //     httpOnly: true,
        //     sameSite: 'lax'
        // })

        req.isAuth = true
        req.userId = user._id.toString()

        return { 
            token: token, 
            userId: user._id.toString() 
        }
    },

    deleteUser: async ({ password }, req) => {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            throw err
        }

        let user
        try {
            user = await User.findByIdAndDelete({ id: req.userId })
        } catch (err) {
            const error = new Error(err)
            console.log(err)
            throw error
        }

        if (!user) {
            const error = new Error('No such user exists!')
            console.log("No such user exists!")
            throw error
        }

        req.isAuth = false
        req.id = null

        console.log('User deleted successfully!')
        return null
        
    },

    modifyUser: async ({ oldPassword, newPassword, username }, req) => {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            console.log("Not authenticated!")
            throw err
        }

        let user
        try {
            user = await User.findById({ id: req.userId })
        } catch (err) {
            const error = new Error(err)
            console.log(err)
            throw error
        }

        const isEqual = bcrypt.compareSync(oldPassword, user.password)

        if (!isEqual) {
            const error = new Error("Password is not correct!")
            console.log("Password is not correct!")
            throw error
        }

        user.password = newPassword
        user.name = username

        await user.save()

        return {
            ...user._doc,
            _id: user._id.toString()
        }
    }
}

module.exports = resolvers