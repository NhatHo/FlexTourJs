/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

let Constants = require("./Constants");

module.exports = {

    /**
     * Clone given objects into another object. Doesn't work with array.
     * This is not deep clone so only 1 level will be cloned, the rest will keep its references
     * @param out           The output object
     * @returns {*|{}}      Cloned object of all other objects in the list
     */
    clone: function (out) {
        out = out || {};

        for (let i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (let key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }
        return out;
    },


    /**
     * Check if the target is visible or not. This has a draw back that the target might not have render completely
     * If that is the case the bubble and highlight box will not render properly.
     * @param targets    Array of targets of current step
     * @return {boolean}    True if target takes up a rectangle in the DOM, false otherwise
     */
    isVisible: function (targets) {
        let result = true;
        for (let i = 0; i < targets.length; i++) {
            let element = document.querySelector(targets[i]);
            if (this.isValid(element)) {
                result = result && element.offsetHeight > 0 && element.offsetWidth > 0;
            }
        }
        return result;
    },

    /**
     * Check if the target exists in the DOM or not. This operator costs less than _isTargetVisible function.
     * @param targets    Target of current step
     * @returns {boolean}       True if target exists in DOM, false otherwise
     */
    doesExist: function (targets) {
        let result = true;
        for (let i = 0; i < targets.length; i++) {
            result = result && this.isValid(document.querySelector(targets[i]));
        }
        return result;
    },

    /**
     * Check if a given object a valid object with content.
     * If given an array, the array must have element
     * @param object        Any object, array, letiable
     * @returns {boolean}   True if valid, false otherwise
     */
    isValid: function (object) {
        if (Array.isArray(object)) {
            return object.length > 0;
        }
        return (object != null && typeof object != 'undefined');
    },

    /**
     * Add event to element without unnecessarily overrid original handlers
     * @param el        Element to be attached listener/event on
     * @param type      Type of event to listen to
     * @param callback  Callback function when event is fired
     * @param capture   Use Capture for this event or not
     */
    addEvent: function (el, type, callback, capture) {
        if (!this.isValid(el))
            return;
        if (el.addEventListener) {
            el.addEventListener(type, callback, capture || false);
        } else if (el.attachEvent) {
            el.attachEvent("on" + type, callback);
        } else {
            el["on" + type] = callback;
        }
    },

    /**
     * Remove event listener for cleaning up
     * @param el        Element that contains event that needs to be removed
     * @param type      Type of event that was attached
     * @param callback  Function to remove from the event
     * @param capture   Use Capture for this event or not
     */
    removeEvent: function (el, type, callback, capture) {
        if (!this.isValid(el))
            return;
        if (el.removeEventListener) {
            el.removeEventListener(type, callback, capture || false);
        } else if (el.detachEvent) {
            el.detachEvent(type, callback);
        } else {
            el["off" + type] = callback;
        }
    },

    /**
     * Prevent event to propagate and behave by default. Generally used for click event
     * @param event     The event to be stopped default behavior
     */
    noDefault: function (event) {
        event.preventDefault();
        event.stopPropagation();
    },

    /**
     * Simple function to create Class Name selector from give html class
     * @param className     class name of give DOM element
     * @returns {*}     .className for query selector
     */
    getClassName: function (className) {
        return Constants.CLASS + className;
    },

    /**
     * Get DOM Node from given classname, only return 1 Element
     * @param className     Given classname of element we want to get the element
     */
    getEleFromClassName: function (className) {
        return document.querySelector(this.getClassName(className));
    },

    /**
     * Get multiple DOM elements from given class, usually use for multiple elements with same class name
     * @param className     Similar classname of group of elements
     */
    getElesFromClassName: function (className) {
        return document.querySelectorAll(this.getClassName(className));
    },

    /**
     * Check if the description of this step is valid.
     * Step must at least have target and description
     * @param stepDesc      The description of the step
     * @returns {*|boolean} True if it has target AND content, false otherwise
     */
    isStepWithTarget: function (stepDesc) {
        return (this.isValid(stepDesc[Constants.TARGET]) && this.isValid(stepDesc[Constants.CONTENT]));
    },

    /**
     * Check if the current step is a floating step. Meaning there isn't a target.
     * @param stepDesc      Description of the step
     * @returns {boolean|*} True when step has content and position is set to float
     */
    isFloatStep: function (stepDesc) {
        return (stepDesc[Constants.POSITION] === Constants.FLOAT && this.isValid(stepDesc[Constants.CONTENT]));
    },

    /**
     * Get the element list from the given classname.
     * Run through each element and attach event and callback function to it
     * @param className     The className of element (without the DOT)
     * @param event         The event that will trigger
     * @param callback      The callback function that will be triggered when event is triggered
     */
    getElementsAndAttachEvent: function (className, event, callback) {
        let els = this.getElesFromClassName(className);
        for (let i = 0; i < els.length; i++) {
            this.addEvent(els[i], event, callback);
        }
    },

    /**
     * Get the element list from the given classname.
     * Run through each element and UNATTACH event and trigger callback function
     * @param className     The className of element (without the DOT)
     * @param event         The event that will trigger
     * @param callback      The callback function that will be triggered when event is triggered
     */
    removeELementsAndAttachedEvent: function (className, event, callback) {
        let els = this.getElesFromClassName(className);
        for (let i = 0; i < els.length; i++) {
            this.removeEvent(els[i], event, callback);
        }
    },

    /**
     * Execute the function with given name in a given lists of function.
     * Make sure that the function exists in the list before executing it.
     * @param functionName      The name of the given function
     * @param functionsList      The list that SHOULD contain the given function
     */
    executeFunctionWithName: function (functionName, functionsList) {
        if (typeof functionsList[functionName] === "function") {
            return functionsList[functionName].call();
        }
        // If the given function name exist in the list, return false to halt the process. Because this could cause the flow to break.
        return false;
    },

    /**
     * Get the innerwidth of window first
     * If it doesn't exist then get clientWidth through documentElement which is needed for IE8 or earlier
     * Lastly, if those 2 methods failed, get clientWidth through document.body
     * @returns {Number|number}     window width through 1 of 3 methods
     */
    getFullWindowWidth: function () {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; // For IE8 or earlier
    },

    /**
     * Get the innerHeight of window first
     * If it doesn't exist then get clientHeight through documentElement which is needed for IE8 or earlier
     * Lastly, if those 2 methods failed, get clientHeight through document.body
     * @returns {Number|number}     window height through 1 of 3 methods
     */
    getFullWindowHeight: function () {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // For IE8 or earlier
    },

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     * Taken from Underscore.js
     */
    debounce: function (func, wait, immediate) {
        let timeout;
        return function () {
            let context = this, args = arguments;
            let later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
};
