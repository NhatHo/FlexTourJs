/**
 * Created by NhatHo on 2016-05-19.
 *
 * Inspired by Introjs <https://github.com/usablica/intro.js>
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require, exports, module);
    } else {
        root.FlexTour = factory();
    }
}(this, function(require, exports, module) {
    'use strict';

    var tether = require('node_modules/dist/js/tether.js');

    this.__toursMap = []; // Initialize the map contains all tours for this library after preprocessing
    this.__currentTour = {}; // Initialize object contains description of current tour
    this.__currentTourIndex = -1; // Initialize the index of the current tour

    const TOP_OVERLAY = "flextour-top-overlay";
    const RIGHT_OVERLAY = "flextour-right-overlay";
    const BOTTOM_OVERLAY = "flextour-bottom-overlay";
    const LEFT_OVERLAY = "flextour-left-overlay";
    const CLASS = ".";

    const OVERLAY_STYLE = "flextour-overlay-styles";

    const TARGET_BORDER = "flextour-target-border";
    const TOUR_BUBBLE = "flextour-tour-bubble";

    const ICON = "flextour-icon";
    const CLOSE_TOUR = "flextour-close";

    const DEFAULT_STEP_SETTINGS = {
        type: "info",
        position: "bottom-middle",
        stepNumber: false,
        canInteract: false,
        nextOnTargetClick: false
    };

    /**
     * Constructor of FlexTour library
     * @constructor
     */
    var FlexTour = function() {

    };

    FlexTour.get = function(tourId) {

    }

    /**
     *
     */
    FlexTour.run = function run() {
        if(this.__currentTourIndex < 0) {
            console.log("There is NOT any available tour to run.");
            return;
        }

        var currentTour = this.__currentTour = __clone({}, this.__toursMap[this.__currentTourIndex]);

    }

    FlexTour.greetings = function greetings() {
        this.__currentTour = __clone({}, this.__toursMap[this.__currentTourIndex]);
        if(this.__currentTour["greetings"]) {
            _greetingsNewUser(this.__currentTour["greetings"]);
        }
    }

    /**
     * Used to set the descriptions of tour(s). Can either be a single object contains tour description or an array of several tours
     * @param tourDesc      Object or Array of Objects each contains description of a tour
     */
    FlexTour.set = function(tourDesc) {
        if(!__isValid(tourDesc)) {
            return;
        }

        _preProcessingTour(tourDesc);

        if(this.__toursMap.length > 0) {
            this.__currentTourIndex = 0;
        }
    }

    /*******************************TOUR RUNNER*********************************************/

    /**
     * Pre-process all information for all tours make sure each step and each tour contains necessary
     * information for subsequent steps
     * @param tourDesc      JSON description file that has all information needed
     */
    function _preProcessingTour(tourDesc) {
        var _tourDesc = {};
        __clone(_tourDesc, tourDesc);

        for(var i = 0; i < _tourDesc.length; i++) {
            var rawTour = _tourDesc[i];

            // Fill in information for each tour in case any important information is missing
            rawTour.id = rawTour.id || "tour" + i;
            rawTour.greetings = rawTour.greetings || {};
            rawTour.transition = rawTour.transition || {};
            rawTour.canInteract = rawTour.canInteract || false;
            rawTour.endOnOverlayClick = rawTour.endOnOverlayClick || true;
            rawTour.endOnEsc = rawTour.endOnEsc || true;

            // Fill in information for each step in case anything important is missing
            if(__isValid(rawTour["steps"])) {
                var numOfSteps = rawTour["steps"].length;
                rawTour.steps = __clone({}, DEFAULT_STEP_SETTINGS,  rawTour["steps"]);
            }

            this.__toursMap.push(rawTour);
        }
    }

    function _greetingsNewUser(greetings) {

    }

    function _transitionToNextTour(transition) {

    }

    function _transtionToNextStep() {

    }

    function _transitionToPrevStep() {

    }

    function _skipStep() {

    }

    function _attachTriggerOnClick() {

    }

    /**
     * Check if the target is visible or not. This has a draw back that the target might not have render completely
     * If that is the case the bubble and highlight box will not render properly.
     * @param target    Target of current step
     * @return {boolean}    True if target takes up a rectangle in the DOM, false otherwise
     */
    function __isTargetVisible(target) {
        var element = document.querySelector(target);
        if(__isValid(element)) {
            return element.offsetHeight > 0 && element.offsetWidth > 0;
        }
        return false;
    }

    /**
     * Check if the target exists in the DOM or not. This operator costs less than _isTargetVisible function.
     * @param target    Target of current step
     * @returns {boolean}       True if target exists in DOM, false otherwise
     */
    function __doesTargetExist(target) {
        var element = document.querySelector(target);
        return __isValid(element);
    }

    /*******************************UTILITIES**********************************************/

    /**
     * Deep extending object from object A to object B
     * __clone({},A,B) Exactly how it works in Jquery
     * @param output        New Object that contains merge of A and B
     * @returns {*|{}}      Return new object
     */
    function __clone (output) {
        output = output || {};

        for(var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];

            if(!__isValid(obj))
                continue;

            for(var key in obj) {
                if(obj.hasOwnProperty(key)) {
                    if(typeof obj[key] === 'object') {
                        output[key] = __clone(output[key], obj[key]);
                    } else {
                        output[key] = obj[key];
                    }
                }
            }
        }
        return output;
    }

    /**
     * Check if a given object a valid object with content
     * @param object        Any object, array, variable
     * @returns {boolean}   True if valid, false otherwise
     */
    function __isValid(object) {
        if(object == null || typeof object == 'undefined') {
            return false;
        }
        return true;
    }

    /**
     * Get the content of the next tour based on the given tourId
     * @param tourId        The id of tour that needs to be looked up
     * @returns Return the content of tour if it matches tourId, return null otherwise
     */
    function _getTourFromId(tourId) {
        for (var i = 0; i < this.__toursMap.length; i++) {
            if(this.__toursMap[i].id === tourId) {
                return this.__toursMap[i];
            }
        }

        return null;
    }

    /**
     * Get the next tour in line. Only used when there multiple tours given at the beginning
     * @returns     If there isn't any tour return nothing, otherwise return subsequent tour
     */
    function __getNextTourInLine() {
        if(this.__toursMap.length === this.__currentTourIndex + 1) {
            return -1;
        }
        var newTourIndex = this.__currentTourIndex + 1;

        this.__currentTourIndex = newTourIndex;

        return this.__toursMap[newTourIndex];
    }

    /**
     * Add event to element without unnecessarily overrid original handlers
     * @param el        Element to be attached listener/event on
     * @param type      Type of event to listen to
     * @param callback  Callback function when event is fired
     */
    function __addEvent(el, type, callback) {
        if(!__isValid(el))
            return;
        if(el.addEventListener) {
            el.addEventListener(type,callback,false);
        } else if(el.attachEvent) {
            el.attachEvent("on" + type, callback);
        } else {
            el["on" + type] = callback;
        }
    }

    /**
     * Remove event listener for cleaning up
     * @param el        Element that contains event that needs to be removed
     * @param type      Type of event that was attached
     * @param callback  Callback function triggered to handle this scenario
     */
    function __removeEvent(el, type, callback) {
        if(!__isValid(el))
            return;
        if(el.removeEventListener) {
            el.removeEventListener(type, callback);
        } else if(el.detachEvent) {
            el.detachEvent(type, callback);
        } else {
            el["off"+type] = callback;
        }
    }

    /**
     * Add window resize event to recalculate location of tour step.
     * The event is namespaced to avoid conflict with program's handler and easier to unbind later on.
     */
    function _addResizeWindowListener() {
        __addEvent(window, "flextour.resize", function(event) {
            console.log("Doing resizing window event");
        });
    }

    /**
     * Remove resize listener from window without detaching other handlers from main program
     */
    function _unbindResizeWindowListener() {
        __removeEvent(window, "flextour.resize");
    }

    /*******************************ADD OVERLAY BLOCKS*************************************/

    /**
     * Add top overlay into document body
     * @param elementRect    Bounding Rect around target element
     */
    function _addTopOverlay(elementRect) {
        var height = elementRect.top;
        var width = document.body.getBoundingClientRect().width;

        // Put overlay on top left of the screen
        __generateOverlay(width, height, 0, 0);
    }

    /**
     * Add Right overlay next to target element
     * @param elementRect    Bounding Rect around target element
     */
    function _addRightOverlay(elementRect) {
        var height = elementRect.height;
        var width = document.body.getBoundingClientRect().width - elementRect.left - elementRect.width;

        // Put overlay on the top right of the target element
        __generateOverlay(width, height, height, elementRect.left + elementRect.width);
    }

    /**
     * Generate Bottom overlay element
     * @param elementRect       Bounding Rect around target element
     */
    function _addBottomOverlay(elementRect) {
        var height = document.body.getBoundingClientRect().height - elementRect.top - elementRect.height;
        var width = document.body.getBoundingClientRect().width;

        // Put over on the bottom of target element
        __generateOverlay(width, height, elementRect.top + elementRect.height, 0);
    }

    /**
     * Generate Left overlay element
     * @param elementRect       Bounding Rect around target element
     * @private
     */
    function _addLeftOverlay(elementRect) {
        var height = elementRect.height;
        var width = elementRect.left;

        // Put overlay over space on the left of target
        __generateOverlay(width, height. height, 0);
    }

    /**
     * Generate generic overlay element from given height and width
     * @param width     Width of overlay element
     * @param height    Height of overlay element
     */
    function __generateOverlay(width, height, top, left) {
        var topOverlay = document.createElement("div");
        topOverlay.className(OVERLAY_STYLE);
        topOverlay.setAttribute("style", "width: " + width + "px; height: " + height + "px; top: " + top + "px; left: " + left + "px;");

        document.body.appendChild(topOverlay);
    }

    /**
     * Main function to add overlay around target: top right bottom left like padding settings
     * @param target        Target element which is used to put overlays around
     */
    function _addOverlaysAroundTarget(target) {
        var element = document.querySelector(target);
        if(__isValid(element)) {
            var elementRect = element.getBoundingClientRect();
            _addTopOverlay(elementRect);
            _addRightOverlay(elementRect);
            _addBottomOverlay(elementRect);
            _addLeftOverlay(elementRect);
        }
    }

    /*******************************TEAR DOWN*********************************************/

    /**
     * Remove the overlay on top of the target
     * @private topOverlay contains the DOM element of top overlay
     */
    function _removeTopOverlay() {
        var topOverlay = document.querySelector(CLASS + TOP_OVERLAY);
        if(__isValid(topOverlay))
            topOverlay.parentNode.removeChild(topOverlay);
    }

    /**
     * Remove the overlay on the right of the target
     * @private rightOverlay contains the DOM element of right overlay
     */
    function _removeRightOverlay() {
        var rightOverlay = document.querySelector(CLASS + RIGHT_OVERLAY);
        if(__isValid(rightOverlay))
            rightOverlay.parentNode.removeChild(rightOverlay);
    }

    /**
     * Remove the overlay on the bottom of the target
     * @private bottomOverlay contains the DOM element of bottom overlay
     */
    function _removeBottomOverlay() {
        var bottomOverlay = document.querySelector(CLASS + BOTTOM_OVERLAY);
        if(__isValid(bottomOverlay))
            bottomOverlay.parentNode.removeChild(bottomOverlay);
    }

    /**
     * Remove the overlay on the left of the target
     * @private leftOverlay contains the DOM element of the left overlay
     */
    function _removeLeftOverlay() {
        var leftOverlay = document.querySelector(CLASS + LEFT_OVERLAY);
        if(__isValid(leftOverlay))
            leftOverlay.parentNode.removeChild(leftOverlay);
    }

    /**
     * Remove the border around target
     * @private targetBorder contains the DOM element of border around target
     */
    function _removeBorder() {
        var targetBorder = document.querySelector(CLASS + TARGET_BORDER);
        if(__isValid(targetBorder))
            targetBorder.parentNode.removeChild(targetBorder);
    }

    /**
     * Remove the actual tour bubble that display the content
     * @private tourBubble contains the DOM element of the bubble display step description
     */
    function _removeTourBubble() {
        var tourBubble = document.querySelector(CLASS + TOUR_BUBBLE);
        if(__isValid(tourBubble))
            tourBubble.parentNode.removeChild(tourBubble);
    }

    /**
     * Cleanup everything when tour end
     * @private
     */
    function _cleanUp() {
        _removeTopOverlay();
        _removeRightOverlay();
        _removeBottomOverlay();
        _removeLeftOverlay();
        _removeTourBubble();
        _removeBorder();
    }

    var flexTour = function(tourDesc) {

    };

    flexTour.fn = flexTour.prototype = {

    };

    exports.flexTour = flexTour;
    return flexTour;
}));