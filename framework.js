/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

var FlexTour =
    /******/ (function (modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/
    var installedModules = {};

    /******/ 	// The require function
    /******/
    function __webpack_require__(moduleId) {

        /******/ 		// Check if module is in cache
        /******/
        if (installedModules[moduleId])
        /******/            return installedModules[moduleId].exports;

        /******/ 		// Create a new module (and put it into the cache)
        /******/
        var module = installedModules[moduleId] = {
            /******/            exports: {},
            /******/            id: moduleId,
            /******/            loaded: false
            /******/
        };

        /******/ 		// Execute the module function
        /******/
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        /******/ 		// Flag the module as loaded
        /******/
        module.loaded = true;

        /******/ 		// Return the exports of the module
        /******/
        return module.exports;
        /******/
    }


    /******/ 	// expose the modules object (__webpack_modules__)
    /******/
    __webpack_require__.m = modules;

    /******/ 	// expose the module cache
    /******/
    __webpack_require__.c = installedModules;

    /******/ 	// __webpack_public_path__
    /******/
    __webpack_require__.p = "";

    /******/ 	// Load entry module and return exports
    /******/
    return __webpack_require__(0);
    /******/
})
/************************************************************************/
/******/([
    /* 0 */
    /***/ function (module, exports, __webpack_require__) {

        /*******************************************************************************
         * Copyright (c) 2016. MIT License.
         * NhatHo-nhatminhhoca@gmail.com
         ******************************************************************************/

        let Components = __webpack_require__(1);
        let Constants = __webpack_require__(2);
        let Utils = __webpack_require__(3);

        /**
         * Pre-process all information for all tours make sure each step and each tour contains necessary
         * information for subsequent steps
         * @param tourDesc      JSON description file that has all information needed
         */
        function _preprocessingTours(tourDesc) {
            if (Array.isArray(tourDesc)) {
                for (let i = 0; i < tourDesc.length; i++) {
                    _initializeTour(tourDesc[i]);
                }
            } else {
                _initializeTour(tourDesc);
            }
        }

        /**
         * Initialize raw tour object to make it legal for the framework
         * @param tour      The tour object ---> Must be an object
         */
        function _initializeTour(tour) {
            let rawTour = Utils.clone({}, tour);
            // Fill in information for each tour in case any important information is missing
            rawTour[Constants.ID] = rawTour[Constants.ID] || Constants.TOUR + i;
            rawTour = Utils.clone({}, Constants.TOUR_DEFAULT_SETTINGS, rawTour);

            // Fill in information for each step in case anything important is missing
            let numOfSteps = rawTour[Constants.STEPS].length;

            for (let i = 0; i < numOfSteps; i++) {
                let currentStep = rawTour[Constants.STEPS][i];

                currentStep[Constants.TYPE] = currentStep[Constants.TYPE] || Constants.DEFAULT_TYPE;
                currentStep[Constants.POSITION] = currentStep[Constants.POSITION] || Constants.DEFAULT_POSITION;
                currentStep[Constants.NO_BUTTONS] = currentStep[Constants.NO_BUTTONS] || rawTour[Constants.NO_BUTTONS];
                currentStep[Constants.DELAY] = currentStep[Constants.DELAY] || rawTour[Constants.DELAY];
                currentStep[Constants.NO_BACK] = currentStep[Constants.NO_BACK] || rawTour[Constants.NO_BACK];
                currentStep[Constants.NO_SKIP] = currentStep[Constants.NO_SKIP] || rawTour[Constants.NO_SKIP];
                currentStep[Constants.CAN_INTERACT] = currentStep[Constants.CAN_INTERACT] || currentStep[Constants.NEXT_ON_TARGET] || rawTour[Constants.CAN_INTERACT]; // This mean that if target can trigger next step on click, it must be clickable
                currentStep[Constants.WAIT_INTERVALS] = currentStep[Constants.WAIT_INTERVALS] || rawTour[Constants.WAIT_INTERVALS];
                currentStep[Constants.RETRIES] = currentStep[Constants.RETRIES] || rawTour[Constants.RETRIES];
            }
            FlexTour.toursMap.push(rawTour);
        }

        /**
         * This is the head quarter of displaying steps, overlay, and other things.
         * Tags: CENTRAL, ORGANIZER, RUNNER
         * @param stepDesc          Description object of current step to be run
         */
        function _centralOrganizer(stepDesc) {
            FlexTour.Component = new Components(stepDesc);
            let currentStepNumber = FlexTour.currentStepNumber;

            if (Utils.isValid(FlexTour.Component)) {
                let showSkip = false,
                    showBack = false,
                    showNext = false,
                    disableNext = false,
                    noButtons = false;

                // When the current step has NextOnTarget flag set, assuming that this step setup prerequisite for next step
                // Which means that user cannot click Next, or Skip.

                if (stepDesc[Constants.NO_BUTTONS] || Utils.isFloatStep(stepDesc)) {
                    noButtons = true;
                }

                let numberOfStep = FlexTour.currentTour[Constants.STEPS].length;

                if (currentStepNumber < numberOfStep - 1) {
                    showNext = true;
                }

                if (currentStepNumber < numberOfStep - 2 && !stepDesc[Constants.NEXT_ON_TARGET] && !stepDesc[Constants.NO_SKIP]) {
                    showSkip = true;
                }
                if (stepDesc[Constants.NEXT_ON_TARGET]) {
                    disableNext = true;
                }

                if (currentStepNumber > 0 && !stepDesc[Constants.NO_BACK]) {
                    showBack = true;
                }

                /**
                 * Create components can be only called once when the tour start for the first time.
                 */
                if (!FlexTour.running) {
                    FlexTour.Component.createComponents(noButtons, showSkip, showBack, showNext, disableNext);
                    FlexTour.running = true;
                } else {
                    FlexTour.Component.modifyComponents(noButtons, showSkip, showBack, showNext, disableNext);
                }

                _addClickEvents();
                _addResizeWindowListener();

                if (stepDesc[Constants.TRANSITION] && _isAllowToMove(currentStepNumber + 1, 0)) {
                    console.log("Inside transition step.");
                    _transitionToNextStep(currentStepNumber + 1);
                }
            } else {
                console.log("Target of step: " + JSON.stringify(stepDesc) + " is not found.");
            }
        }

        /**
         * Attached all necessary handlers to the elements
         */
        function _addClickEvents() {
            Utils.getElementsAndAttachEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK, _exit);

            Utils.getElementsAndAttachEvent(Constants.SKIP_BUTTON, Constants.FLEX_CLICK, _skipStep);

            Utils.getElementsAndAttachEvent(Constants.BACK_BUTTON, Constants.FLEX_CLICK, _previousStep);

            Utils.getElementsAndAttachEvent(Constants.NEXT_BUTTON, Constants.FLEX_CLICK, _nextStep);

            Utils.getElementsAndAttachEvent(Constants.DONE_BUTTON, Constants.FLEX_CLICK, _exit);

            Utils.getElementsAndAttachEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK, _exit);

            let currentStep = FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber];
            if (currentStep[Constants.NEXT_ON_TARGET]) {
                let currentTarget = document.querySelector(currentStep[Constants.TARGET]);
                if (Utils.isValid(currentTarget)) {
                    Utils.addEvent(currentTarget, Constants.FLEX_CLICK, _nextStep);
                }
            }
        }

        /**
         * Remove all attached event to avoid leaking memories
         */
        function _removeEvents() {
            Utils.removeELementsAndAttachedEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK, _exit);

            Utils.removeELementsAndAttachedEvent(Constants.SKIP_BUTTON, Constants.FLEX_CLICK, _skipStep);

            Utils.removeELementsAndAttachedEvent(Constants.BACK_BUTTON, Constants.FLEX_CLICK, _previousStep);

            Utils.removeELementsAndAttachedEvent(Constants.NEXT_BUTTON, Constants.FLEX_CLICK, _nextStep);

            Utils.removeELementsAndAttachedEvent(Constants.DONE_BUTTON, Constants.FLEX_CLICK, _exit);

            Utils.removeELementsAndAttachedEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK, _exit);

            let currentStep = FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber];
            if (currentStep[Constants.NEXT_ON_TARGET]) {
                let currentTarget = document.querySelector(currentStep[Constants.TARGET]);
                if (Utils.isValid(currentTarget)) {
                    Utils.removeEvent(currentTarget, Constants.FLEX_CLICK, _nextStep);
                }
            }
        }

        /**
         * THIS PART RIGHT HERE IS WHAT MAKE FLEXTOUR DIFFERENT FROM OTHER ENGINES.
         *
         *
         * IMPORTANT: It's the developer job to know if the previous step can be reached. If the previous step should not be REACHED, set "noBack: true" in step description. Samething for SKIP Button.
         * Check if the next, previous or skip step is allowed to be executed.
         * The prerequisites array can contain up to 3 types:
         *  -- Prerequisite functions: regular function name. I.e: "getInputString", etc.
         *  -- Wait Conditions: Start with "?" and use ":" to separate DOM element from function nanme. i.e: ?isVisible:#target1", etc.
         *  -- Skip Condition: Start with "!" and follow with function name. i.e: "!checkWhateverYouWant", etc.
         * In order for the transition to happen, all functions in prerequisites must return true. The result of each one will be ANDed together.
         *
         * Whenever a prerequisite function return false, the whole thing will return false.
         *
         * When a Wait Condition return false, it will schedule and execute the function again after a waitInterval. If you want to make sure several DOM elements should be waited for, use Comma separator to indicate. When number of retries = 0 it will go to the next prerequsite. If the next prerequisite doesn't exist then it will return false. Ideally there should be only 1 Wait Condition in the list. So you should check everything in this 1 function. If you want to use isVisible, doesExist condition and your own condition, set Retries entry in the tour so it will be reset to that.
         *
         * When a skip condition should be the last one in the list, this is a fail safe measurement for small branching method. In this function you should check if the next step or 2 step from now should be skipped. However, it's developer job to make sure that the step after skipped should be available, otherwise the engine will stop.
         *
         * NOTE: Each prerequisite will be executed in turn. Except for in waitCondition, which will stay until retries reaches 0 then proceeds to the next prerequisite.
         *
         * @param possibleStepNumber    Step number to be checked for conditions. This is the future step, could be next 2 steps ahead.
         * @param currPrerequisite      Counter to signal which condition where are checking right now.
         * @returns {boolean}   True will let the transition happens, false will make it stay at the current step until the conditions are met
         */
        function _isAllowToMove(possibleStepNumber, currPrerequisite) {
            let prerequisites = FlexTour.currentTour[Constants.STEPS][possibleStepNumber][Constants.PREREQUISITES];
            let possibleStep = FlexTour.currentTour[Constants.STEPS][possibleStepNumber];
            if (Utils.isValid(prerequisites) && currPrerequisite < prerequisites.length) {
                let prerequisite = prerequisites[currPrerequisite].trim();
                if (prerequisite.indexOf(Constants.WAIT) > -1) {
                    let prerequisiteBlock = prerequisite.split(Constants.WAIT)[1].trim();

                    let temporaryResult = _executePrerequisiteCondition(possibleStep, prerequisiteBlock);

                    if (!temporaryResult) {
                        if (possibleStep[Constants.RETRIES] === 0) {
                            // Reset the retries entry for current step, only works if Retries is set on Tour Description
                            if (FlexTour.currentTour.hasOwnProperty(Constants.RETRIES)) {
                                possibleStep[Constants.RETRIES] = FlexTour.currentTour[Constants.RETRIES];
                            }
                            return temporaryResult; // Return false when retries reaches 0;
                        } else {
                            possibleStep[Constants.RETRIES]--;
                            // Retry the the waitFor after certain time invertal
                            setTimeout(function () {
                                if (_isAllowToMove(possibleStepNumber, currPrerequisite)) {
                                    // Proceed to next one when this is waitFor is met. Of course this will require the next conditions are also successful
                                    _transitionToNextStep(possibleStepNumber);
                                }
                            }, possibleStep[Constants.WAIT_INTERVALS]);
                        }
                    } else {
                        // Reset the retries entry for current step, only works if Retries is set on Tour Description
                        if (FlexTour.currentTour.hasOwnProperty(Constants.RETRIES)) {
                            possibleStep[Constants.RETRIES] = FlexTour.currentTour[Constants.RETRIES];
                        }
                        // Move to the next prerequisite when the Wait for condition is met.
                        return _isAllowToMove(possibleStepNumber, ++currPrerequisite);
                    }
                } else if (prerequisite.indexOf(Constants.SKIP) > -1) {
                    /**
                     * The syntax is: "!funcName:params". For sure the 2nd element after split is funcName
                     * IMPORTANT: as mentioned before, this should be the last on the list. When this is true it will autmatically increment the FlexTour.currentStepNumber to 2 steps ahead which effectively skip the current possible step.
                     * This might be hard to wrap your head around. Skip function has to return false for the step to be skipped, if it return true, the proceed to that next step. So in order for you to skip the step, your custom function must return false.
                     * REASONING: Treat this as a prerequisite, the condition must be met (true) for the tour to flow normally, if the condition is NOT met (false), the tour will skipped the step as indicated. Works well with isVisible, and doesExist. These will check the condition, if condition is true then stay. If condition is false then skip.
                     */

                    let prerequisiteBlock = prerequisite.split(Constants.SKIP)[1].trim();

                    if (!_executePrerequisiteCondition(possibleStep, prerequisiteBlock)) {
                        if (possibleStepNumber > FlexTour.currentStepNumber) {
                            // If the tour is going forward then skip it forward
                            _transitionToNextStep(possibleStepNumber + 1);
                        } else {
                            // If the tour is going backward then skip it backward
                            _transitionToNextStep(possibleStepNumber - 1);
                        }
                        // At this point the step will be skipped. Return false so the potential step will not be rendered.
                        return false;
                    }
                    return true;
                } else {
                    // This is the regular prerequisite function
                    if (Utils.executeFunctionWithName(prerequisite, FlexTour.actionsList)) {
                        return _isAllowToMove(possibleStepNumber, ++currPrerequisite);
                    }
                    // Return false immediately if the result is false. The prerequisite condition is not met
                    return false;
                }
            } else {
                // Return true if nobody sets prerequisite
                // Base case, this is when it get to the last condition without failure
                return true;
            }
        }

        /**
         * Execute block where wait condition and skip condition. Split things up to condition name and parameters.
         * Execute them accordingly. Either isVisible, doesExist (built-in) functions or custom functions
         * @param stepDesc      Description of the step
         * @param prerequisite  The prerequisite block after removing ! and ? from it.
         */
        function _executePrerequisiteCondition(stepDesc, prerequisite) {
            // This is the most complex one in all. There are 3 parts to waitFor: "?condName:el1,el2,el3"
            // First split the COLON Separator.
            let tokens = prerequisite.split(Constants.COLON);

            // Split "condName" must be in the 1st slot after splitting at colon
            let condName = tokens[0];

            let temporaryResult = true;

            if (tokens.length > 1) {
                // Split the DOM elements list if exist "el1,el2,el3".
                let elementsList = tokens[1].split(Constants.COMMA);

                let indexOfCurrentTarget = elementsList.indexOf(Constants.CURRENT_TARGET);
                if (indexOfCurrentTarget !== -1) {
                    elementsList[indexOfCurrentTarget] = stepDesc[Constants.TARGET];
                }

                if (condName === Constants.IS_VISIBLE) {
                    temporaryResult = temporaryResult && Utils.isVisible(elementsList);
                } else if (condName === Constants.DOES_EXIST) {
                    temporaryResult = temporaryResult && Utils.doesExist(elementsList);
                } else {
                    // When the condition name is not built-in, pass the array of element into the customized functions.
                    if (typeof FlexTour.actionsList[condName] === "function") {
                        temporaryResult = temporaryResult && FlexTour.actionsList[condName].apply(this, elementsList);
                    }
                }
            } else {
                return Utils.executeFunctionWithName(condName, FlexTour.actionsList);
            }

            return temporaryResult;
        }

        /**
         * Skip the next step to the next next step.
         */
        function _skipStep() {
            if (_isAllowToMove(FlexTour.currentStepNumber + 2, 0)) {
                _transitionToNextStep(FlexTour.currentStepNumber + 2);
            }
        }

        /**
         * Decrement current step counter and go back to previous step ... Obviously it will not be the last step
         */
        function _previousStep() {
            if (_isAllowToMove(FlexTour.currentStepNumber - 1, 0)) {
                _transitionToNextStep(FlexTour.currentStepNumber - 1);
            }
        }

        /**
         * Trigger next step of the tour. If the next step is the last step, trigger the isLastStep flag
         */
        function _nextStep() {
            if (_isAllowToMove(FlexTour.currentStepNumber + 1, 0)) {
                _transitionToNextStep(FlexTour.currentStepNumber + 1);
            }
        }

        /**
         * Common factor for transition step, either skip, previous or next.
         * @param stepNumber
         */
        function _transitionToNextStep(stepNumber) {
            let stepDelay = FlexTour.currentTour[Constants.STEPS][stepNumber][Constants.DELAY];

            function __transitionFunction(stepNumber) {
                FlexTour.currentStepNumber = stepNumber;
                _centralOrganizer(FlexTour.currentTour[Constants.STEPS][stepNumber]);
            }

            if (Utils.isValid(stepDelay)) {
                console.log("Trigger after delay.");
                setTimeout(__transitionFunction.bind(this, stepNumber), stepDelay);
            } else {
                __transitionFunction(stepNumber);
            }
        }

        /**
         * Add window resize event to recalculate location of tour step.
         * The event is namespaced to avoid conflict with program's handler and easier to unbind later on.
         * This event is only trigger once every 1/2 second. So that it won't go crazy and trigger too many event on resizing
         */
        function _addResizeWindowListener() {
            Utils.addEvent(window, Constants.FLEX_RESIZE, Utils.debounce(function () {
                _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber]);
            }, 500, false));
        }

        /**
         * Remove resize listener from window without detaching other handlers from main program
         */
        function _unbindResizeWindowListener() {
            Utils.removeEvent(window, Constants.FLEX_RESIZE);
        }

        function _exit() {
            _removeEvents();
            _unbindResizeWindowListener();

            FlexTour.Component.removeComponents();
            FlexTour.running = false; // Reset this flag when users quit the tour
        }

        /**
         * Constructor of the whole thing.
         * @param tourDesc      The JSON file that describe what the tours should be like
         * @param actionsList   The object contains all functions that control the flow of the tours
         * @constructor
         */
        function FlexTour(tourDesc, actionsList) {
            FlexTour.toursMap = [];
            FlexTour.currentTourIndex = 0;
            FlexTour.currentStepNumber = 0;
            FlexTour.currentTour = {};
            FlexTour.actionsList = actionsList;
            FlexTour.running = false; // A flag that let the system know that a tour is being run
            _preprocessingTours(tourDesc);
        }

        /**
         * Run the first step of the tour
         */
        FlexTour.prototype.run = function () {
            if (FlexTour.toursMap.length === 0) {
                console.log("There is NOT any available tour to run.");
                return;
            }

            FlexTour.currentTour = Utils.clone({}, FlexTour.toursMap[FlexTour.currentTourIndex]);
            FlexTour.currentStepNumber = 0;

            let steps = FlexTour.currentTour[Constants.STEPS];
            if (Utils.isValid(steps)) {
                let firstStep = steps[FlexTour.currentStepNumber];
                _centralOrganizer(firstStep);
            }
        };

        FlexTour.prototype.exit = function () {
            _exit();
        };

        module.exports = FlexTour;

        /***/
    },
    /* 1 */
    /***/ function (module, exports, __webpack_require__) {

        /*******************************************************************************
         * Copyright (c) 2016. MIT License.
         * NhatHo-nhatminhhoca@gmail.com
         ******************************************************************************/

        var Constants = __webpack_require__(2);
        var Utils = __webpack_require__(3);

        function Components(stepDescription) {
            Components.stepDescription = Utils.clone({}, stepDescription);
            Components.ui = document.createElement("div");
            Components.ui.classList.add(Constants.FLEXTOUR);
            if (Utils.isStepWithTarget(stepDescription)) {
                Components.rect = document.querySelector(stepDescription[Constants.TARGET]).getBoundingClientRect();
            }
        }

        /**
         * Add top overlay into document body
         */
        function _getTopOverlay() {
            return {
                width: Utils.getFullWindowWidth() + Constants.PX,
                height: Components.rect.top + Constants.PX,
                top: 0,
                left: 0
            };
        }

        /**
         * Generate Bottom overlay rect
         */
        function _getBottomOverlay() {
            return {
                width: Utils.getFullWindowWidth() + Constants.PX,
                height: Utils.getFullWindowHeight() - Components.rect.bottom + Constants.PX,
                top: Components.rect.bottom + Constants.PX,
                left: 0
            };
        }

        /**
         * Generate Left overlay rect
         */
        function _getLeftOverlay() {
            // Put overlay over space on the left of target
            return {
                width: Components.rect.left + Constants.PX,
                height: Components.rect.height + Constants.PX,
                top: Components.rect.top + Constants.PX,
                left: 0
            };
        }

        /**
         * Add Right overlay next to target rect
         */
        function _getRightOverlay() {
            return {
                width: Utils.getFullWindowWidth() - Components.rect.right + Constants.PX,
                height: Components.rect.height + Constants.PX,
                top: Components.rect.top + Constants.PX,
                left: Components.rect.right + Constants.PX
            };
        }

        /**
         * Generate generic overlay from given width, height, top and left
         * @param locationObj     Object that contains width, height, top and left attributes for overlay
         */
        function _createOverlayNode(locationObj) {
            let overlay = document.createElement("div");
            overlay.classList.add(Constants.OVERLAY_STYLE);
            overlay.style.width = locationObj.width;
            overlay.style.height = locationObj.height;
            overlay.style.top = locationObj.top;
            overlay.style.left = locationObj.left;

            Components.ui.appendChild(overlay);
        }

        /**
         * Add all overlays around target for better visual
         * Keep the same pattern as the padding. Top->Right->Bottom->Left
         */
        function _addOverlays() {
            _createOverlayNode(_getTopOverlay());
            _createOverlayNode(_getRightOverlay());
            _createOverlayNode(_getBottomOverlay());
            _createOverlayNode(_getLeftOverlay());
        }

        /**
         * Modify the current DOM Node to the new location, this will help with transition animation
         * @param domNode       The DOM Node of current lement
         * @param locationObj   The object contains the width, height, top and left of the destination
         */
        function _modifyOverlayNode(domNode, locationObj) {
            domNode.style.width = locationObj.width;
            domNode.style.height = locationObj.height;
            domNode.style.top = locationObj.top;
            domNode.style.left = locationObj.left;
        }

        /**
         * This function assumes that there are 4 different overlays around the target to modify for the transition.
         */
        function _modifyOverlays() {
            let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
            if (Utils.isValid(overlays) && overlays.length === 4) {
                _modifyOverlayNode(overlays[0], _getTopOverlay());
                _modifyOverlayNode(overlays[1], _getRightOverlay());
                _modifyOverlayNode(overlays[2], _getBottomOverlay());
                _modifyOverlayNode(overlays[3], _getLeftOverlay());
            } else {
                for (let i = 0; i < overlays.length; i++) {
                    Components.ui.removeChild(overlays[i]);
                    _addOverlays();
                }
            }
        }

        /**
         * This function is used for floating step which doesn't have a target and the bubble float in the middle of the screen.
         * Check if already there is a UNIQUE Overlay in the DOM, if yes don't do anyway, if not create 1 and add to the DOM
         */
        function _addOverlay() {
            let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
            if (Utils.isValid(overlays)) {
                if (overlays.length !== 1) {
                    for (let i = 0; i < overlays.length; i++) {
                        Components.ui.removeChild(overlays[i]);
                    }
                    _createOverlayNode({
                        width: "100%",
                        height: "100%",
                        top: 0,
                        left: 0
                    });
                }
            }

        }

        /**
         * Create content bubble next to target to display the content of the step
         * @param {boolean} noButtons  True will hide all buttons
         * @param {boolean} showSkip  True to show skip button
         * @param {boolean} showBack  True to show Back Button
         * @param {boolean} showNext  True to show Next Button, False to show Done Button
         * @param {boolean} disableNext  True to disable either Next or Done button
         */
        function _createContentBubble(noButtons, showSkip, showBack, showNext, disableNext) {
            let bubble = document.createElement("div");
            bubble.classList.add(Constants.TOUR_BUBBLE);

            let iconDiv = document.createElement("div");
            iconDiv.classList.add(Constants.ICON_STYLE, _getIconType());
            bubble.appendChild(iconDiv);

            let contentBlock = document.createElement("div");
            contentBlock.classList.add(Constants.BUBBLE_CONTENT);

            if (Utils.isValid(Components.stepDescription[Constants.TITLE])) {
                let contentTitle = document.createElement("div");
                contentTitle.innerText = Components.stepDescription[Constants.TITLE];
                contentTitle.classList.add(Constants.BUBBLE_TITLE);
                contentBlock.appendChild(contentTitle);
            }

            let contentBody = document.createElement("div");
            contentBody.innerText = Components.stepDescription[Constants.CONTENT];
            contentBody.classList.add(Constants.BUBBLE_CONTENT_BODY);
            contentBlock.appendChild(contentBody);

            bubble.appendChild(contentBlock);

            if (!noButtons) {
                let buttonGroup = document.createElement("div");
                buttonGroup.classList.add(Constants.BUTTON_GROUP);

                let skipButton = document.createElement("button");
                skipButton.classList.add(Constants.SKIP_BUTTON);
                skipButton.innerHTML = Constants.SKIP_TEXT;
                skipButton.disabled = !showSkip;

                buttonGroup.appendChild(skipButton);

                let backButton = document.createElement("button");
                backButton.classList.add(Constants.BACK_BUTTON);
                backButton.innerHTML = Constants.BACK_TEXT;
                backButton.disabled = !showBack;

                buttonGroup.appendChild(backButton);


                if (showNext) {
                    let nextButton = document.createElement("button");
                    nextButton.classList.add(Constants.NEXT_BUTTON);
                    nextButton.innerHTML = Constants.NEXT_TEXT;

                    nextButton.disabled = disableNext;

                    buttonGroup.appendChild(nextButton);
                } else {
                    let doneButton = document.createElement("button");
                    doneButton.classList.add(Constants.DONE_BUTTON);
                    doneButton.innerHTML = Constants.DONE_TEXT;

                    doneButton.disabled = disableNext;

                    buttonGroup.appendChild(doneButton);
                }

                bubble.appendChild(buttonGroup);
            }

            let closeButton = document.createElement("a");
            closeButton.innerHTML = Constants.TIMES;
            closeButton.classList.add(Constants.CLOSE_TOUR);

            bubble.appendChild(closeButton);

            Components.ui.appendChild(bubble);
        }

        /**
         * Return the appropriate icon for the step.
         * @returns {*}     String that describe the class that should represent the icon
         */
        function _getIconType() {
            let currentStepType = Components.stepDescription[Constants.TYPE];
            if (Components.stepDescription[Constants.TRANSITION]) {
                return Constants.LOADING_ICON;
            } else if (currentStepType === Constants.ACTION_TYPE) {
                return Constants.ACTION_ICON;
            } else if (currentStepType === Constants.DEFAULT_TYPE) {
                return Constants.DEFAULT_ICON;
            }
            return "";
        }

        /**
         * Modify the content bubble location. Get the current bubble and change everything in it.
         * @param {boolean} noButtons  True will hide all buttons
         * @param {boolean} showSkip  True to show skip button
         * @param {boolean} showBack  True to show Back Button
         * @param {boolean} showNext  True to show Next Button, False to show Done Button
         * @param {boolean} disableNext  True to disable either Next or Done button
         */
        function _modifyContentBubble(noButtons, showSkip, showBack, showNext, disableNext) {
            /*
             * First block try to modify the icon in the bubble
             */
            let currentIconType = _getIconType();
            let currentIcon = Utils.getEleFromClassName(Constants.ICON_STYLE);
            if (!currentIcon.classList.contains(currentIconType)) {
                for (let i = 0; i < currentIcon.classList.length; i++) {
                    if (currentIcon.classList.item(i).indexOf(Constants.ICON_REGEXP) > -1) {
                        currentIcon.classList.remove(currentIcon.classList.item(i));
                    }
                }
                currentIcon.classList.add(currentIconType);
            }

            /*
             * Modify title of the bubble to the new one
             */
            let contentBlock = Utils.getEleFromClassName(Constants.BUBBLE_CONTENT);
            let contentTitle = Utils.getEleFromClassName(Constants.BUBBLE_TITLE);
            if (Utils.isValid(Components.stepDescription[Constants.TITLE])) {
                if (Utils.isValid(contentTitle)) {
                    contentTitle.innerText = Components.stepDescription[Constants.TITLE];
                } else {
                    let contentTitle = document.createElement("div");
                    contentTitle.innerText = Components.stepDescription[Constants.TITLE];
                    contentTitle.classList.add(Constants.BUBBLE_TITLE);
                    contentBlock.insertBefore(contentTitle, Utils.getEleFromClassName(Constants.BUBBLE_CONTENT_BODY));
                }
            } else if (Utils.isValid(contentTitle)) {
                // Remove if this step doesn't have a title but previous step has 1
                contentBlock.removeChild(contentTitle);
            }

            /*
             * Modify the step description of the bubble to the new one
             */
            let contentBody = Utils.getEleFromClassName(Constants.BUBBLE_CONTENT_BODY);
            contentBody.innerText = Components.stepDescription[Constants.CONTENT];

            /**
             * Modify the button block.
             * 1. If the new step doesn't have buttons but the previous one has ... remove button-group.
             * 2. Modify the other buttons accordingly.
             */
            let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE);
            if (noButtons) {
                let buttonGroup = Utils.getEleFromClassName(Constants.BUTTON_GROUP);
                if (Utils.isValid(buttonGroup)) {
                    bubble.removeChild(buttonGroup);
                }
            } else {
                let buttonGroup = document.createElement("div");
                buttonGroup.classList.add(Constants.BUTTON_GROUP);

                let skipButton = Utils.getEleFromClassName(Constants.SKIP_BUTTON);
                if (Utils.isValid(skipButton)) {
                    skipButton.disabled = !showSkip;
                } else {
                    let skipButton = document.createElement("button");
                    skipButton.classList.add(Constants.SKIP_BUTTON);
                    skipButton.innerHTML = Constants.SKIP_TEXT;
                    skipButton.disabled = !showSkip;
                    buttonGroup.appendChild(skipButton);
                }

                let backButton = Utils.getEleFromClassName(Constants.BACK_BUTTON);
                if (Utils.isValid(backButton)) {
                    backButton.disabled = !showBack;
                } else {
                    let backButton = document.createElement("button");
                    backButton.classList.add(Constants.BACK_BUTTON);
                    backButton.innerHTML = Constants.BACK_TEXT;
                    backButton.disabled = !showBack;
                    buttonGroup.appendChild(backButton);
                }

                if (showNext) {
                    let nextButton = Utils.getEleFromClassName(Constants.NEXT_BUTTON);
                    if (Utils.isValid(nextButton)) {
                        nextButton.disabled = disableNext;
                    } else {
                        let nextButton = document.createElement("button");
                        nextButton.classList.add(Constants.NEXT_BUTTON);
                        nextButton.innerHTML = Constants.NEXT_TEXT;
                        nextButton.disabled = disableNext;
                        buttonGroup.appendChild(nextButton);
                    }
                } else {
                    let doneButton = Utils.getEleFromClassName(Constants.DONE_BUTTON);
                    if (Utils.isValid(doneButton)) {
                        doneButton.disabled = disableNext;
                    } else {
                        let doneButton = document.createElement("button");
                        doneButton.classList.add(Constants.DONE_BUTTON);
                        doneButton.innerHTML = Constants.DONE_TEXT;
                        doneButton.disabled = disableNext;
                        buttonGroup.appendChild(doneButton);
                    }
                }
                bubble.appendChild(buttonGroup);
            }
        }

        /**
         * Find the current location of the bubble and modify it to point at correct target
         * Also, create the arrow according to the position defined by user
         */
        function _placeBubbleLocation() {
            let targetPosition = Components.rect;
            let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE);

            if (Utils.isValid(bubble)) {
                let bubbleRect = bubble.getBoundingClientRect();
                let halfBubbleHeight = bubbleRect.height / 2;
                let halfBubbleWidth = bubbleRect.width / 2;

                let halfTargetHeight = Components.rect.height / 2;
                let halfTargetWidth = Components.rect.width / 2;

                let arrow = document.createElement("span");
                arrow.classList.add(Constants.ARROW_LOCATION);

                switch (Components.stepDescription[Constants.POSITION]) {
                    case Constants.TOP:
                        arrow.classList.add(Constants.TOP);
                        bubble.style.top = Components.rect.top - bubbleRect.height - Constants.ARROW_SIZE + Constants.PX;
                        bubble.style.left = Components.rect.left + halfTargetWidth - halfBubbleWidth + Constants.PX;
                        break;
                    case Constants.RIGHT:
                        arrow.classList.add(Constants.RIGHT);
                        bubble.style.top = Components.rect.top + halfTargetHeight - halfBubbleHeight + Constants.PX;
                        bubble.style.left = targetPosition.right + Constants.ARROW_SIZE + Constants.PX;
                        break;
                    case Constants.LEFT:
                        arrow.classList.add(Constants.LEFT);
                        bubble.style.left = Components.rect.left - bubbleRect.width - Constants.ARROW_SIZE + Constants.PX;
                        bubble.style.top = Components.rect.top + halfTargetHeight - halfBubbleHeight + Constants.PX;
                        break;
                    default: // This is either bottom or something that doesn't exist
                        arrow.classList.add(Constants.BOTTOM);
                        bubble.style.top = targetPosition.bottom + Constants.ARROW_SIZE + Constants.PX;
                        bubble.style.left = Components.rect.left + halfTargetWidth - halfBubbleWidth + Constants.PX;
                        break;
                }

                let innerHollowArrow = document.createElement("span");
                innerHollowArrow.classList.add(Constants.HOLLOW_ARROW);
                arrow.appendChild(innerHollowArrow);

                bubble.appendChild(arrow);
            }
        }

        /**
         * Find the size and location of the bubble and target, then move the bubble to that location accordingly
         * This will automatically trigger the
         */
        function _modifyBubbleLocation() {
            let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE);

            if (Utils.isValid(bubble)) {
                let arrow = Utils.getEleFromClassName(Constants.ARROW_LOCATION);
                if (Utils.isValid(arrow)) {
                    bubble.removeChild(arrow);
                }
            }
            // Remove the arrow from the bubble, the recalculate the new location the re-attach a new arrow accordingly
            _placeBubbleLocation();
        }

        /**
         * Find the location of the bubble and put it in the middle of the screen.
         */
        function _placeFloatBubble() {
            let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE);
            bubble.classList.add(Constants.FLOAT_STYLE);
        }

        /**
         * Modify the bubble to floating style, first add the float style to the bubble.
         * Then remove the arrow that ties to the previous target, and set top and left to auto for CSS to take over.
         * Because Styles have higher priority than CSS styles.
         */
        function _modifyFloatBubble() {
            let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE);
            bubble.classList.add(Constants.FLOAT_STYLE);
            let arrow = Utils.getEleFromClassName(Constants.ARROW_LOCATION);
            if (Utils.isValid(arrow)) {
                bubble.removeChild(arrow);
                bubble.style.top = "";
                bubble.style.left = "";
            }
        }

        /**
         * Create a border around target by generating an overlay over target. The overlay can be clicked through only when the step can be interated or triggerable
         */
        function _addBorderAroundTarget() {
            if (Utils.isValid(Components.rect)) {
                let borderOverlay = document.createElement("div");
                borderOverlay.classList.add(Constants.TARGET_BORDER);
                borderOverlay.style.width = Components.rect.width + Constants.BORDER_WIDTH * 2 + Constants.PX;
                borderOverlay.style.height = Components.rect.height + Constants.BORDER_WIDTH * 2 + Constants.PX;
                borderOverlay.style.top = Components.rect.top - Constants.BORDER_WIDTH * 2 + Constants.PX;
                borderOverlay.style.left = Components.rect.left - Constants.BORDER_WIDTH * 2 + Constants.PX;

                if (Components.stepDescription[Constants.CAN_INTERACT]) {
                    borderOverlay.classList.add(Constants.TARGET_INTERACTABLE);
                }

                Components.ui.appendChild(borderOverlay);
            }
        }

        /**
         * Modify the border around target to the new position so that the transition animation can happen.
         * If the previous node is interactable and current node is not, remove interactable class from the border
         */
        function _modifyBorderAroundTarget() {
            if (Utils.isValid(Components.rect)) {
                let borderOverlay = Utils.getEleFromClassName(Constants.TARGET_BORDER);
                borderOverlay.style.width = Components.rect.width + Constants.BORDER_WIDTH * 2 + Constants.PX;
                borderOverlay.style.height = Components.rect.height + Constants.BORDER_WIDTH * 2 + Constants.PX;
                borderOverlay.style.top = Components.rect.top - Constants.BORDER_WIDTH * 2 + Constants.PX;
                borderOverlay.style.left = Components.rect.left - Constants.BORDER_WIDTH * 2 + Constants.PX;

                if (Components.stepDescription[Constants.CAN_INTERACT]) {
                    borderOverlay.classList.add(Constants.TARGET_INTERACTABLE);
                } else {
                    if (borderOverlay.classList.contains(Constants.TARGET_INTERACTABLE)) {
                        borderOverlay.classList.remove(Constants.TARGET_INTERACTABLE);
                    }
                }
            }
        }

        /**
         * Main function to create overlays, border around target and the content bubble next to target
         * @param noButtons        True to hide all buttons
         * @param showSkip        True to show Skip button
         * @param showBack        True to show Back Button
         * @param showNext        True to show Next Button, False to show Done Button
         * @param disableNext     True to disable Next and Done button
         */
        Components.prototype.createComponents = function (noButtons, showSkip, showBack, showNext, disableNext) {
            if (!Utils.isFloatStep(Components.stepDescription)) {
                _addOverlays();
                _addBorderAroundTarget();
                _createContentBubble(noButtons, showSkip, showBack, showNext, disableNext);
                // Note to self: must append every to the body here so that we can modify the location of the bubble later
                document.body.appendChild(Components.ui);
                _placeBubbleLocation();
            } else {
                // The target element cannot be found which mean this is a floating step
                _addOverlay();
                _createContentBubble(noButtons, showSkip, showBack, showNext, disableNext);
                // Note to self: must append every to the body here so that we can modify the location of the bubble later
                document.body.appendChild(Components.ui);
                _placeFloatBubble();
            }
        };

        /**
         * Main function to modify the existing overlays, border around target and the content bubble next to target.
         * This function is called when all of those nodes already exist in the DOM. Modify it so that it transition
         * @param noButtons        True to hide all buttons
         * @param showSkip        True to show Skip button
         * @param showBack        True to show Back Button
         * @param showNext        True to show Next Button, False to show Done Button
         * @param disableNext     True to disable Next and Done button
         */
        Components.prototype.modifyComponents = function (noButtons, showSkip, showBack, showNext, disableNext) {
            Components.ui = Utils.getEleFromClassName(Constants.FLEXTOUR);

            if (!Utils.isFloatStep(Components.stepDescription)) {
                _modifyOverlays();
                _modifyBorderAroundTarget();
                _modifyContentBubble(noButtons, showSkip, showBack, showNext, disableNext);
                _modifyBubbleLocation();
            } else {
                // The target element cannot be found which mean this is a floating step
                _addOverlay();
                _modifyContentBubble(noButtons, showSkip, showBack, showNext, disableNext);
                _modifyFloatBubble();
            }
        };

        /**
         * Main function to clean up the components that were added into the DOM.
         */
        Components.prototype.removeComponents = function () {
            document.body.removeChild(Components.ui);
        };

        module.exports = Components;

        /***/
    },
    /* 2 */
    /***/ function (module, exports) {

        /*******************************************************************************
         * Copyright (c) 2016. MIT License.
         * NhatHo-nhatminhhoca@gmail.com
         ******************************************************************************/

        module.exports = {
            CLASS: ".",
            COLON: ":",
            COMMA: ",",
            WAIT: "?",
            SKIP: "!",
            CURRENT_TARGET: "@target@",
            IS_VISIBLE: "isVisible",
            DOES_EXIST: "doesExist",
            OVERLAY_STYLE: "flextour-overlay-styles",

            FLEXTOUR: "flextour",

            // Bubble Block
            TARGET_BORDER: "flextour-target-border",
            TARGET_INTERACTABLE: "interactable",
            TOUR_BUBBLE: "flextour-tour-bubble",
            ARROW_LOCATION: "arrow-location",
            HOLLOW_ARROW: "inner-arrow",
            BUBBLE_CONTENT: "flextour-content",
            BUBBLE_CONTENT_BODY: "flextour-content-body",
            FLOAT_STYLE: "flextour-float-bubble",
            BUBBLE_TITLE: "flextour-bubble-title",
            ICON_STYLE: "icon-style",

            ICON_REGEXP: "flextour-icon",
            ACTION_ICON: "flextour-icon-action",
            DEFAULT_ICON: "flextour-icon-info",
            LOADING_ICON: "flextour-icon-loading",

            CLOSE_TOUR: "flextour-close",

            SKIP_BUTTON: "flextour-skip-button",
            BACK_BUTTON: "flextour-back-button",
            NEXT_BUTTON: "flextour-next-button",
            DONE_BUTTON: "flextour-done-button",
            BUTTON_GROUP: "flextour-button-group",

            // Event Block
            FLEX_CLICK: "click",
            FLEX_RESIZE: "resize",

            // Tour Attributes Block
            TOUR_DEFAULT_SETTINGS: {
                transition: {},
                canInteract: true,
                noButtons: false,
                noBack: false,
                noSkip: false,
                stepNumber: true,
                endOnOverlayClick: true,
                endOnEsc: true
            },

            ID: "id",
            TITLE: "title",
            STEPS: "steps",
            NO_BUTTONS: "noButtons",
            NO_BACK: "noBack",
            NO_SKIP: "noSkip",
            CAN_INTERACT: "canInteract",
            TYPE: "type",
            CONTENT: "content",
            PREREQUISITES: "prerequisites",
            TARGET: "target",
            POSITION: "position",
            NEXT_ON_TARGET: "nextOnTargetClick",
            WAIT_INTERVALS: "waitIntervals",
            RETRIES: "retries",
            END_ON_ESC: "endOnEsc",
            DELAY: "delay",
            TRANSITION: "transition",

            DEFAULT_TYPE: "info",
            ACTION_TYPE: "action",
            DEFAULT_POSITION: "bottom",

            TOUR: "tour",

            TIMES: "&times;",
            BORDER_WIDTH: 3,
            ARROW_SIZE: 20,
            PX: "px",

            TOP: "top",
            RIGHT: "right",
            LEFT: "left",
            BOTTOM: "bottom",
            FLOAT: "float",

            SKIP_TEXT: "Skip",
            NEXT_TEXT: "Next",
            BACK_TEXT: "Back",
            DONE_TEXT: "Done"
        };

        /***/
    },
    /* 3 */
    /***/ function (module, exports, __webpack_require__) {

        /*******************************************************************************
         * Copyright (c) 2016. MIT License.
         * NhatHo-nhatminhhoca@gmail.com
         ******************************************************************************/

        let Constants = __webpack_require__(2);

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


        /***/
    }
    /******/]);