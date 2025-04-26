/**
 * AccessiChef - Measurement Converter Utility
 * 
 * This utility provides functions for converting between metric and imperial
 * measurement units for cooking ingredients.
 * 
 * @author Spencer Purdy
 * @version 1.0.0
 * @for COMP 5970/6970 Assistive and Accessible Computing
 */

// Use strict mode for better error catching and performance
'use strict';

/**
 * Measurement Converter - Handles unit conversions for recipes
 */
const MeasurementConverter = {
    /**
     * Conversion factors for various units
     */
    conversionFactors: {
        // Volume conversions
        'ml': {
            toMetric: 1,
            toImperial: 0.033814
        },
        'l': {
            toMetric: 1000,
            toImperial: 33.814
        },
        'floz': {
            toMetric: 29.5735,
            toImperial: 1
        },
        'cup': {
            toMetric: 236.588,
            toImperial: 8
        },
        'pint': {
            toMetric: 473.176,
            toImperial: 16
        },
        'quart': {
            toMetric: 946.353,
            toImperial: 32
        },
        'tbsp': {
            toMetric: 14.7868,
            toImperial: 0.5
        },
        'tsp': {
            toMetric: 4.92892,
            toImperial: 0.166667
        },
        
        // Weight conversions
        'g': {
            toMetric: 1,
            toImperial: 0.035274
        },
        'kg': {
            toMetric: 1000,
            toImperial: 35.274
        },
        'oz': {
            toMetric: 28.3495,
            toImperial: 1
        },
        'lb': {
            toMetric: 453.592,
            toImperial: 16
        }
    },
    
    /**
     * Unit mappings between metric and imperial
     */
    unitMappings: {
        // Metric to imperial
        'ml': 'floz',
        'l': 'quart',
        'g': 'oz',
        'kg': 'lb',
        'tbsp': 'tbsp',
        'tsp': 'tsp',
        
        // Imperial to metric
        'floz': 'ml',
        'cup': 'ml',
        'pint': 'ml',
        'quart': 'l',
        'oz': 'g',
        'lb': 'kg'
    },
    
    /**
     * Convert a measurement from metric to imperial units
     * @param {number} amount - Amount to convert
     * @param {string} unit - Unit to convert from
     * @returns {Object} Converted amount and unit
     */
    convertToImperial: function(amount, unit) {
        // Handle special cases
        if (unit === 'pinch' || unit === 'dash' || unit === 'to taste' || unit === '') {
            return { amount: amount, unit: unit };
        }
        
        // Normalize unit to lowercase
        const normalizedUnit = unit.toLowerCase();
        
        // Check if unit is supported
        if (!this.conversionFactors[normalizedUnit]) {
            return { amount: amount, unit: unit };
        }
        
        // Get target unit
        const targetUnit = this.unitMappings[normalizedUnit];
        
        // Perform conversion
        let convertedAmount;
        
        if (this.isVolumeUnit(normalizedUnit)) {
            // Volume conversion
            const mlAmount = amount * this.conversionFactors[normalizedUnit].toMetric;
            convertedAmount = mlAmount * this.conversionFactors[targetUnit].toImperial;
        } else {
            // Weight conversion
            const gAmount = amount * this.conversionFactors[normalizedUnit].toMetric;
            convertedAmount = gAmount * this.conversionFactors[targetUnit].toImperial;
        }
        
        // Round appropriately
        convertedAmount = this.roundMeasurement(convertedAmount);
        
        return {
            amount: convertedAmount,
            unit: targetUnit
        };
    },
    
    /**
     * Convert a measurement from imperial to metric units
     * @param {number} amount - Amount to convert
     * @param {string} unit - Unit to convert from
     * @returns {Object} Converted amount and unit
     */
    convertToMetric: function(amount, unit) {
        // Handle special cases
        if (unit === 'pinch' || unit === 'dash' || unit === 'to taste' || unit === '') {
            return { amount: amount, unit: unit };
        }
        
        // Normalize unit to lowercase
        const normalizedUnit = unit.toLowerCase();
        
        // Check if unit is supported
        if (!this.conversionFactors[normalizedUnit]) {
            return { amount: amount, unit: unit };
        }
        
        // Get target unit
        const targetUnit = this.unitMappings[normalizedUnit];
        
        // Perform conversion
        let convertedAmount;
        
        if (this.isVolumeUnit(normalizedUnit)) {
            // Volume conversion
            const flozAmount = amount * this.conversionFactors[normalizedUnit].toImperial;
            convertedAmount = flozAmount * this.conversionFactors[targetUnit].toMetric;
        } else {
            // Weight conversion
            const ozAmount = amount * this.conversionFactors[normalizedUnit].toImperial;
            convertedAmount = ozAmount * this.conversionFactors[targetUnit].toMetric;
        }
        
        // Round appropriately
        convertedAmount = this.roundMeasurement(convertedAmount);
        
        return {
            amount: convertedAmount,
            unit: targetUnit
        };
    },
    
    /**
     * Check if a unit is a volume unit
     * @param {string} unit - Unit to check
     * @returns {boolean} True if volume unit, false otherwise
     */
    isVolumeUnit: function(unit) {
        return ['ml', 'l', 'floz', 'cup', 'pint', 'quart', 'tbsp', 'tsp'].includes(unit.toLowerCase());
    },
    
    /**
     * Round a measurement appropriately for cooking
     * @param {number} value - Value to round
     * @returns {number} Rounded value
     */
    roundMeasurement: function(value) {
        if (value >= 10) {
            // Round to nearest whole number
            return Math.round(value);
        } else if (value >= 1) {
            // Round to nearest quarter
            return Math.round(value * 4) / 4;
        } else {
            // Round to nearest eighth
            return Math.round(value * 8) / 8;
        }
    },
    
    /**
     * Format a measurement for display
     * @param {number} amount - Amount to format
     * @param {string} unit - Unit of measurement
     * @returns {string} Formatted measurement
     */
    formatMeasurement: function(amount, unit) {
        // Format fractions if applicable
        let formattedAmount = amount;
        
        // Format whole number with fraction
        if (amount % 1 !== 0) {
            const whole = Math.floor(amount);
            const fraction = amount - whole;
            
            // Convert to fraction
            let fractionString = '';
            
            if (Math.abs(fraction - 0.25) < 0.01) {
                fractionString = '¼';
            } else if (Math.abs(fraction - 0.5) < 0.01) {
                fractionString = '½';
            } else if (Math.abs(fraction - 0.75) < 0.01) {
                fractionString = '¾';
            } else if (Math.abs(fraction - 0.33) < 0.01 || Math.abs(fraction - 0.333) < 0.01) {
                fractionString = '⅓';
            } else if (Math.abs(fraction - 0.67) < 0.01 || Math.abs(fraction - 0.666) < 0.01) {
                fractionString = '⅔';
            } else if (Math.abs(fraction - 0.125) < 0.01) {
                fractionString = '⅛';
            } else if (Math.abs(fraction - 0.375) < 0.01) {
                fractionString = '⅜';
            } else if (Math.abs(fraction - 0.625) < 0.01) {
                fractionString = '⅝';
            } else if (Math.abs(fraction - 0.875) < 0.01) {
                fractionString = '⅞';
            } else {
                fractionString = fraction.toFixed(2);
            }
            
            formattedAmount = whole > 0 ? `${whole} ${fractionString}` : fractionString;
        }
        
        return `${formattedAmount} ${unit}`;
    }
};