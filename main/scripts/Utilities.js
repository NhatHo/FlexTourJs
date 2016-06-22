/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

var Constants = require("./Constants");
var $ = require("./../../node_modules/jquery/dist/jquery.min.js");

module.exports = {
    /**
     * Check if the target is visible or not. This has a draw back that the target might not have render completely
     * If that is the case the bubble and highlight box will not render properly.
     * @param target    Target of current step
     * @return {boolean}    True if target takes up a rectangle in the DOM, false otherwise
     */
    isVisible: function (target) {
        let element = $(target);
        if (this.isValid(element)) {
            return element.offsetHeight > 0 && element.offsetWidth > 0;
        }
        return false;
    },

    /**
     * Check if the target exists in the DOM or not. This operator costs less than _isTargetVisible function.
     * @param target    Target of current step
     * @returns {boolean}       True if target exists in DOM, false otherwise
     */
    doesExist: function (target) {
        let element = $(target);
        return this.isValid(element);
    },

    /**
     * Check if a given object a valid object with content
     * @param object        Any object, array, letiable
     * @returns {boolean}   True if valid, false otherwise
     */
    isValid: function (object) {
        return (object != null && typeof object != 'undefined');
    },

    /**
     * Add event to element without unnecessarily overrid original handlers
     * @param el        Element to be attached listener/event on
     * @param type      Type of event to listen to
     * @param callback  Callback function when event is fired
     */
    addEvent: function (el, type, callback) {
        if (!this.isValid(el))
            return;
        if (el.addEventListener) {
            el.addEventListener(type, callback, false);
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
     * @param callback  Callback function triggered to handle this scenario
     */
    removeEvent: function (el, type, callback) {
        if (!this.isValid(el))
            return;
        if (el.removeEventListener) {
            el.removeEventListener(type, callback);
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
        return $(this.getClassName(className));
    },

    /**
     * Get multiple DOM elements from given class, usually use for multiple elements with same class name
     * @param className     Similar classname of group of elements
     */
    getElesFromClassName: function (className) {
        return $(this.getClassName(className));
    },

    /**
     * Check if the description of this step is valid.
     * Step must at least have target and description
     * @param stepDesc      The description of the step
     * @returns {*|boolean} True if it has target AND content, false otherwise
     */
    isValidStep: function (stepDesc) {
        return (this.isValid(stepDesc[Constants.TARGET]) && this.isValid(stepDesc[Constants.CONTENT]));
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
    }
};
