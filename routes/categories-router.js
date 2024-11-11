const express = require('express');
const CategoryController = require('../controllers/categoryController.js');
const categoryRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const ownProfileMiddleware = require('../middleware/ownProfileMiddleware.js');
const changeProfilePermissions = require('../middleware/changeProfilesPermissions.js');

const restrictedFields = {
    admin: ['id']
};

categoryRouter.get('/', CategoryController.getAll);
categoryRouter.get('/:category_id', CategoryController.getCategoryById);
categoryRouter.get('/:category_id/posts', CategoryController.getAllPostsByCategory);
categoryRouter.post('/', roleMiddleware(['admin']), CategoryController.isValidAddCategory(), CategoryController.addCategory);
categoryRouter.patch('/:category_id', roleMiddleware(['admin']), CategoryController.isValidAddCategory(), CategoryController.changeCategory);
categoryRouter.delete('/:category_id', roleMiddleware(['admin']), changeProfilePermissions([restrictedFields]), CategoryController.deleteCategory);

module.exports = categoryRouter;