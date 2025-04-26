/**
 * AccessiChef - Recipe Data and Management
 * 
 * This file contains functionality for loading, parsing, and managing recipe data.
 * It provides methods for retrieving recipe listings and detailed recipe information.
 * 
 * @author Spencer Purdy
 * @version 1.0.0
 * @for COMP 5970/6970 Assistive and Accessible Computing
 */

// Use strict mode for better error catching and performance
'use strict';

/**
 * Recipe Manager - Handles loading and processing recipe data
 */
const RecipeManager = {
    /**
     * Cache for loaded recipes to avoid redundant fetches
     */
    recipeCache: null,
    
    /**
     * Load all recipes from the data source
     * @returns {Promise<Array>} Promise resolving to array of recipe objects
     */
    loadAllRecipes: function() {
        // Return cached recipes if available
        if (this.recipeCache) {
            return Promise.resolve(this.recipeCache);
        }
        
        // Fetch recipes from data file
        return fetch('data/recipes.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load recipes: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // Cache the recipes
                this.recipeCache = data.recipes;
                return this.recipeCache;
            });
    },
    
    /**
     * Load a specific recipe by ID
     * @param {string} recipeId - ID of the recipe to load
     * @returns {Promise<Object>} Promise resolving to recipe object
     */
    loadRecipe: function(recipeId) {
        return this.loadAllRecipes()
            .then(recipes => {
                const recipe = recipes.find(r => r.id === recipeId);
                if (!recipe) {
                    throw new Error('Recipe not found: ' + recipeId);
                }
                return recipe;
            });
    },
    
    /**
     * Search recipes by query terms
     * @param {string} query - Search query to match against recipes
     * @returns {Promise<Array>} Promise resolving to filtered array of recipe objects
     */
    searchRecipes: function(query) {
        // Normalize query
        query = query.trim().toLowerCase();
        
        if (!query) {
            return this.loadAllRecipes();
        }
        
        return this.loadAllRecipes()
            .then(recipes => {
                return recipes.filter(recipe => {
                    // Match against title, description, and ingredients
                    return recipe.title.toLowerCase().includes(query) || 
                           recipe.description.toLowerCase().includes(query) ||
                           recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query));
                });
            });
    },
    
    /**
     * Filter recipes by category
     * @param {string} category - Category to filter by
     * @returns {Promise<Array>} Promise resolving to filtered array of recipe objects
     */
    filterByCategory: function(category) {
        if (!category || category === 'All Categories') {
            return this.loadAllRecipes();
        }
        
        return this.loadAllRecipes()
            .then(recipes => {
                return recipes.filter(recipe => recipe.category === category);
            });
    },
    
    /**
     * Get a list of all available recipe categories
     * @returns {Promise<Array>} Promise resolving to array of category strings
     */
    getCategories: function() {
        return this.loadAllRecipes()
            .then(recipes => {
                // Extract unique categories
                const categories = new Set(recipes.map(recipe => recipe.category));
                return Array.from(categories).sort();
            });
    },
    
    /**
     * Get recipes sorted by cooking time (ascending)
     * @returns {Promise<Array>} Promise resolving to sorted array of recipe objects
     */
    getQuickRecipes: function() {
        return this.loadAllRecipes()
            .then(recipes => {
                return [...recipes].sort((a, b) => a.time - b.time);
            });
    }
};