const User = require('../../models/userModel')
const Product = require('../../models/productModel')


module.exports = {


  async loadCheckout(req, res) {
        try {
            let userId = req.session.user;
            const user = await User.findById(userId).select("-password")
            console.log("from loadcheckout ", user);
            res.render('user/checkout', {session : req.session.user, user})
        } catch (err) {
            res.render('user/500')
        }
    },





}