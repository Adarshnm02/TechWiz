const express = require('express') 
const Coupon = require('../../models/couponModel')





function generateCouponCode() {
    const codeRegex = /^[A-Z0-9]{5,15}$/;
    let code = '';
    while (!codeRegex.test(code)) {
        code = Math.random().toString(36).substring(7);
    }
    return Coupon.findOne({ code }).then(existingCoupon => {
        if (existingCoupon) {
            return generateCouponCode();
        }
        return code;
    });
}

module.exports = {

    async loadCoupon(req,res){
        try{
            const coupon = await Coupon.find({})
            res.render('admin/coupons', {coupon})
        }catch(err){
            console.log(err);
        }
    },

    loadAddCoupon(req,res){
        try{
            res.render('admin/addCoupons')
        }catch(err){
            console.error(err)
        }
    },


    async saveCoupon(req, res){

        try{

            const {description, discountType,discountAmount, minimumPurchaseAmount, usageLimit,} = req.body;
            if(!description || !discountType || !discountAmount || !minimumPurchaseAmount || !usageLimit){
                res.render('admin/createCoupon',{error:"all fields are require"})
            }else{
                if(discountType === "percentage" && discountAmount >=100){
                    res.render('admin/createCoupon',{error:"discount amount is morethan product price"})
                }else{
                    const code = await generateCouponCode()
                    const newCoupon = new Coupon({
                        code:code,
                        discountType:discountType,
                        description:description,
                        discountAmount:discountAmount,
                        minimumPurchaseAmount:minimumPurchaseAmount,
                        usageLimit:usageLimit
    
                    })
                    await newCoupon.save();
                    console.log(newCoupon);
                    res.render('admin/addCoupons')
                }
            }
        

        }catch(err){
            console.log("from saveCopon", err);
        }

    }
}