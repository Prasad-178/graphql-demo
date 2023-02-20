const mongoose = require("mongoose")

const Schema = mongoose.Schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    verified: {
        type: Boolean,
        required: true  
    }
})

// export default mongoose.model('User', userSchema)
module.exports = mongoose.model('User', userSchema)
