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

    import * as constants from './constants';

    let tether = require('node_modules/dist/js/tether.js');
    let Tether = new tether();

    let __toursMap; // Initialize the map contains all tours for this library after preprocessing
    let __currentTour; // Initialize object contains description of current tour
    let __currentTourIndex; // Initialize the index of the current tour
    let __currentStep; // Initialize the index of current step

    /**
     * Constructor of FlexTour library
     * @constructor
     */
    function FlexTour() {
        __toursMap = [];
        __currentTour = {};
        __currentTourIndex = -1;
        __currentStep = -1;
    }

    FlexTour.prototype.get = function (tourId) {

    };

    /**
     * Run the preset tour. Start with the first tour
     */
    FlexTour.prototype.run = function run() {
        if (__currentTourIndex < 0) {
            console.log("There is NOT any available tour to run.");
            return;
        }

        let currentTour = __currentTour = __clone({}, __toursMap[__currentTourIndex]);
        __currentStep = 0;

        let steps = currentTour[constants.STEPS];
        if (__isValid(steps)) {
            let firstStep = steps[__currentStep];
            _centralOrganizer(firstStep);
        }
        console.log("Tour does NOT contain any step to display.");

    };

    /**
     * Used to set the descriptions of tour(s). Can either be a single object contains tour description or an array of several tours
     * @param tourDesc      Object or Array of Objects each contains description of a tour
     */
    FlexTour.prototype.set = function (tourDesc) {
        if(!__isValid(tourDesc)) {
            return;
        }

        _preProcessingTour(tourDesc);

        if (__toursMap.length > 0) {
            __currentTourIndex = 0;
        }
    };

    /*******************************TOUR RUNNER*********************************************/

    /**
     * Pre-process all information for all tours make sure each step and each tour contains necessary
     * information for subsequent steps
     * @param tourDesc      JSON description file that has all information needed
     */
    function _preProcessingTour(tourDesc) {
        let _tourDesc = {};
        __clone(_tourDesc, tourDesc);

        for (let i = 0; i < _tourDesc.length; i++) {
            let rawTour = _tourDesc[i];

            // Fill in information for each tour in case any important information is missing
            rawTour[constants.ID] = rawTour[constants.ID] || constants.TOUR + i;
            rawTour = __clone({}, constants.TOUR_DEFAULT_SETTINGS, rawTour);

            // Fill in information for each step in case anything important is missing
            let numOfSteps = rawTour[constants.STEPS].length;

            for (let i = 0; i < numOfSteps; i++) {
                let currentStep = rawTour[constants.STEPS][i];

                currentStep[constants.TYPE] = currentStep[constants.TYPE] || constants.DEFAULT_TYPE;
                currentStep[constants.POSITION] = currentStep[constants.POSITION] || constants.DEFAULT_POSITION;
                currentStep[constants.NO_BUTTONS] = currentStep[constants.NO_BUTTONS] || rawTour[constants.NO_BUTTONS];
                currentStep[constants.NO_NEXT] = currentStep[constants.NO_NEXT] || rawTour[constants.NO_NEXT];
                currentStep[constants.NO_BACK] = currentStep[constants.NO_BACK] || rawTour[constants.NO_BACK];
                currentStep[constants.NO_SKIP] = currentStep[constants.NO_SKIP] || rawTour[constants.NO_SKIP];
                currentStep[constants.NEXT_ON_TARGET] = currentStep[constants.NEXT_ON_TARGET] || false;
                currentStep[constants.CAN_INTERACT] = currentStep[constants.CAN_INTERACT] || currentStep[constants.NEXT_ON_TARGET] || rawTour[constants.CAN_INTERACT]; // This mean that if target can trigger next step on click, it must be clickable
            }

            __toursMap.push(rawTour);
        }
    }

    /**
     * This is the head quarter of displaying steps, overlay, and other things.
     * Tags: CENTRAL, ORGANIZER, RUNNER
     * @param stepDesc          Description object of current step to be run
     */
    function _centralOrganizer(stepDesc) {
        let targetElement = document.querySelector(stepDesc[constants.TARGET]);
        if (__isValid(targetElement)) {
            _addOverlaysAroundTarget(targetElement);
            _addBorderAroundTarget(targetElement, stepDesc[constants.CAN_INTERACT]);
            _addBubbleContent(stepDesc);
        } else {
            console.log("Target of step: " + JSON.stringify(stepDesc) + " is not found.");

        }
    }

    /**
     * Resolve and transition to the next tour available in the tour list
     * @param transition
     */
    function _transitionToNextTour(transition) {

    }

    /**
     * Create animation needed to transition between Steps, including forward and backward
     * @private
     */
    function _transtionBetweenStep() {

    }

    /**
     * Skip to the next Step.
     * TODO: Branching step is possible
     */
    function _skipStep() {

    }

    /**
     * Move to the previous step of the tour, including animation
     * @private
     */
    function _prevStep() {

    }

    /**
     * Move to the next step of the tour, including animation
     */
    function _nextStep() {

    }

    /**
     * Clean up everything in the tour.
     */
    function _exitTour() {

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
        let element = document.querySelector(target);
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
        let element = document.querySelector(target);
        return __isValid(element);
    }

    /*******************************ADD TOUR BUBBLE TO STEP*********************************/

    /**
     * Create a border around target by generating an overlay over target. The overlay can be clicked through only when the step can be interated or triggerable
     * @param element           Element of target of the step
     * @param canInteract     Boolean value to see if user can interact with the UI
     */
    function _addBorderAroundTarget(element, canInteract) {
        let borderWidth = 2;
        if (__isValid(element)) {
            let rect = element.getBoundingClientRect();

            let borderOverlay = document.createElement("div");
            borderOverlay.classList.add(constants.TARGET_BORDER);
            borderOverlay.setAttribute("style", "width: " + rect.width + borderWidth * 2 + "px; height: " + rect.height + borderWidth * 2 + "px; top: " + rect.top - borderWidth + "px; left: " + rect.left - borderWidth + "px;");

            if (canInteract) {
                borderOverlay.classList.add(constants.TARGET_INTERACTABLE);
            }

            document.body.appendChild(borderOverlay);
        }
    }

    /**
     * Add bubble contains content next to target depends on where it should be
     * @param stepDesc      Object contains info of current step
     */
    function _addBubbleContent(stepDesc) {
        let element = document.querySelector(_getClassName(constants.TARGET_BORDER));
        let targetPosition = element.getBoundingClientRect();
        let top = targetPosition.top;
        let left = targetPosition.left;
        let bottom = top + targetPosition.height;
        let right = left + targetPosition.width;

        let bubble = document.createElement("div");

        let iconDiv = document.createElement("div");
        iconDiv.classList.add(constants.ICON);

        bubble.appendChild(iconDiv);

        let contentDiv = document.createElement("p");
        contentDiv.innerText = stepDesc.content;

        bubble.classList.add(constants.TOUR_BUBBLE);

        switch (stepDesc.position) {
            case "top":
                bubble.classList.add("top");
                break;
            case "right":
                bubble.classList.add("right");
                break;
            case "left":
                bubble.classList.add("left");
                break;
            default: // This is either bottom or something that doesn't exist
                bubble.classList.add("bottom");
                break;
        }
        bubble.appendChild(contentDiv);

        if (!__isValid(stepDesc[constants.NEXT_ON_TARGET]) && !__isValid(stepDesc[constants.NO_BUTTONS])) {
            let buttonGroup = document.createElement("div");
            buttonGroup.classList.add(constants.BUTTON_GROUP);

            if (!__isValid(stepDesc[constants.NO_SKIP])) {
                let skipButton = document.createElement("button");
                skipButton.classList.add(constants.SKIP_BUTTON);
                __addEvent(skipButton, constants.FLEX_CLICK, function (event) {
                    _noDefault(event);
                    _skipStep();
                });
                buttonGroup.appendChild(skipButton);
            }

            if (!__isValid(stepDesc[constants.NO_BACK])) {
                let backButton = document.createElement("button");
                backButton.classList.add(constants.BACK_BUTTON);
                __addEvent(backButton, constants.FLEX_CLICK, function (event) {
                    _noDefault(event);
                    _prevStep();
                });
                buttonGroup.appendChild(backButton);
            }

            if (!__isValid(stepDesc[constants.NO_NEXT]) && !_isLastStep()) {
                // Unlikely to be used
                let nextButton = document.createElement("button");
                nextButton.classList.add(constants.NEXT_BUTTON);
                __addEvent(nextButton, constants.FLEX_CLICK, function (event) {
                    _noDefault(event);
                    _nextStep();
                });
                buttonGroup.appendChild(nextButton);
            }

            if (_isLastStep()) {
                let doneButton = document.createElement("button");
                doneButton.classList.add(constants.DONE_BUTTON);
                __addEvent(doneButton, constants.FLEX_CLICK, function (event) {
                    _noDefault(event);
                    _exitTour();
                });
            }
            bubble.appendChild(buttonGroup);
        }

        let closeButton = document.createElement("a");
        closeButton.appendChild(document.createTextNode(constants.EMPTY));
        closeButton.classList.add(constants.CLOSE_TOUR);

        bubble.appendChild(closeButton);

        document.body.appendChild(bubble);
    }


    /*******************************ADD OVERLAY BLOCKS*************************************/

    /**
     * Add top overlay into document body
     * @param elementRect    Bounding Rect around target element
     */
    function _addTopOverlay(elementRect) {
        let height = elementRect.top;
        let width = document.body.getBoundingClientRect().width;

        // Put overlay on top left of the screen
        __generateOverlay(width, height, 0, 0);
    }

    /**
     * Add Right overlay next to target element
     * @param elementRect    Bounding Rect around target element
     */
    function _addRightOverlay(elementRect) {
        let height = elementRect.height;
        let width = document.body.getBoundingClientRect().width - elementRect.left - elementRect.width;

        // Put overlay on the top right of the target element
        __generateOverlay(width, height, height, elementRect.left + elementRect.width);
    }

    /**
     * Generate Bottom overlay element
     * @param elementRect       Bounding Rect around target element
     */
    function _addBottomOverlay(elementRect) {
        let height = document.body.getBoundingClientRect().height - elementRect.top - elementRect.height;
        let width = document.body.getBoundingClientRect().width;

        // Put over on the bottom of target element
        __generateOverlay(width, height, elementRect.top + elementRect.height, 0);
    }

    /**
     * Generate Left overlay element
     * @param elementRect       Bounding Rect around target element
     * @private
     */
    function _addLeftOverlay(elementRect) {
        let height = elementRect.height;
        let width = elementRect.left;

        // Put overlay over space on the left of target
        __generateOverlay(width, height. height, 0);
    }

    /**
     * Generate generic overlay from given width, height, top and left
     * @param width     The width of current overlay
     * @param height    The height of current overlay
     * @param top       Top location of current overlay
     * @param left      Left location of current overlay
     */
    function __generateOverlay(width, height, top, left) {
        let overlay = document.createElement("div");
        overlay.classList.add(constants.OVERLAY_STYLE);
        overlay.width = width;
        overlay.height = height;
        overlay.top = top;
        overlay.left = left;

        document.body.appendChild(overlay);
    }

    /**
     * Main function to add overlay around target: top right bottom left like padding settings
     * @param element        Target element which is used to put overlays around
     */
    function _addOverlaysAroundTarget(element) {
        let elementRect = element.getBoundingClientRect();
        _addTopOverlay(elementRect);
        _addRightOverlay(elementRect);
        _addBottomOverlay(elementRect);
        _addLeftOverlay(elementRect);
    }

    /*******************************TEAR DOWN*********************************************/

    /**
     * Remove the overlay on top of the target
     * @private topOverlay contains the DOM element of top overlay
     */
    function _removeTopOverlay() {
        let topOverlay = document.querySelector(_getClassName(constants.TOP_OVERLAY));
        if(__isValid(topOverlay))
            topOverlay.parentNode.removeChild(topOverlay);
    }

    /**
     * Remove the overlay on the right of the target
     * @private rightOverlay contains the DOM element of right overlay
     */
    function _removeRightOverlay() {
        let rightOverlay = document.querySelector(_getClassName(constants.RIGHT_OVERLAY));
        if(__isValid(rightOverlay))
            rightOverlay.parentNode.removeChild(rightOverlay);
    }

    /**
     * Remove the overlay on the bottom of the target
     * @private bottomOverlay contains the DOM element of bottom overlay
     */
    function _removeBottomOverlay() {
        let bottomOverlay = document.querySelector(_getClassName(constants.BOTTOM_OVERLAY));
        if(__isValid(bottomOverlay))
            bottomOverlay.parentNode.removeChild(bottomOverlay);
    }

    /**
     * Remove the overlay on the left of the target
     * @private leftOverlay contains the DOM element of the left overlay
     */
    function _removeLeftOverlay() {
        let leftOverlay = document.querySelector(_getClassName(constants.LEFT_OVERLAY));
        if(__isValid(leftOverlay))
            leftOverlay.parentNode.removeChild(leftOverlay);
    }

    /**
     * Remove the border around target
     * @private targetBorder contains the DOM element of border around target
     */
    function _removeBorder() {
        let targetBorder = document.querySelector(_getClassName(constants.TARGET_BORDER));
        if(__isValid(targetBorder))
            targetBorder.parentNode.removeChild(targetBorder);
    }

    /**
     * Remove the actual tour bubble that display the content
     * @private tourBubble contains the DOM element of the bubble display step description
     */
    function _removeTourBubble() {
        let tourBubble = document.querySelector(_getClassName(constants.TOUR_BUBBLE));
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


    /*******************************UTILITIES**********************************************/

    /**
     * Deep extending object from object A to object B
     * __clone({},A,B) Exactly how it works in Jquery
     * @param output        New Object that contains merge of A and B
     * @returns {*|{}}      Return new object
     */
    function __clone(output) {
        output = output || {};

        for (let i = 1; i < arguments.length; i++) {
            let obj = arguments[i];

            if (!__isValid(obj))
                continue;

            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object') {
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
     * @param object        Any object, array, letiable
     * @returns {boolean}   True if valid, false otherwise
     */
    function __isValid(object) {
        return (object == null || typeof object == 'undefined');
    }

    /**
     * Get the content of the next tour based on the given tourId
     * @param tourId        The id of tour that needs to be looked up
     * @returns Return the content of tour if it matches tourId, return null otherwise
     */
    function _getTourFromId(tourId) {
        for (let i = 0; i < __toursMap.length; i++) {
            if (__toursMap[i].id === tourId) {
                return __toursMap[i];
            }
        }

        return null;
    }

    /**
     * Get the next tour in line. Only used when there multiple tours given at the beginning
     * @returns     If there isn't any tour return nothing, otherwise return subsequent tour
     */
    function __getNextTourInLine() {
        if (__toursMap.length - 1 > __currentTourIndex) {
            let newTourIndex = __currentTourIndex + 1;

            __currentTourIndex = newTourIndex;

            return __toursMap[newTourIndex];
        }
    }

    /**
     * Add event to element without unnecessarily overrid original handlers
     * @param el        Element to be attached listener/event on
     * @param type      Type of event to listen to
     * @param callback  Callback function when event is fired
     */
    function __addEvent(el, type, callback) {
        if (!__isValid(el))
            return;
        if (el.addEventListener) {
            el.addEventListener(type, callback, false);
        } else if (el.attachEvent) {
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
        if (!__isValid(el))
            return;
        if (el.removeEventListener) {
            el.removeEventListener(type, callback);
        } else if (el.detachEvent) {
            el.detachEvent(type, callback);
        } else {
            el["off" + type] = callback;
        }
    }

    /**
     * Add window resize event to recalculate location of tour step.
     * The event is namespaced to avoid conflict with program's handler and easier to unbind later on.
     */
    function _addResizeWindowListener() {
        __addEvent(window, constants.FLEX_RESIZE, function (event) {
            console.log("Doing resizing window event");
        });
    }

    /**
     * Remove resize listener from window without detaching other handlers from main program
     */
    function _unbindResizeWindowListener() {
        __removeEvent(window, constants.FLEX_RESIZE);
    }

    /**
     * Prevent event to propagate and behave by default. Generally used for click event
     * @param event     The event to be stopped default behavior
     */
    function _noDefault(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Check if the current step is the last step
     * @return {boolean} true if it is, false otherwise
     */
    function _isLastStep() {
        return (__currentStep >= __currentTour[constants.STEPS].length - 1);
    }

    /**
     * Simple function to create Class Name selector from give html class
     * @param className     class name of give DOM element
     * @returns {*}     .className for query selector
     */
    function _getClassName(className) {
        return constants.CLASS + className;
    }

    /***********************************FLEX TOUR OBJECT******************************/

    let flexTour = function (tourDesc) {

    };

    flexTour.fn = flexTour.prototype = {

    };

    exports.flexTour = flexTour;
    return flexTour;
}));