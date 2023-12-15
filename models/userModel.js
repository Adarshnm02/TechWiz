const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        require:true
    },
    email:{
        type:String,
        require:true,
        lowercase:true,
        unique: true
    },
    password:{
        type:String,
        require:true,
        // minLength: 4
    },
    is_varified:{
        type:Boolean,
        default:false
    },
    is_blocked:{
        type:String,
        default:false
    },
    is_Admin:{
        type:Boolean,
        default:false
    }
})

const User = mongoose.model('User',userSchema)
module.exports = User;