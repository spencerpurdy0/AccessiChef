/**
 * AccessiChef - Accessibility Features
 * 
 * This file contains the implementation of accessibility features for the AccessiChef application,
 * including theme switching, text resizing, keyboard navigation, and more.
 * 
 * @author Spencer Purdy
 * @version 1.0.0
 * @for COMP 5970/6970 Assistive and Accessible Computing
 */

// Use strict mode for better error catching and performance
'use strict';

/**
 * Accessibility Features - Manages accessibility options
 */
const AccessibilityFeatures = {
    /**
     * Current text size level (1-5)
     */
    textSizeLevel: 2,
    
    /**
     * Maximum text size level
     */
    maxTextSize: 5,
    
    /**
     * Minimum text size level
     */
    minTextSize: 1,
    
    /**
     * Current theme
     */
    currentTheme: 'default',
    
    /**
     * Initialize accessibility features
     */
    init: function() {
        // Load saved preferences
        this.loadPreferences();
        
        // Set up event listeners for accessibility controls
        this.setupEventListeners();
        
        // Apply current preferences
        this.applyPreferences();
        
        // Set up keyboard navigation
        this.setupKeyboardNavigation();
        
        // Initialize screen reader announcement regions
        this.initAnnouncementRegions();
        
        console.log('Accessibility features initialized');
    },
    
    /**
     * Set up event listeners for accessibility controls
     */
    setupEventListeners: function() {
        // Theme toggle buttons
        const themeDefault = document.getElementById('theme-default');
        const themeHighContrast = document.getElementById('theme-high-contrast');
        const themeLargeText = document.getElementById('theme-large-text');
        
        if (themeDefault) {
            themeDefault.addEventListener('click', () => this.setTheme('default'));
        }
        
        if (themeHighContrast) {
            themeHighContrast.addEventListener('click', () => this.setTheme('high-contrast'));
        }
        
        if (themeLargeText) {
            themeLargeText.addEventListener('click', () => this.setTheme('large-text'));
        }
        
        // Text size controls
        const textIncrease = document.getElementById('text-increase');
        const textDecrease = document.getElementById('text-decrease');
        
        if (textIncrease) {
            textIncrease.addEventListener('click', () => this.increaseTextSize());
        }
        
        if (textDecrease) {
            textDecrease.addEventListener('click', () => this.decreaseTextSize());
        }
    },
    
    /**
     * Initialize screen reader announcement regions
     * Creates both polite and assertive live regions for different types of announcements
     */
    initAnnouncementRegions: function() {
        // Create polite announcement region if it doesn't exist
        if (!document.getElementById('polite-announcer')) {
            const politeRegion = document.createElement('div');
            politeRegion.id = 'polite-announcer';
            politeRegion.className = 'sr-only';
            politeRegion.setAttribute('aria-live', 'polite');
            politeRegion.setAttribute('aria-atomic', 'true');
            politeRegion.setAttribute('role', 'status');
            document.body.appendChild(politeRegion);
        }
        
        // Create assertive announcement region if it doesn't exist
        if (!document.getElementById('assertive-announcer')) {
            const assertiveRegion = document.createElement('div');
            assertiveRegion.id = 'assertive-announcer';
            assertiveRegion.className = 'sr-only';
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.setAttribute('aria-atomic', 'true');
            assertiveRegion.setAttribute('role', 'alert');
            document.body.appendChild(assertiveRegion);
        }
    },
    
    /**
     * Load saved accessibility preferences from localStorage
     */
    loadPreferences: function() {
        try {
            // Load theme preference
            const savedTheme = localStorage.getItem('accessichef_theme');
            if (savedTheme) {
                this.currentTheme = savedTheme;
            }
            
            // Load text size preference
            const savedTextSize = localStorage.getItem('accessichef_text_size');
            if (savedTextSize) {
                this.textSizeLevel = parseInt(savedTextSize, 10);
            }
        } catch (error) {
            console.error('Error loading accessibility preferences:', error);
        }
    },
    
    /**
     * Save current accessibility preferences to localStorage
     */
    savePreferences: function() {
        try {
            localStorage.setItem('accessichef_theme', this.currentTheme);
            localStorage.setItem('accessichef_text_size', this.textSizeLevel.toString());
        } catch (error) {
            console.error('Error saving accessibility preferences:', error);
        }
    },
    
    /**
     * Apply current accessibility preferences
     */
    applyPreferences: function() {
        // Apply theme
        this.applyTheme(this.currentTheme);
        
        // Apply text size
        this.applyTextSize(this.textSizeLevel);
    },
    
    /**
     * Set the theme
     * @param {string} theme - Theme name ('default', 'high-contrast', or 'large-text')
     */
    setTheme: function(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.savePreferences();
        
        // Announce theme change to screen readers
        this.announceToScreenReader(`${theme.replace('-', ' ')} theme applied`);
    },
    
    /**
     * Apply the specified theme
     * @param {string} theme - Theme name
     */
    applyTheme: function(theme) {
        const themeStylesheet = document.getElementById('theme-stylesheet');
        
        if (themeStylesheet) {
            themeStylesheet.href = `css/themes/${theme}.css`;
        }
    },
    
    /**
     * Increase the text size
     */
    increaseTextSize: function() {
        if (this.textSizeLevel < this.maxTextSize) {
            this.textSizeLevel++;
            this.applyTextSize(this.textSizeLevel);
            this.savePreferences();
            
            // Announce text size change to screen readers
            this.announceToScreenReader(`Text size increased to level ${this.textSizeLevel} of ${this.maxTextSize}`);
        } else {
            // Announce maximum reached to screen readers
            this.announceToScreenReader(`Maximum text size reached`);
        }
    },
    
    /**
     * Decrease the text size
     */
    decreaseTextSize: function() {
        if (this.textSizeLevel > this.minTextSize) {
            this.textSizeLevel--;
            this.applyTextSize(this.textSizeLevel);
            this.savePreferences();
            
            // Announce text size change to screen readers
            this.announceToScreenReader(`Text size decreased to level ${this.textSizeLevel} of ${this.maxTextSize}`);
        } else {
            // Announce minimum reached to screen readers
            this.announceToScreenReader(`Minimum text size reached`);
        }
    },
    
    /**
     * Apply the specified text size
     * @param {number} level - Text size level (1-5)
     */
    applyTextSize: function(level) {
        // Remove any existing text size classes
        document.body.classList.remove('text-size-1', 'text-size-2', 'text-size-3', 'text-size-4', 'text-size-5');
        
        // Add the new text size class
        document.body.classList.add(`text-size-${level}`);
    },
    
    /**
     * Set up enhanced keyboard navigation
     */
    setupKeyboardNavigation: function() {
        // Add keydown event listener to document
        document.addEventListener('keydown', (e) => {
            // Skip if inside an input or textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Handle keyboard shortcuts
            switch (e.key) {
                // Escape key for closing modals or dropdowns
                case 'Escape':
                    // Close any open dropdowns
                    const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
                    if (openDropdowns.length > 0) {
                        e.preventDefault();
                        openDropdowns.forEach(dropdown => {
                            const dropdownToggle = document.querySelector(`[data-bs-toggle="dropdown"][aria-expanded="true"]`);
                            if (dropdownToggle) {
                                dropdownToggle.click();
                            }
                        });
                    }
                    break;
                
                // Accessibility shortcuts with Alt key
                case 'a':
                    if (e.altKey) {
                        // Alt+A: Toggle accessibility menu
                        e.preventDefault();
                        const accessibilityDropdown = document.querySelector('#accessibilityDropdown');
                        if (accessibilityDropdown) {
                            accessibilityDropdown.click();
                        }
                    }
                    break;
                
                case 'h':
                    if (e.altKey) {
                        // Alt+H: Navigate to home/index page
                        e.preventDefault();
                        window.location.href = 'index.html';
                    }
                    break;
                
                case 'i':
                    if (e.altKey) {
                        // Alt+I: Increase text size
                        e.preventDefault();
                        this.increaseTextSize();
                    }
                    break;
                
                case 'd':
                    if (e.altKey) {
                        // Alt+D: Decrease text size
                        e.preventDefault();
                        this.decreaseTextSize();
                    }
                    break;
                
                case 'c':
                    if (e.altKey) {
                        // Alt+C: Toggle high contrast theme
                        e.preventDefault();
                        this.setTheme(this.currentTheme === 'high-contrast' ? 'default' : 'high-contrast');
                    }
                    break;
                
                case 's':
                    if (e.altKey && document.getElementById('simplified-view-toggle')) {
                        // Alt+S: Toggle simplified view
                        e.preventDefault();
                        document.getElementById('simplified-view-toggle').click();
                    }
                    break;
            }
        });
        
        // Add focus trap for modals and dialogs
        this.setupFocusTraps();
    },
    
    /**
     * Set up focus traps for modals and dialogs
     */
    setupFocusTraps: function() {
        // This would be implemented to trap focus inside modal dialogs
        // For this demo, we're using Bootstrap's built-in focus management
    },
    
    /**
     * Announce a message to screen readers using appropriate live region
     * @param {string} message - Message to announce
     * @param {boolean} assertive - If true, use assertive announcement for important updates
     */
    announceToScreenReader: function(message, assertive = false) {
        // Determine which live region to use
        const regionId = assertive ? 'assertive-announcer' : 'polite-announcer';
        const liveRegion = document.getElementById(regionId);
        
        if (!liveRegion) {
            console.error(`Live region with ID '${regionId}' not found`);
            return;
        }
        
        // Set message with a slight delay to ensure screen readers detect the change
        // This helps when multiple rapid announcements occur
        setTimeout(() => {
            liveRegion.textContent = message;
            
            // Clear after appropriate time (longer for assertive messages)
            const clearDelay = assertive ? 5000 : 3000;
            
            setTimeout(() => {
                // Only clear if the content hasn't been changed again
                if (liveRegion.textContent === message) {
                    liveRegion.textContent = '';
                }
            }, clearDelay);
        }, 50);
    },
    
    /**
     * Announce important messages to screen readers (uses assertive live region)
     * @param {string} message - Important message to announce
     */
    announceImportant: function(message) {
        this.announceToScreenReader(message, true);
    }
};