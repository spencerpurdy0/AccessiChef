/**
 * AccessiChef - Main Application JavaScript
 * 
 * This file contains the core application logic for the AccessiChef application,
 * handling page initialization, navigation, and integration of other modules.
 * 
 * @author Spencer Purdy
 * @version 1.0.0
 * @for COMP 5970/6970 Assistive and Accessible Computing
 */

// Use strict mode for better error catching and performance
'use strict';

/**
 * Main application object to avoid global namespace pollution
 */
const AccessiChef = {
    /**
     * Current page identifier
     */
    currentPage: '',
    
    /**
     * Initialize the application
     */
    init: function() {
        // Determine current page
        this.detectCurrentPage();
        
        // Initialize accessibility features
        AccessibilityFeatures.init();
        
        // Initialize page-specific functionality
        this.initPageSpecific();
        
        // Add event listeners for common elements
        this.addEventListeners();
        
        console.log('AccessiChef application initialized on ' + this.currentPage + ' page');
    },
    
    /**
     * Detect the current page based on URL or page elements
     */
    detectCurrentPage: function() {
        const path = window.location.pathname;
        
        if (path.includes('recipe-detail.html')) {
            this.currentPage = 'recipe-detail';
        } else if (path.includes('about.html')) {
            this.currentPage = 'about';
        } else {
            this.currentPage = 'index';
        }
    },
    
    /**
     * Initialize page-specific functionality
     */
    initPageSpecific: function() {
        switch (this.currentPage) {
            case 'index':
                this.initIndexPage();
                break;
            case 'recipe-detail':
                this.initRecipeDetailPage();
                break;
            case 'about':
                // No special initialization needed for about page
                break;
            default:
                console.log('Unknown page type');
        }
    },
    
    /**
     * Initialize the index (recipe list) page
     */
    initIndexPage: function() {
        // Load and display recipes
        RecipeManager.loadAllRecipes()
            .then(recipes => {
                this.displayRecipes(recipes);
                document.getElementById('loading-message').classList.add('d-none');
            })
            .catch(error => {
                console.error('Error loading recipes:', error);
                document.getElementById('loading-message').textContent = 'Error loading recipes. Please try again.';
            });
        
        // Set up search and filter functionality
        this.setupSearch();
    },
    
    /**
     * Initialize the recipe detail page
     */
    initRecipeDetailPage: function() {
        // Get recipe ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');
        
        if (!recipeId) {
            console.error('No recipe ID provided');
            document.querySelector('.recipe-header-placeholder').innerHTML = 
                '<div class="alert alert-danger">No recipe selected. Please <a href="index.html">return to recipe list</a>.</div>';
            return;
        }
        
        // Load and display recipe details
        RecipeManager.loadRecipe(recipeId)
            .then(recipe => {
                this.displayRecipeDetails(recipe);
                document.querySelector('.recipe-header-placeholder').classList.add('d-none');
                document.querySelector('.recipe-tabs-placeholder').classList.add('d-none');
                document.getElementById('recipe-header').classList.remove('d-none');
                document.getElementById('recipe-tabs').classList.remove('d-none');
            })
            .catch(error => {
                console.error('Error loading recipe details:', error);
                document.querySelector('.recipe-header-placeholder').innerHTML = 
                    '<div class="alert alert-danger">Error loading recipe. Please <a href="index.html">return to recipe list</a>.</div>';
            });
    },
    
    /**
     * Set up search and filter functionality
     */
    setupSearch: function() {
        const searchInput = document.getElementById('recipe-search');
        const searchButton = document.getElementById('search-button');
        const filterSelect = document.getElementById('recipe-filter');
        
        if (searchInput && searchButton) {
            // Search button click
            searchButton.addEventListener('click', () => {
                this.performSearch(searchInput.value, filterSelect.value);
            });
            
            // Search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value, filterSelect.value);
                }
            });
        }
        
        if (filterSelect) {
            // Filter change
            filterSelect.addEventListener('change', () => {
                this.performSearch(searchInput.value, filterSelect.value);
            });
        }
    },
    
    /**
     * Perform search based on query and category filter
     * @param {string} query - Search query
     * @param {string} category - Category filter
     */
    performSearch: function(query, category) {
        // Normalize query
        query = query.trim().toLowerCase();
        
        // Get all recipes
        RecipeManager.loadAllRecipes()
            .then(recipes => {
                // Filter recipes based on search query and category
                const filteredRecipes = recipes.filter(recipe => {
                    // Category filter
                    if (category && category !== 'All Categories' && recipe.category !== category) {
                        return false;
                    }
                    
                    // Search query filter
                    if (query) {
                        return recipe.title.toLowerCase().includes(query) || 
                               recipe.description.toLowerCase().includes(query) ||
                               recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query));
                    }
                    
                    return true;
                });
                
                // Display filtered recipes
                this.displayRecipes(filteredRecipes);
                
                // Announce results to screen readers
                const resultCount = filteredRecipes.length;
                const resultMessage = `Found ${resultCount} recipe${resultCount !== 1 ? 's' : ''}`;
                this.announceToScreenReader(resultMessage);
            })
            .catch(error => {
                console.error('Error during search:', error);
            });
    },
    
    /**
     * Display recipes in the recipe container
     * @param {Array} recipes - Array of recipe objects
     */
    displayRecipes: function(recipes) {
        const container = document.getElementById('recipe-container');
        
        // Clear existing recipes
        container.innerHTML = '';
        
        if (recipes.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center">No recipes found. Try a different search term.</p></div>';
            return;
        }
        
        // Create recipe cards
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';
            card.setAttribute('role', 'listitem');
            
            card.innerHTML = `
                <div class="card recipe-card h-100">
                    <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
                    <div class="card-body">
                        <h3 class="card-title">${recipe.title}</h3>
                        <p class="card-text">${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>
                        <div class="recipe-meta mb-3">
                            <p><i class="fas fa-clock" aria-hidden="true"></i> ${recipe.time} mins</p>
                            <p><i class="fas fa-signal" aria-hidden="true"></i> ${recipe.difficulty}</p>
                        </div>
                        <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-primary">View Recipe</a>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    },
    
    /**
     * Display recipe details on the recipe detail page
     * @param {Object} recipe - Recipe object
     */
    displayRecipeDetails: function(recipe) {
        // Set page title
        document.title = `${recipe.title} - AccessiChef`;
        
        // Update recipe header
        document.getElementById('recipe-image').src = recipe.image;
        document.getElementById('recipe-image').alt = recipe.title;
        document.getElementById('recipe-title').textContent = recipe.title;
        document.getElementById('recipe-time').textContent = `${recipe.time} mins`;
        document.getElementById('recipe-servings').textContent = `${recipe.servings} servings`;
        document.getElementById('recipe-difficulty').textContent = recipe.difficulty;
        document.getElementById('recipe-description').textContent = recipe.description;
        
        // Update ingredients list
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = '';
        
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            
            // Add data attributes for metric and imperial units
            li.dataset.metricAmount = ingredient.amount;
            li.dataset.metricUnit = ingredient.unit;
            li.dataset.imperialAmount = MeasurementConverter.convertToImperial(ingredient.amount, ingredient.unit).amount;
            li.dataset.imperialUnit = MeasurementConverter.convertToImperial(ingredient.amount, ingredient.unit).unit;
            
            // Display in metric by default
            li.innerHTML = `
                <span class="ingredient-amount">${ingredient.amount}</span>
                <span class="ingredient-unit">${ingredient.unit}</span>
                <span class="ingredient-name">${ingredient.name}</span>
            `;
            
            ingredientsList.appendChild(li);
        });
        
        // Update instructions list
        const instructionsList = document.getElementById('instructions-list');
        instructionsList.innerHTML = '';
        
        recipe.instructions.forEach((instruction, index) => {
            const li = document.createElement('li');
            li.textContent = instruction.text;
            
            // Add data attribute for timer if present
            if (instruction.time) {
                li.dataset.timerMinutes = instruction.time;
                li.innerHTML += ` <button class="btn btn-sm btn-outline-secondary set-timer-btn" 
                                        data-time="${instruction.time}" 
                                        aria-label="Set ${instruction.time} minute timer">
                                    <i class="fas fa-stopwatch" aria-hidden="true"></i> ${instruction.time}m
                                </button>`;
            }
            
            instructionsList.appendChild(li);
        });
        
        // Update nutrition information
        const nutritionList = document.getElementById('nutrition-list');
        nutritionList.innerHTML = '';
        
        for (const [key, value] of Object.entries(recipe.nutrition)) {
            const div = document.createElement('div');
            div.className = 'nutrition-item';
            div.innerHTML = `
                <div class="nutrition-value">${value}</div>
                <div class="nutrition-label">${key}</div>
            `;
            
            nutritionList.appendChild(div);
        }
        
        // Initialize step-by-step mode
        this.initStepByStepMode(recipe);
        
        // Initialize measurement unit conversion
        this.initMeasurementConversion();
    },
    
    /**
     * Initialize step-by-step instruction mode
     * @param {Object} recipe - Recipe object
     */
    initStepByStepMode: function(recipe) {
        const stepByStepToggle = document.getElementById('step-by-step-toggle');
        const allStepsView = document.getElementById('all-steps-view');
        const stepByStepView = document.getElementById('step-by-step-view');
        const prevStepBtn = document.getElementById('prev-step');
        const nextStepBtn = document.getElementById('next-step');
        const currentStepNumber = document.getElementById('current-step-number');
        const totalSteps = document.getElementById('total-steps');
        const currentStepText = document.getElementById('current-step-text');
        const timerToggle = document.getElementById('timer-toggle');
        const timerDisplay = document.getElementById('timer-display');
        
        // Set total steps
        totalSteps.textContent = recipe.instructions.length;
        
        // Initialize current step
        let currentStep = 0;
        
        // Update step display
        const updateStepDisplay = () => {
            currentStepNumber.textContent = currentStep + 1;
            currentStepText.textContent = recipe.instructions[currentStep].text;
            
            // Enable/disable navigation buttons
            prevStepBtn.disabled = currentStep === 0;
            nextStepBtn.disabled = currentStep === recipe.instructions.length - 1;
            nextStepBtn.textContent = currentStep === recipe.instructions.length - 1 ? 'Finish' : 'Next';
            
            // Handle timer if present for this step
            if (recipe.instructions[currentStep].time) {
                timerToggle.disabled = false;
                timerToggle.dataset.time = recipe.instructions[currentStep].time;
                timerToggle.innerHTML = `<i class="fas fa-stopwatch" aria-hidden="true"></i> Start ${recipe.instructions[currentStep].time}m Timer`;
            } else {
                timerToggle.disabled = true;
                timerToggle.innerHTML = `<i class="fas fa-stopwatch" aria-hidden="true"></i> No Timer`;
            }
            
            // Announce step to screen readers
            this.announceToScreenReader(`Step ${currentStep + 1} of ${recipe.instructions.length}: ${recipe.instructions[currentStep].text}`);
        };
        
        // Toggle between step-by-step and all steps views
        stepByStepToggle.addEventListener('click', () => {
            const isStepByStep = allStepsView.classList.contains('d-none');
            
            if (isStepByStep) {
                // Switch to all steps view
                allStepsView.classList.remove('d-none');
                stepByStepView.classList.add('d-none');
                stepByStepToggle.innerHTML = '<i class="fas fa-list-ol" aria-hidden="true"></i> Step-by-Step Mode';
                
                // Stop any active timer
                RecipeTimer.stopTimer();
                
                // Announce mode change to screen readers
                this.announceToScreenReader('Switched to all steps view');
            } else {
                // Switch to step-by-step view
                allStepsView.classList.add('d-none');
                stepByStepView.classList.remove('d-none');
                stepByStepToggle.innerHTML = '<i class="fas fa-list" aria-hidden="true"></i> All Steps Mode';
                
                // Reset to first step
                currentStep = 0;
                updateStepDisplay();
                
                // Announce mode change to screen readers
                this.announceToScreenReader('Switched to step-by-step mode');
            }
        });
        
        // Previous step button
        prevStepBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateStepDisplay();
            }
        });
        
        // Next step button
        nextStepBtn.addEventListener('click', () => {
            if (currentStep < recipe.instructions.length - 1) {
                currentStep++;
                updateStepDisplay();
            } else {
                // Last step, return to all steps view
                allStepsView.classList.remove('d-none');
                stepByStepView.classList.add('d-none');
                stepByStepToggle.innerHTML = '<i class="fas fa-list-ol" aria-hidden="true"></i> Step-by-Step Mode';
                
                // Announce completion to screen readers
                this.announceToScreenReader('Recipe steps completed. Returned to all steps view.');
            }
        });
        
        // Timer toggle button
        timerToggle.addEventListener('click', () => {
            if (RecipeTimer.isRunning()) {
                RecipeTimer.stopTimer();
                timerToggle.innerHTML = `<i class="fas fa-stopwatch" aria-hidden="true"></i> Start ${timerToggle.dataset.time}m Timer`;
            } else {
                const minutes = parseInt(timerToggle.dataset.time, 10);
                RecipeTimer.startTimer(minutes * 60, timerDisplay, () => {
                    // Timer completion callback
                    this.announceToScreenReader('Timer complete!');
                    timerToggle.innerHTML = `<i class="fas fa-stopwatch" aria-hidden="true"></i> Start ${timerToggle.dataset.time}m Timer`;
                });
                timerToggle.innerHTML = `<i class="fas fa-stop" aria-hidden="true"></i> Stop Timer`;
            }
        });
    },
    
    /**
     * Initialize measurement conversion between metric and imperial units
     */
    initMeasurementConversion: function() {
        const metricBtn = document.getElementById('metric-btn');
        const imperialBtn = document.getElementById('imperial-btn');
        
        // Convert to metric units
        metricBtn.addEventListener('click', () => {
            metricBtn.classList.add('active');
            metricBtn.setAttribute('aria-pressed', 'true');
            imperialBtn.classList.remove('active');
            imperialBtn.setAttribute('aria-pressed', 'false');
            
            const ingredients = document.querySelectorAll('#ingredients-list li');
            ingredients.forEach(ingredient => {
                const amountEl = ingredient.querySelector('.ingredient-amount');
                const unitEl = ingredient.querySelector('.ingredient-unit');
                
                amountEl.textContent = ingredient.dataset.metricAmount;
                unitEl.textContent = ingredient.dataset.metricUnit;
            });
            
            // Announce to screen readers
            this.announceToScreenReader('Measurements converted to metric units');
        });
        
        // Convert to imperial units
        imperialBtn.addEventListener('click', () => {
            imperialBtn.classList.add('active');
            imperialBtn.setAttribute('aria-pressed', 'true');
            metricBtn.classList.remove('active');
            metricBtn.setAttribute('aria-pressed', 'false');
            
            const ingredients = document.querySelectorAll('#ingredients-list li');
            ingredients.forEach(ingredient => {
                const amountEl = ingredient.querySelector('.ingredient-amount');
                const unitEl = ingredient.querySelector('.ingredient-unit');
                
                amountEl.textContent = ingredient.dataset.imperialAmount;
                unitEl.textContent = ingredient.dataset.imperialUnit;
            });
            
            // Announce to screen readers
            this.announceToScreenReader('Measurements converted to imperial units');
        });
    },
    
    /**
     * Add event listeners for common elements
     */
    addEventListeners: function() {
        // Simplified view toggle
        const simplifiedViewToggle = document.getElementById('simplified-view-toggle');
        if (simplifiedViewToggle) {
            simplifiedViewToggle.addEventListener('click', () => {
                document.body.classList.toggle('simplified-view');
                
                const isSimplified = document.body.classList.contains('simplified-view');
                simplifiedViewToggle.innerHTML = isSimplified ? 
                    '<i class="fas fa-glasses" aria-hidden="true"></i> Standard View' : 
                    '<i class="fas fa-glasses" aria-hidden="true"></i> Simplified View';
                
                // Announce to screen readers
                this.announceToScreenReader(isSimplified ? 'Simplified view enabled' : 'Standard view enabled');
            });
        }
        
        // Print recipe button
        const printButton = document.getElementById('print-recipe');
        if (printButton) {
            printButton.addEventListener('click', () => {
                window.print();
            });
        }
        
        // Timer buttons in instructions list
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('set-timer-btn') || 
                e.target.parentElement.classList.contains('set-timer-btn')) {
                
                const button = e.target.classList.contains('set-timer-btn') ? 
                    e.target : e.target.parentElement;
                
                const minutes = parseInt(button.dataset.time, 10);
                
                // Create a timer display if it doesn't exist
                let timerDisplay = document.getElementById('inline-timer-display');
                if (!timerDisplay) {
                    timerDisplay = document.createElement('div');
                    timerDisplay.id = 'inline-timer-display';
                    timerDisplay.className = 'timer-display mt-3 mb-3';
                    document.getElementById('instructions').appendChild(timerDisplay);
                }
                
                RecipeTimer.startTimer(minutes * 60, timerDisplay, () => {
                    // Timer completion callback
                    this.announceToScreenReader('Timer complete!');
                    
                    // Add visual notification
                    const notification = document.createElement('div');
                    notification.className = 'alert alert-success';
                    notification.innerHTML = '<strong>Timer Complete!</strong>';
                    document.getElementById('instructions').insertBefore(notification, timerDisplay);
                    
                    // Remove notification after 5 seconds
                    setTimeout(() => {
                        notification.remove();
                    }, 5000);
                });
                
                // Announce to screen readers
                this.announceToScreenReader(`${minutes} minute timer started`);
            }
        });
        
        // Accessibility statement button
        const accessibilityStatementBtn = document.getElementById('accessibility-statement-btn');
        if (accessibilityStatementBtn) {
            accessibilityStatementBtn.addEventListener('click', () => {
                // Navigate to about page if not already there
                if (this.currentPage !== 'about') {
                    window.location.href = 'about.html#accessibility-statement';
                } else {
                    // Scroll to accessibility statement section
                    document.querySelector('.card-header h3').scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    },
    
    /**
     * Announce a message to screen readers
     * @param {string} message - Message to announce
     */
    announceToScreenReader: function(message) {
        // Check if live region exists, create if not
        let liveRegion = document.getElementById('screen-reader-announcer');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'screen-reader-announcer';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            document.body.appendChild(liveRegion);
        }
        
        // Set the message
        liveRegion.textContent = message;
        
        // Clear after 3 seconds
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 3000);
    }
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    AccessiChef.init();
});