const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        require:true
    },
    email:{
        type:String,
        require:true,
        lowercase:true
    },
    password:{
        type:String,
        require:true,
        // minLength: 4
    },
    is_varified:{
        type:Boolean,
        default:true
    },
    is_blocked:{
        type:String,
        default:false
    }
})

const User = mongoose.model('User',userSchema)
module.exports = User;