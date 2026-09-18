package service;

import dao.CategoryDAO;
import model.Category;
import util.ValidationUtil;

import java.sql.SQLException;
import java.util.List;

/**
 * CategoryService - Business logic and validation for Categories
 */
public class CategoryService {

    private final CategoryDAO categoryDAO;

    public CategoryService() {
        this.categoryDAO = new CategoryDAO();
    }

    public CategoryService(CategoryDAO categoryDAO) {
        this.categoryDAO = categoryDAO;
    }

    public List<Category> getAllCategories() throws SQLException {
        return categoryDAO.getAll();
    }

    public Category getCategoryById(int id) throws SQLException {
        Category cat = categoryDAO.getById(id);
        if (cat == null) {
            throw new IllegalArgumentException("Category not found with ID: " + id);
        }
        return cat;
    }

    public Category addCategory(Category category) throws SQLException {
        ValidationUtil.requireNonEmpty(category.getCategoryName(), "Category Name");

        Category existing = categoryDAO.getByName(category.getCategoryName());
        if (existing != null) {
            throw new IllegalArgumentException("Category already exists with name: " + category.getCategoryName());
        }

        int id = categoryDAO.insert(category);
        category.setCategoryId(id);
        return category;
    }

    public Category updateCategory(Category category) throws SQLException {
        if (category.getCategoryId() <= 0) {
            throw new IllegalArgumentException("Invalid Category ID for update.");
        }
        ValidationUtil.requireNonEmpty(category.getCategoryName(), "Category Name");

        Category current = categoryDAO.getById(category.getCategoryId());
        if (current == null) {
            throw new IllegalArgumentException("Cannot update. Category not found with ID: " + category.getCategoryId());
        }

        Category existingWithName = categoryDAO.getByName(category.getCategoryName());
        if (existingWithName != null && existingWithName.getCategoryId() != category.getCategoryId()) {
            throw new IllegalArgumentException("Another category already exists with name: " + category.getCategoryName());
        }

        categoryDAO.update(category);
        return category;
    }

    public boolean deleteCategory(int id) throws SQLException {
        Category current = categoryDAO.getById(id);
        if (current == null) {
            throw new IllegalArgumentException("Cannot delete. Category not found with ID: " + id);
        }

        if (categoryDAO.hasLinkedProducts(id)) {
            throw new IllegalStateException("Cannot delete category '" + current.getCategoryName() + 
                    "'. Stationery products are currently linked to this category.");
        }

        return categoryDAO.delete(id);
    }
}
