const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: { type: String },
    surname: { type: String },
    email: { type: String, required: true, unique: true },
    age: { type: String },
    password: { type: String, required: true }
})

module.exports = mongoose.model("User", UserSchema)