/**
 * AccessiChef - Recipe Timer Utility
 * 
 * This utility provides timer functionality for cooking steps in recipes.
 * It supports starting, stopping, and pausing timers with visual and audio feedback.
 * 
 * @author Spencer Purdy
 * @version 1.0.0
 * @for COMP 5970/6970 Assistive and Accessible Computing
 */

// Use strict mode for better error catching and performance
'use strict';

/**
 * Recipe Timer - Manages timers for cooking steps
 */
const RecipeTimer = {
    /**
     * Timer interval ID
     */
    timerInterval: null,
    
    /**
     * Current timer seconds remaining
     */
    secondsRemaining: 0,
    
    /**
     * Current timer display element
     */
    currentTimerDisplay: null,
    
    /**
     * Timer completion callback
     */
    completionCallback: null,
    
    /**
     * Check if a timer is currently running
     * @returns {boolean} True if timer is running, false otherwise
     */
    isRunning: function() {
        return this.timerInterval !== null;
    },
    
    /**
     * Start a timer
     * @param {number} seconds - Number of seconds for the timer
     * @param {HTMLElement} displayElement - Element to display the timer
     * @param {Function} callback - Optional callback to run when timer completes
     */
    startTimer: function(seconds, displayElement, callback) {
        // Stop any existing timer
        this.stopTimer();
        
        // Set new timer parameters
        this.secondsRemaining = seconds;
        this.currentTimerDisplay = displayElement;
        this.completionCallback = callback || null;
        
        // Update display initially
        this.updateTimerDisplay();
        
        // Start interval
        this.timerInterval = setInterval(() => {
            this.secondsRemaining--;
            
            // Update display
            this.updateTimerDisplay();
            
            // Check if timer completed
            if (this.secondsRemaining <= 0) {
                this.completeTimer();
            }
        }, 1000);
        
        console.log(`Timer started: ${seconds} seconds`);
    },
    
    /**
     * Stop and clear the current timer
     */
    stopTimer: function() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.secondsRemaining = 0;
            
            // Update display if available
            if (this.currentTimerDisplay) {
                this.updateTimerDisplay();
            }
            
            console.log('Timer stopped');
        }
    },
    
    /**
     * Pause the current timer
     */
    pauseTimer: function() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            
            console.log('Timer paused');
        }
    },
    
    /**
     * Resume a paused timer
     */
    resumeTimer: function() {
        if (!this.timerInterval && this.secondsRemaining > 0) {
            this.timerInterval = setInterval(() => {
                this.secondsRemaining--;
                
                // Update display
                this.updateTimerDisplay();
                
                // Check if timer completed
                if (this.secondsRemaining <= 0) {
                    this.completeTimer();
                }
            }, 1000);
            
            console.log('Timer resumed');
        }
    },
    
    /**
     * Update the timer display element
     */
    updateTimerDisplay: function() {
        if (this.currentTimerDisplay) {
            const minutes = Math.floor(this.secondsRemaining / 60);
            const seconds = this.secondsRemaining % 60;
            
            // Format as MM:SS with leading zeros
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.currentTimerDisplay.textContent = formattedTime;
            
            // Add visual feedback as timer gets low
            if (this.secondsRemaining <= 10) {
                this.currentTimerDisplay.classList.add('text-danger', 'fw-bold');
            } else {
                this.currentTimerDisplay.classList.remove('text-danger', 'fw-bold');
            }
        }
    },
    
    /**
     * Handle timer completion
     */
    completeTimer: function() {
        // Stop the timer
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        
        // Play completion sound
        this.playTimerCompleteSound();
        
        // Visual feedback
        if (this.currentTimerDisplay) {
            this.currentTimerDisplay.textContent = 'DONE!';
            this.currentTimerDisplay.classList.add('bg-success', 'text-white', 'fw-bold');
            
            // Reset visual styling after 3 seconds
            setTimeout(() => {
                this.currentTimerDisplay.classList.remove('bg-success', 'text-white', 'fw-bold');
                this.currentTimerDisplay.textContent = '00:00';
            }, 3000);
        }
        
        // Execute completion callback if provided
        if (typeof this.completionCallback === 'function') {
            this.completionCallback();
        }
        
        console.log('Timer completed');
    },
    
    /**
     * Play a sound when the timer completes
     */
    playTimerCompleteSound: function() {
        // Create audio element
        const audio = new Audio();
        
        // Set source to a simple beep sound
        audio.src = 'data:audio/wav;base64,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';
        
        // Play the sound
        audio.play().catch(error => {
            console.warn('Unable to play timer completion sound:', error);
        });
    }
};