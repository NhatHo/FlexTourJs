/**
 * Created by NhatHo on 2016-06-01.
 */

import * as Constants from "./Constants";

module.exports = {

    /**
     * Shallow clone an object and return the first object in list
     * Similar to extend in jquery. clone(output, obj1, obj2)
     * The right most will override the left objects
     * @param out        Object to be override, usually the result object
     * @returns {*|{}}      Return back the object in 1st location
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
     * Deep clone an object and merge it with all objects on the right
     * @param out       Given object for merging and cloning
     * @returns {*|{}}  Original object after merging and cloning
     */
    deepClone: function (out) {
        out = out || {};

        for (let i = 1; i < arguments.length; i++) {
            let obj = arguments[i];

            if (!obj)
                continue;

            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object')
                        out[key] = this.deepClone(out[key], obj[key]);
                    else
                        out[key] = obj[key];
                }
            }
        }

        return out;
    },

    /**
     * Check if the target is visible or not. This has a draw back that the target might not have render completely
     * If that is the case the bubble and highlight box will not render properly.
     * @param target    Target of current step
     * @return {boolean}    True if target takes up a rectangle in the DOM, false otherwise
     */
    isVisible: function (target) {
        let element = document.querySelector(target);
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
        let element = document.querySelector(target);
        return this.isValid(element);
    },

    /**
     * Check if a given object a valid object with content
     * @param object        Any object, array, letiable
     * @returns {boolean}   True if valid, false otherwise
     */
    isValid: function (object) {
        return (object == null || typeof object == 'undefined');
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
        return document.querySelector(this.getClassName(className));
    },

    /**
     * Get multiple DOM elements from given class, usually use for multiple elements with same class name
     * @param className     Similar classname of group of elements
     */
    getElesFromClassName: function (className) {
        return document.querySelectorAll(this.getClassName(className));
    }
};
