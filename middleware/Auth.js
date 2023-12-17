
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
        req.session.url = req.url
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

}



}