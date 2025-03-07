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
            res.render('/admin/500')
        }
    },



    loadAddCategory(req, res) {
        try {
            res.render("admin/addCategory")
        } catch (err) {
            console.log("at rendering Category", err);
            res.render('/admin/500')
        }
    },


    async addProductCategory(req, res) {
        try {
            const category = await productCategory.find()
            const { categoryName, description , categoryOffer} = req.body;
            
    
            if (!categoryName || !description) {
                return res.render('admin/addCategory', {
                    message: "All fields must be filled",
                });
            }
    
            const categoryNameFormatted = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
    
            const existingCategory = await productCategory.findOne({
                categoryName: categoryNameFormatted
            });
    
            if (!existingCategory) {
                const categorys = new productCategory({
                    categoryName: categoryNameFormatted,
                    description: description,
                    offer: categoryOffer,
                    
                });
    
                await categorys.save();
                return res.render("admin/category", {category});
            } else {
                console.log("This Category already exists");
                return res.render("admin/addCategory", { message: "This Category already exists" });
            }
        } catch (error) {
            console.error(error.message);
            res.render('admin/500');
        }
    },


    async categoryDisable(req, res) {
        const { id } = req.params;

        const disable = await productCategory.findByIdAndUpdate(id, { $set: { is_disable: true } }, { new: true })

        if (disable) {
            return res.redirect('/admin/category')
        } else {
            return res.send().status(400)
        }
    },

    async categoryActive(req, res) {
        const { id } = req.params;
        const active = await productCategory.findByIdAndUpdate(id, { $set: { is_disable: false } }, { new: true })

        if (active) {
            return res.redirect('/admin/category')
        } else {
            return res.send().status(400)
        }
    },


    async loadCategoryEdit(req, res) {
        const { id } = req.params;
        const category = await productCategory.find({ _id: id })
        if (category) {
            return res.render('admin/editCategory', { category: category[0] });
        } else {
            return res.send("Not Found!")

        }
    },
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { description ,categoryOffer} = req.body;

            const category = await productCategory.findById(id);

            const editCategoryName = req.body.categoryName.charAt(0).toUpperCase() + req.body.categoryName.slice(1).toLowerCase();

            const exist = await productCategory.findOne({ categoryName: editCategoryName });

            if (exist) {
                if (exist.categoryName !== editCategoryName) {

                    return res.render('admin/editCategory', { category, message: "Category already exists" });
                }
            }

            const data = {
                categoryName: editCategoryName,
                description: description,
                offer: categoryOffer,
            };
            
            // Update other category details
            await productCategory.findByIdAndUpdate(id, { $set: data }, { new: true });

            return res.redirect('/admin/category');
        } catch (error) {
            console.error(error.message);
            res.render('admin/500');
        }
    },


}

