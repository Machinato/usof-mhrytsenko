const Category = require('../models/category.js');
const {sendResponse} = require('../service/helperFunction.js');
const { check, validationResult } = require('express-validator');

class CategoryController{
    static async getAll(req, res){
        try {
            const categories = await Category.findAll();

            return categories.length > 0 ? 
                sendResponse(res, 200, true, "All categories retrieved", categories) :
                sendResponse(res, 404, false, "No category found");
        } catch (err) {
            return sendResponse(res, 500, false, "Error retrieving categories", null, err.message);
        }
    }

    static async getCategoryById(req, res) {
        const category_id = req.params.category_id;
        try {
            const catrgory = new Category({});
            await catrgory.findByProperty("id", category_id);

            return catrgory ? 
                sendResponse(res, 200, true, `The category with id = ${category_id} was found`, catrgory.getLikeObject())
                : sendResponse(res, 404, false, `No category with id = ${category_id} found`);
        } catch (err) {
            return sendResponse(res, 500, false, `Error retrieving category with id = ${post_id}`, null, err.message);
        }
    }

    static async getAllPostsByCategory(req, res) {
        const category_id = req.params.category_id;
        try {
            const resultArr = await Category.allPostsForCategory(category_id);

            return resultArr.length > 0 ? 
                sendResponse(res, 200, true, `All posts with category_id = ${category_id} was found`, resultArr)
                : sendResponse(res, 404, false, `A category with category_id = ${category_id} has no posts`);
        } catch (err) {
            return sendResponse(res, 500, false, `Error category post with id = ${category_id}`, null, err.message);
        }
    }

    static async addCategory(req, res){
        const categoryParams = req.body;
        
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return sendResponse(res, 400, false, `Validtion errors`, errors);
            }

            const new_category = new Category(categoryParams)
            const result = await new_category.save();

            return result ? 
                sendResponse(res, 201, true, `Category add successfully`)
                : sendResponse(res, 500, false, `Category add failed. `);
        } catch (err) {
            return sendResponse(res, 500, false, `Error add category post with name = ${categoryParams.name}`, null, err.message);
        }
    }

    static async changeCategory(req, res){
        const categoryId = req.params.category_id;
        const categoryParams = req.body;
        
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return sendResponse(res, 400, false, `Validtion errors`, errors);
            }

            const result = await Category.updateById(categoryId, categoryParams);

            return result ? 
                sendResponse(res, 201, true, `Category update successfully`)
                : sendResponse(res, 500, false, `Category update failed`);
        } catch (err) {
            return sendResponse(res, 500, false, `Error update category with titel = ${categoryParams.titel}`, null, err.message);
        }
    }

    static async deleteCategory(req, res){
        const categoryId = req.params.category_id;
        
        try {
            const newCategory = new Category({id: categoryId});

            // await newCategory.findByProperty('id', categoryId);

            const result = await newCategory.delete();

            return result ? 
                sendResponse(res, 201, true, `Category delete successfully`)
                : sendResponse(res, 500, false, `Category delete failed`);
        } catch (err) {
            return sendResponse(res, 500, false, `Error delete category with titel = ${categoryParams.titel}`, null, err.message);
        }
    }

    static isValidAddCategory(){
        return [
            check('name').exists().withMessage('The name must be').notEmpty().withMessage('Category titel cannot be empty'),
            check('description').optional().trim().isLength({ max: 255 }).withMessage('Deacription must not exceed 255 characters')            
        ];
    }
}

module.exports = CategoryController; 