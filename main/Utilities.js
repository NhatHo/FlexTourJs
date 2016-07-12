/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

let Constants = require("./Constants");
let $ = require("./../node_modules/jquery/dist/jquery.min.js");

module.exports = {
    /**
     * Check if the target is visible or not. This has a draw back that the target might not have render completely
     * If that is the case the bubble and highlight box will not render properly.
     * @param targets    Array of targets of current step
     * @return {boolean}    True if target takes up a rectangle in the DOM, false otherwise
     */
    isVisible: function (targets) {
        let result = true;
        let targetsArray = this.convertToArray(targets);
        for (let i = 0; i < targetsArray.length; i++) {
            let element = $(targetsArray[i]);
            if (this.hasELement(element)) {
                result = result && element.is(":visible");
            } else {
                // If any element doesn't exist --> return false immediately
                return false;
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
        // Make sure the input becomes an array event if it's a single target
        let targetsArray = this.convertToArray(targets);
        for (let i = 0; i < targetsArray.length; i++) {
            result = result && this.hasELement($(targetsArray[i]));
        }
        return result;
    },

    /**
     * Check if the input is an array, convert it to an array when it is NOT
     * @param elements {String|Array}   Input elements
     * @returns {*}     An array contains elements
     */
    convertToArray: function (elements) {
        if ($.isArray(elements)) {
            return elements;
        } else {
            return [elements];
        }
    },

    /**
     * Check if a given object a valid object with content.
     * If given an array, the array must have element
     * @param object        Any object, array, letiable
     * @returns {boolean}   True if valid, false otherwise
     */
    isValid: function (object) {
        if ($.isArray(object)) {
            return object.length > 0;
        }
        return (object != null && typeof object != 'undefined');
    },

    /**
     * Check if the given Jquery selector has any element
     * @param $el       JQuery selector
     * @returns {boolean}       True if it has child element
     */
    hasELement: function ($el) {
        return ($el.length > 0);
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
        el.on(type, callback);
    },

    /**
     * Remove event listener for cleaning up
     * @param el        Element that contains event that needs to be removed
     * @param type      Type of event that was attached
     * @param callback  Function to remove from the event
     */
    removeEvent: function (el, type, callback) {
        if (!this.isValid(el))
            return;
        el.off(type, callback);
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
     * Get the first element found in the DOM
     * @param className     The classname of the element without the "."
     * @param jquerySelector    When set to true, just the return the selector instead of the 1st element
     * @returns {*}     The first element or nothing
     */
    getEleFromClassName: function (className, jquerySelector) {
        let $el = $(this.getClassName(className));

        if (jquerySelector) {
            return $el;
        }

        if ($el) {
            return $el[0];
        }
        return $el;
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
    isStepWithTarget: function (stepDesc) {
        return (stepDesc.hasOwnProperty(Constants.TARGET) && stepDesc.hasOwnProperty(Constants.CONTENT));
    },

    /**
     * Check if the current step is a floating step. Meaning there isn't a target.
     * @param stepDesc      Description of the step
     * @returns {boolean|*} True when step has content and position is set to float
     */
    isFloatStep: function (stepDesc) {
        return (stepDesc[Constants.POSITION] === Constants.FLOAT && stepDesc.hasOwnProperty(Constants.CONTENT));
    },

    /**
     * Check to see if current step is a valid drag and drop step, the DND flag must be set, and there must be a target to attach event to.
     * @param stepDesc {Object}     The object that contains the description of the current step
     */
    isDnDStep: function (stepDesc) {
        return (stepDesc[Constants.DND] && stepDesc.hasOwnProperty(Constants.TARGET));
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
        this.addEvent(els, event, callback);
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
        this.removeEvent(els, event, callback);
    },

    /**
     * Get max of Window height or document height
     * @returns {Number|number}     window width through 1 of 3 methods
     */
    getFullWindowWidth: function () {
        let width = 0;
        if (typeof(window.innerWidth) == 'number') {
            //Non-IE
            width = window.innerWidth;
        } else if (document.documentElement && document.documentElement.clientWidth) {
            //IE 6+ in 'standards compliant mode'
            width = document.documentElement.clientWidth;
        }
        return Math.max($(document).width(), $(window).width(), width);
    },

    /**
     * Get max of either window width or document width.
     * @returns {Number|number}     window height through 1 of 3 methods
     */
    getFullWindowHeight: function () {
        let height = 0;
        if (typeof(window.innerHeight ) == 'number') {
            height = window.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            //IE 6+ in 'standards compliant mode'
            height = document.documentElement.clientHeight;
        }
        return Math.max($(document).height(), $(window).height(), height);
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
    },

    /**
     * Smooth scroll to the element
     * @param rect    The target of the step that needs to be scrolled to
     */
    smoothScroll: function (rect) {
        let $elTop = rect.top;
        let $elHeight = rect.height;
        let windowHeight = $(window).height();
        let offset;
        if ($elHeight < windowHeight) {
            offset = $elTop - ((windowHeight / 2) - ($elHeight / 2));
        } else {
            offset = $elTop + windowHeight / 2;
        }
        $('html, body').animate({
            scrollTop: offset
        }, 700);
    },

    /**
     * Store the give key, value pair to localstorage
     * Flextour uses flextour.localstorage key in localstorage for storing data.
     * @param key {String}      The key of the data piece that you want to store
     * @param value {String|Object|Number}    The value that you want to store
     */
    setKeyValuePairLS: function (key, value) {
        try {
            let storageValue = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_KEY));
            // Initialize the storageValue object if it was not previously set
            if (!this.isValid(storageValue)) {
                storageValue = {};
            }
            storageValue[key] = value;
            localStorage.setItem(Constants.LOCALSTORAGE_KEY, JSON.stringify(storageValue));
        } catch (e) {
            // Ignore the error message, print to console that multipage features are not supported
            console.log("Multipage feature cannot be supported in this browser version");
        }
    },

    /**
     * Get the value that is currently stored in localstorage corresponds to the given key
     * @param key {String}      The key of the data piece that we want to retrieve
     * @returns {Object}        The content of given key, if it doesn't exist, return empty object
     */
    getKeyValuePairLS: function (key) {
        try {
            return JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_KEY))[key];
        } catch (e) {
            // Ignore the error if the key doesn't exist
            return {};
        }
    },

    /**
     * Remove the key and value pair in localstorage with given key. This is to cleanup everything properly after used.
     * @param key {String}      The key of data that we want to remove from LS
     */
    removeKeyValuePairLS: function (key) {
        try {
            let flexTourLS = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_KEY));
            delete flexTourLS[key];
            localStorage.setItem(Constants.LOCALSTORAGE_KEY, JSON.stringify(flexTourLS));
        } catch (e) {
            // Ignore the error message
        }
    },

    /**
     * Check if the flag exists, if it exist, is it true or false?
     */
    checkFlag: function (flag) {
        if (typeof flag === 'object' && $.isEmptyObject(flag)) {
            return false;
        } else {
            return flag;
        }
    }
};
