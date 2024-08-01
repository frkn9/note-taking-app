const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    username: {
        type:String,
        required:[true, "Please provide a username with length between 1-16"],
        minlength:5,
        maxlength:16,
        unique:true
    },
    email: {
        type:String,
        required:[true, "Please provide email"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique:true
    },
    password: {
        type:String,
        required:[true, "Please provide a password"],
        minlength:6
    }
})

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
    return jwt.sign({
        userId: this._id,
        username: this.username,
        email:this.email},
        process.env.JWT_SECRET_KEY,
        {
            expiresIn:"2 days"
        }
    )
} 

UserSchema.methods.comparePasswords = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}


module.exports = mongoose.model('User', UserSchema)