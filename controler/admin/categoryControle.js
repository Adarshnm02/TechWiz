const express = require('express');
const productCategory = require('../../models/categoryModel');




module.exports = {


    async category(req, res) {
        try {
            const category = await productCategory.find()

            if (category) {
                res.render('admin/category', { category })
            } else {
                console.log("Category not found ");
            }

        } catch (err) {
            console.log(err);
        }
    },



    loadAddCategory(req, res) {
        try {
            res.render("admin/addCategory")
        } catch (err) {
            console.log("at rendering Category", err);
        }
    },


    async addProductCategory(req, res) {
        try {
            if (!req.body.categoryName || !req.file) {
                console.log("Category name or image not found");
                return res.render('admin/addCategory', {
                    message: "All fields must be filled",
                })
            }
            const exist = await productCategory.findOne({
                categoryName: req.body.categoryName
            });
            if (!exist) {
                const category = new productCategory({
                    categoryName: req.body.categoryName,
                    description: req.body.description,
                    image: {
                        data: req.file.buffer,
                        contentType: req.file.mimetype
                    }
                });


                await category.save();
                console.log("Category Saved", category);
                return res.render("admin/addCategory")
            } else {
                console.log("The Category is not save");
                return res.render("admin/addCategory")
            }
        } catch (error) {
            console.log(error.message);
            return res.status(500).send("internal server error");
        }
    },



    async categoryDisable (req,res) {
        const {id} = req.params;

        const disable = await productCategory.findByIdAndUpdate(id , {$set:{is_disable : true}},{new:true})

        if(disable){
            return res.redirect('/admin/category')
        }else{
            return res.send().status(400)
        }
    },

    async categoryActive (req,res) {
        const {id} = req.params;
        const active = await productCategory.findByIdAndUpdate(id , {$set:{is_disable : false}},{new:true})

        if(active){
            return res.redirect('/admin/category')
        }else{
            return res.send().status(400)
        }
    }







    // module.exports = { loadAddCategory, addProductCategory, category 
}
