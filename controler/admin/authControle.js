const express = require('express')
const User = require('../../models/userModel')
const Order = require('../../models/orderModel')
const bcrypt = require('bcrypt')


module.exports = {

    async checkAdmin(req, res){
        try {
            
            const { email, password } = req.body;
            const findAdmin = await User.findOne({ email })
            if (!findAdmin) {
                return res.render('admin/authentication-login', { message: 'Admin not found' })
            } else {
                const bpassword = findAdmin.password
                const matchpass = await bcrypt.compare(password, bpassword)
                if (!matchpass) {
                    return res.render('admin/authentication-login', { message: 'Wrong Password' })
                } else {
                    if (findAdmin.is_Admin == true) {
                        req.session.admin = findAdmin._id;

                            let startOfMonth;
                            let endOfMonth;
                           
                            if(req.query.filtered){
                                startOfMonth = new Date(req.body.from);
                                endOfMonth = new Date(req.body.upto);
                                endOfMonth.setHours(23, 59, 59, 999);
                    
                            }else{
                                const today = new Date();
                                startOfMonth = new Date(today.getFullYear(),today.getMonth(), 1);
                                endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                            }
                    
                
                
                            let orderStatusFilter = { status: { $in: ["Processing", "Shipped", "Cancelled", "Delivered"] } };
                
                            if (req.body.status === "all") {
                                orderStatusFilter = { status: { $in: ["Processing", "Shipped", "Cancelled", "Delivered"] } };
                            } else if (req.body.status) {
                                orderStatusFilter = { status: req.body.status };
                            }
                
                    
                            const filteredOrders = await Order.aggregate([
                                {
                                    $unwind: "$products" 
                                },
                                {
                                    $match: {
                                        // status: "Delivered",
                                        orderDate: {
                                            $gte: startOfMonth,
                                            $lte: endOfMonth
                                        },
                                        ...orderStatusFilter
                                        // status : orderStatusFilter
                                    }
                                     
                                },
                                {
                                    $lookup: {
                                        from: "products", 
                                        localField:"products.product",
                                        foreignField:"_id",
                                        as: "productInfo"  // Store the product info in the "productInfo" array
                                    }
                                },
                                {
                                    $addFields: {
                                        "products.productInfo": {
                                            $arrayElemAt: ["$productInfo", 0]   
                    
                                        }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "users",
                                        localField: "user",
                                        foreignField: "_id",
                                        as: "userInfo"
                                    }
                                },
                                {
                                    $unwind: "$userInfo"
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        productInfo:1,
                                        userInfo: 1,
                                        totalAmount: 1,
                                        paymentMethod: 1,
                                        deliveryAddress: 1,
                                        status: 1,
                                        orderDate: 1,
                                        deliveryDate: 1,
                                        "products.quantity": 1,
                                        "products.total": 1,
                                        "products.isCancelled": 1,
                                        "products.productInfo": 1
                    
                                    }
                                }
                            ])
                            let orderDone = 0
                            let totalRevenue = 0
                            for(let i=0; i<filteredOrders.length; i++){
                                if(filteredOrders[i].status === "Delivered" && filteredOrders[i].status !== "Completed") {
                                    orderDone += 1
                                    totalRevenue += (filteredOrders[i].products.quantity*filteredOrders[i].products.productInfo.price)
                                }
                            }
                           
                            res.render('admin/index',{
                                salesReport: filteredOrders,
                                orderDone,
                                totalRevenue
                            })
                    } else {
                        res.render('admin/authentication-login', { message: 'Your Not Admin' })
                    }
                }
            }
            

        } catch (error) {
            console.log(error.message);
            res.render('admin/500')
        }
    },

    isLogedout (req, res, next) {
        if (req.session.admin) {
           next()
        } else {
            console.log("Admin not found");
            res.redirect("/admin/")
        }
    }






}