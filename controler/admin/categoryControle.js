const express = require('express');
const productCategory = require('../../models/categoryModel');



const loadAddCategory = (req, res) => {
    try {
        res.render("admin/addCategory")
    } catch (err) {
        console.log("at rendering Category", err);
    }
}


const addProductCategory = async (req, res) => {
    try {
        if (!req.body.categoryName || !req.file) {
            console.log("Category name or image not found");
            return res.render('admin/addCategory')
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
}







module.exports = { loadAddCategory, addProductCategory }
