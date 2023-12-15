
module.exports = {

isLogged (req, res, next){
    if (req.session.user) {
        console.log("rendering indes");
         res.redirect("/index")
    } else {
          next()
    }
},
isLogedout (req, res, next) {
    if (req.session.user) {
      
       next()
    } else {
        res.redirect("/login")
    }
},

// adminAuth  (req,res,next) {
//     try {
//         if(req.session.admin){
            
//             next()
//         }else{
//             res.redirect("/admin/adminsign")
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// },

isAdmin (req,res,next) {
    try {
       if(!req.session.admin){
            next()
    
       }else{

        res.redirect('/admin/')
       }
    } catch (error) {
        console.log(error.message);
    }
},

async logouting (req,res,next) {
    req.session.destroy()
    res.redirect('/login')


    // await req.session.destroy(); // Clear session data
    // await mongoose.connection.collection('sessions').deleteOne({ _id: sessionID }); // Delete from database
    // res.send({ message: 'Logged out successfully' });
    // }
}



}