const express = require('express');
const productCategory = require('../../models/categoryModel');




module.exports = {


    async category(req, res) {
        try {
            const category = await productCategory.find()
            console.log(category);

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

            const categoryName = req.body.categoryName.charAt(0).toUpperCase() + req.body.categoryName.slice(1).toLowerCase();

            const exist = await productCategory.findOne({
                categoryName: categoryName
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
                return res.render("admin/addCategory", {message: "Category insert successfully"})

            } else {
                console.log("This Category is already exist");
                return res.render("admin/addCategory", {message: "This Category is already exist"})
            }
        } catch (error) {
            console.log(error.message);
            return res.status(500).send("internal server error");
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
            const { categoryName, description } = req.body;

            const data = {
                categoryName: categoryName,
                description: description
            };

            // Check if a file was uploaded
            if (req.file) {
                const category = await productCategory.findById(id);
                if (category) {
                    // Update the category's image if a file was provided
                    category.image = {
                        data: req.file.buffer,
                        contentType: req.file.mimetype
                    };
                    await category.save();
                } else {
                    console.log("Category not found");
                    return res.status(404).send("Category not found");
                }
            }

            // Update other category details
            const updatedCategory = await productCategory.findByIdAndUpdate(id, { $set: data }, { new: true });

            console.log(updatedCategory);
            return res.redirect('/admin/category');
        } catch (error) {
            console.log(error.message);
            return res.status(500).send("Internal server error");
        }
    },


    async imageDelete(req, res) {
        try {
            const { id } = req.params;
            const { imageId } = req.body; // Assuming the key for imageId in req.body

            const updatedCategory = await productCategory.findByIdAndUpdate(
                id,
                { $unset: { image: '' } }, // Removing the image field
                { new: true }
            );

            const category = updatedCategory;

            if (category) {
                console.log("Image Successfully Deleted");
                return res.render('admin/editCategory', { category, message: "Image Successfully Deleted" });
            } else {
                console.log("Error Occurred While Image Deleting!");
                return res.render('admin/editCategory', { message: "Error Occurred While Image Deleting!" });
            }
        } catch (error) {
            console.error("Error occurred during image deletion:", error);
            return res.status(500).send("Internal Server Error");
        }
    }







}

