/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

let Components = require("./Components");
let Constants = require("./Constants");
let Utils = require("./Utilities");
let $ = require("./../node_modules/jquery/dist/jquery.min.js");

/**
 * Pre-process all information for all tours make sure each step and each tour contains necessary
 * information for subsequent steps
 * @param tourDesc      JSON description file that has all information needed
 */
function _preprocessingTours(tourDesc) {
    if ($.isArray(tourDesc)) {
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
    let rawTour = $.extend(true, {}, tour);
    // Fill in information for each tour in case any important information is missing
    rawTour = $.extend({}, Constants.TOUR_DEFAULT_SETTINGS, rawTour);

    // Fill in information for each step in case anything important is missing
    let numOfSteps = rawTour[Constants.STEPS].length;

    for (let i = 0; i < numOfSteps; i++) {
        let currentStep = rawTour[Constants.STEPS][i];

        currentStep[Constants.TYPE] = currentStep[Constants.TYPE] || Constants.DEFAULT_TYPE;
        currentStep[Constants.POSITION] = currentStep[Constants.POSITION] || Constants.DEFAULT_POSITION;
        currentStep[Constants.NO_BUTTONS] = currentStep[Constants.NO_BUTTONS] || rawTour[Constants.NO_BUTTONS];
        currentStep[Constants.DELAY] = currentStep[Constants.DELAY] || rawTour[Constants.DELAY];
        currentStep[Constants.NO_BACK] = currentStep[Constants.NO_BACK] || rawTour[Constants.NO_BACK];
        currentStep[Constants.CAN_INTERACT] = currentStep[Constants.CAN_INTERACT] || currentStep[Constants.NEXT_STEP_TRIGGER] || currentStep[Constants.DND] || rawTour[Constants.CAN_INTERACT]; // This mean that if target can trigger next step on click, it must be clickable
        currentStep[Constants.WAIT_INTERVALS] = currentStep[Constants.WAIT_INTERVALS] || rawTour[Constants.WAIT_INTERVALS];
        currentStep[Constants.RETRIES] = currentStep[Constants.RETRIES] || rawTour[Constants.RETRIES];
        currentStep[Constants.NEXT_BUTTON_CUS] = currentStep[Constants.NEXT_BUTTON_CUS] || rawTour[Constants.NEXT_BUTTON_CUS];
        currentStep[Constants.BACK_BUTTON_CUS] = currentStep[Constants.BACK_BUTTON_CUS] || rawTour[Constants.BACK_BUTTON_CUS];
        currentStep[Constants.SKIP_BUTTON_CUS] = currentStep[Constants.SKIP_BUTTON_CUS] || rawTour[Constants.SKIP_BUTTON_CUS];
        currentStep[Constants.DONE_BUTTON_CUS] = currentStep[Constants.DONE_BUTTON_CUS] || rawTour[Constants.DONE_BUTTON_CUS];
        let currentTarget = currentStep[Constants.NEXT_STEP_TRIGGER];
        if (currentTarget && currentTarget === Constants.CURRENT_TARGET) {
            currentStep[Constants.NEXT_STEP_TRIGGER] = currentStep[Constants.TARGET];
        }

        /**
         * Get the functions correspond to the onClick function name describe in customized buttons
         */
        let currentStepCustomizedButtons = currentStep[Constants.BUTTONS_CUS] || rawTour[Constants.BUTTONS_CUS];
        if (Utils.isValid(currentStepCustomizedButtons)) {
            for (let i = 0; i < currentStepCustomizedButtons.length; i++) {
                let onClickFunctionName = currentStepCustomizedButtons[i][Constants.ONCLICK_NAME];
                if (FlexTour.actionsList.hasOwnProperty(onClickFunctionName)) {
                    currentStepCustomizedButtons[i][Constants.ONCLICK_NAME] = FlexTour.actionsList[onClickFunctionName];
                }
            }
            currentStep[Constants.BUTTONS_CUS] = currentStepCustomizedButtons;
        }
    }
    FlexTour.toursMap.push(rawTour);
}

/**
 * This is the head quarter of displaying steps, overlay, and other things.
 * Tags: CENTRAL, ORGANIZER, RUNNER
 * @param stepDesc          Description object of current step to be run
 * @param newStep           Flag to be set when this is the first time this step is rendered. Used to avoid duplicated event attachment
 */
function _centralOrganizer(stepDesc, newStep) {
    FlexTour.Component = new Components(stepDesc);
    let currentStepNumber = FlexTour.currentStepNumber;

    if (Utils.isValid(FlexTour.Component)) {
        let showBack = false,
            showNext = false,
            disableNext = false,
            noButtons = false;

        // When the current step has NextOnTarget flag set, assuming that this step setup prerequisite for next step
        // Which means that user cannot click Next, or Skip.

        if (stepDesc[Constants.NO_BUTTONS] || stepDesc[Constants.TRANSITION]) {
            noButtons = true;
        }

        let numberOfStep = FlexTour.currentTour[Constants.STEPS].length;

        if (currentStepNumber < numberOfStep - 1) {
            showNext = true;
        }

        if (stepDesc[Constants.NEXT_STEP_TRIGGER]) {
            disableNext = true;
        }

        if (currentStepNumber > 0 && !stepDesc[Constants.NO_BACK]) {
            showBack = true;
        }

        /**
         * Create components can be only called once when the tour start for the first time.
         */
        if (!FlexTour.running) {
            FlexTour.Component.createComponents(noButtons, showBack, showNext, disableNext);
            FlexTour.running = true;
            _addResizeWindowListener();
            _addKeyBoardListener();

            let bubbleStyles = FlexTour.currentTour[Constants.STYLES];
            if (Utils.isValid(bubbleStyles)) {
                Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true).addClass(bubbleStyles);
            }

        } else {
            FlexTour.Component.modifyComponents(noButtons, showBack, showNext, disableNext);
        }

        // Add event to Skip button if it exist
        if (Utils.isValid(stepDesc[Constants.SKIP])) {
            Utils.getElementsAndAttachEvent(Constants.SKIP_BUTTON, Constants.FLEX_CLICK, _skipStep);
        }

        if (stepDesc[Constants.TRANSITION] && _isAllowToMove(currentStepNumber + 1, 0)) {
            _transitionToNextStep(currentStepNumber + 1);
        }

        /**
         * When this is a new step, attach event handlers to it. Otherwise skip.
         */
        if (newStep) {
            if (Utils.isValid(stepDesc[Constants.NEXT_STEP_TRIGGER])) {
                _addClickEventOnTargetClick(stepDesc[Constants.NEXT_STEP_TRIGGER]);
            }
            if (Utils.isValid(stepDesc[Constants.MODAL])) {
                _bindScrollListener();
            }

            _addClickEvents();

            if (Utils.isValid(stepDesc[Constants.SCROLL_LOCK])) {
                _blockScrolling();
            }

            if (Utils.isDnDStep(stepDesc)) {
                _dragStartPause(stepDesc[Constants.TARGET]);
            }
        }
    } else {
        console.log("Target of step: " + JSON.stringify(stepDesc) + " is not found.");
    }
}

/**
 * Attached all necessary handlers to the elements
 */
function _addClickEvents() {
    if (FlexTour.currentTour[Constants.END_ON_OVERLAY_CLICK]) {
        Utils.getElementsAndAttachEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK, _exit);
    }

    Utils.getElementsAndAttachEvent(Constants.BACK_BUTTON, Constants.FLEX_CLICK, _previousStep);

    Utils.getElementsAndAttachEvent(Constants.NEXT_BUTTON, Constants.FLEX_CLICK, _nextStep);

    Utils.getElementsAndAttachEvent(Constants.DONE_BUTTON, Constants.FLEX_CLICK, _exit);

    Utils.getElementsAndAttachEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK, _exit);
}

/**
 * This function get attached only when the step has NextOnTargetClick set to true
 * @param nextTrigger {String}      QuerySelector string for next Trigger
 */
function _addClickEventOnTargetClick(nextTrigger) {
    let nextTriggerTarget = $(nextTrigger);
    if (Utils.hasELement(nextTriggerTarget)) {
        Utils.addEvent(nextTriggerTarget, Constants.FLEX_CLICK, _nextStep);
    }
}

/**
 * Remove all attached event to avoid leaking memories
 */
function _removeEvents() {
    Utils.removeELementsAndAttachedEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK);

    Utils.removeELementsAndAttachedEvent(Constants.BACK_BUTTON, Constants.FLEX_CLICK);

    Utils.removeELementsAndAttachedEvent(Constants.NEXT_BUTTON, Constants.FLEX_CLICK);

    Utils.removeELementsAndAttachedEvent(Constants.DONE_BUTTON, Constants.FLEX_CLICK);

    Utils.removeELementsAndAttachedEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK);
}

/**
 * Remove the event listener for nextOnTargetClick
 */
function _removeClickEventOnTargetClick(nextTrigger) {
    let nextTriggerTarget = $(nextTrigger);
    if (Utils.hasELement(nextTriggerTarget)) {
        Utils.removeEvent(nextTriggerTarget, Constants.FLEX_CLICK); //Remove this event listener
    }
}

/**
 * THIS PART RIGHT HERE IS WHAT MAKE FLEXTOUR DIFFERENT FROM OTHER ENGINES.
 *
 * This function resolves "prerequisites": [] attribute in the step description.
 * There are 3 different functions that will define the flow of the tour:
 * 1. Prerequisite functions:
 *      - Syntax: ["Function Name", ...]
 *      - Logic: Each function name correspond to a function in actionsList. At any point a prerequisite function return false, the flow will be stopped. --> All prerequisites MUST return true to continue.
 * 2. Wait For Functions:
 *      - Syntax: ["?FunctionName:params", ...]
 *      - Logic: Similar to prerequisite, funciton name must be registered in actionsList. The params will be passed into the function.
 *      There are 2 default functions: isVisible, doesExist which check if given DOM elemnts are visible, or exist respectively. You can also create your own custom functions to do the check.
 *      When the wait for function returns false, FlexTourJS will retry after a set time interval, until it runs out of retries then it would proceed to the next function on the list.
 * 3. Proceed If Function:
 *      - Syntax: ["!FunctionName:params", ...]
 *      - Logic: This function directly branchese the tour flow when needed. When this function returns false, the next step will not be processed, but it will branch to wherever "skip" attribute defines. If "skip" attribute is not defined, it will skip 2 steps ahead.
 *      When this function returns true, it will continue the flow as normal.
 *      This function can be used as a fail-safe measure, when all prerequisites seems to passed, but the target of next step will not be AVAILABLE (server error, etc.) this function will make sure your tour won't fail helplessly.
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

            let temporaryResult = _executePrerequisiteCondition(possibleStepNumber, prerequisiteBlock);

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
                        // Proceed to next one when this is waitFor is met. Of course this will require the next conditions are also successful
                        _precheckForTransition(possibleStepNumber, currPrerequisite);
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
        } else if (prerequisite.indexOf(Constants.PROCEED_INDICATOR) > -1) {
            let prerequisiteBlock = prerequisite.split(Constants.PROCEED_INDICATOR)[1].trim();

            if (!_executePrerequisiteCondition(possibleStepNumber, prerequisiteBlock)) {
                let skipNumber = possibleStep[Constants.SKIP];
                if (possibleStepNumber > FlexTour.currentStepNumber) {
                    // If the tour is going forward then skip it forward
                    if (Utils.isValid(skipNumber)) {
                        _precheckForTransition(skipNumber, 0);
                    } else {
                        _precheckForTransition(possibleStepNumber + 1, 0);
                    }
                } else {
                    // If the tour is going backward then skip it backward 1 step only
                    _precheckForTransition(possibleStepNumber - 1, 0);
                }
                // At this point the step will be skipped. Return false so the potential step will not be rendered.
                return false;
            }
            return true;
        } else {
            // This is the regular prerequisite function
            if (executeFunctionWithName(prerequisite, possibleStepNumber)) {
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
 * Execute the function with given name in a given lists of function.
 * Make sure that the function exists in the list before executing it.
 * @param functionName {String}     The name of the given function
 * @param stepNumber {Number}      The possible step that is being tested
 */
function executeFunctionWithName(functionName, stepNumber) {
    if (typeof FlexTour.actionsList[functionName] === "function") {
        return FlexTour.actionsList[functionName].call(this, FlexTour.currentTour[Constants.STEPS][stepNumber]);
    }
    // If the given function name exist in the list, return false to halt the process. Because this could cause the flow to break.
    return false;
}

/**
 * Execute block where wait condition and skip condition. Split things up to condition name and parameters.
 * Execute them accordingly. Either isVisible, doesExist (built-in) functions or custom functions
 * @param stepNumber    Index of possible step
 * @param prerequisite  The prerequisite block after removing ! and ? from it.
 */
function _executePrerequisiteCondition(stepNumber, prerequisite) {
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
            elementsList[indexOfCurrentTarget] = FlexTour.currentTour[Constants.STEPS][stepNumber][Constants.TARGET];
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
        return executeFunctionWithName(condName, stepNumber);
    }

    return temporaryResult;
}

/**
 * Factored function to check if the next step is allowed, if yes move to that step
 * @param stepNumber        Next step index number
 * @param prerequisiteNumber        The prerequisite to be checked
 */
function _precheckForTransition(stepNumber, prerequisiteNumber) {
    if (_isAllowToMove(stepNumber, prerequisiteNumber)) {
        _transitionToNextStep(stepNumber);
    }
}

/**
 * Skip the next step to the next next step.
 */
function _skipStep(event) {
    Utils.noDefault(event);
    _cleanUpAfterStep();
    Utils.removeELementsAndAttachedEvent(Constants.SKIP_BUTTON, Constants.FLEX_CLICK);

    let skipToStep = FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber][Constants.SKIP];
    if (Utils.isValid(skipToStep)) {
        _precheckForTransition(skipToStep, 0);
    }
}

/**
 * Decrement current step counter and go back to previous step ... Obviously it will not be the last step
 */
function _previousStep(event) {
    Utils.noDefault(event);
    _cleanUpAfterStep();

    _precheckForTransition(FlexTour.currentStepNumber - 1, 0);
}

/**
 * Trigger next step of the tour. If the next step is the last step, trigger the isLastStep flag
 */
function _nextStep(event) {
    Utils.noDefault(event);
    _cleanUpAfterStep();

    _precheckForTransition(FlexTour.currentStepNumber + 1, 0);
}

/**
 * Common factor for transition step, either skip, previous or next.
 * @param stepNumber
 */
function _transitionToNextStep(stepNumber) {
    let stepDelay = FlexTour.currentTour[Constants.STEPS][stepNumber][Constants.DELAY];

    function __transitionFunction(stepNumber) {
        FlexTour.currentStepNumber = stepNumber;
        _centralOrganizer(FlexTour.currentTour[Constants.STEPS][stepNumber], true);
    }

    if (Utils.isValid(stepDelay)) {
        setTimeout(__transitionFunction.bind(this, stepNumber), stepDelay);
    } else {
        __transitionFunction(stepNumber);
    }
}

/**
 * Add window resize event to recalculate location of tour step.
 */
function _addResizeWindowListener() {
    Utils.addEvent($(window), Constants.FLEX_RESIZE, Utils.debounce(__rerenderComponents, 500, false));
}

/**
 * CallBack function that get executed when window is resized
 * This event is only trigger once every 1/2 second. So that it won't go crazy and trigger too many event on resizing
 */
function __rerenderComponents() {
    _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber], false);
}

/**
 * Remove resize listener from window without detaching other handlers from main program
 */
function _unbindResizeWindowListener() {
    Utils.removeEvent($(window), Constants.FLEX_RESIZE);
}

/**
 * Attach keyup event into the window element so that it will be trigger on keyup
 */
function _addKeyBoardListener() {
    Utils.addEvent($(window), Constants.KEY_UP, _keyUpCallBack);
}

/**
 * Callback function when keyup is triggered.
 * When keycode is ESC, and current tour end on escape --> invoke exit
 * @param event     Keyboard event
 */
function _keyUpCallBack(event) {
    // Escape key is triggered
    if (event.keyCode === 27 && Utils.isValid(FlexTour.currentTour[Constants.END_ON_ESC])) {
        _exit();
    }
}

/**
 * Unbind the keyup handler on exit, so that it won't cause memory leak
 */
function _unbindKeyboardListener() {
    Utils.removeEvent($(window), Constants.KEY_UP);
}

/**
 * Bind scrolling event to the window. Debounce function call every 0.1 second so that it won't overload the app
 */
function _bindScrollListener() {
    Utils.addEvent($(window), Constants.SCROLL, Utils.debounce(__rerenderComponents, 200, false));
}

/**
 * Unbind scrolling event in the window. So that it won't throw unneccesary event calls when it's not needed
 */
function _unbindScrollListener() {
    Utils.removeEvent($(window), Constants.SCROLL);
}

/**
 * Clean things up after each step. Unbind the event listeners to avoid memory leaks
 */
function _cleanUpAfterStep() {
    let currentStep = FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber];
    if (Utils.isValid(currentStep[Constants.NEXT_STEP_TRIGGER])) {
        // Clean up next on target click here.
        _removeClickEventOnTargetClick(currentStep[Constants.NEXT_STEP_TRIGGER]);
    }
    if (currentStep[Constants.MODAL]) {
        _unbindScrollListener();
    }
    _removeEvents();

    if (Utils.isValid(currentStep[Constants.SCROLL_LOCK])) {
        _unblockScrolling();
    }

    if (Utils.isValid(currentStep[Constants.BUTTONS_CUS])) {
        let buttons = currentStep[Constants.BUTTONS_CUS];
        for (let i = 0; i < buttons.length; i++) {
            Utils.removeEvent(Utils.getEleFromClassName(buttons[i][Constants.BUTTON_STYLE], true), Constants.FLEX_CLICK);
        }
    }
}

/**
 * Block the scroll bar in place. This goes against philosophy of FlexTourJS because it interfere with the application's behavior
 * But this method reduces the performance hit of re-render when user scroll. This method only render once and locked-in place.
 * @private
 */
function _blockScrolling() {
    let top = $(window).scrollTop();
    let left = $(window).scrollLeft();

    $('body').css('overflow', 'hidden');
    Utils.addEvent($(window), Constants.SCROLL, function () {
        $(window).scrollTop(top).scrollLeft(left);
    });
    // Re-render the components after the scrolling has been locked.
    Utils.debounce(__rerenderComponents(), 10, true);
}

/**
 * Unblock scrolling so that it won't interfere with the application
 */
function _unblockScrolling() {
    $('body').css('overflow', 'auto');
    Utils.removeEvent($(window), Constants.SCROLL);
}

/**
 * Attach event to pause the tour engine when users start dragging something.
 * Syntax: {Boolean}. If it's set to true, it will temporarily remove all overlays and let users drag at will.
 * @param stepTarget {String}     DOM Selector string for current step target
 */
function _dragStartPause(stepTarget) {
    Utils.addEvent($(stepTarget), Constants.DRAG_START, _removeAndUnbind);
    Utils.addEvent($(stepTarget), Constants.DRAG_END, function __moveOnDropTarget(stepTarget) {
        _precheckForTransition(FlexTour.currentStepNumber + 1, 0);
        _dragEndResume(stepTarget);
    });
}

/**
 * Resume the tour engine when users drop the element into whereever they want.
 * onDrop event, the tour will resume to the next step and resume all overlays.
 * @param stepTarget {String}     DOM Selector string for current step target
 */
function _dragEndResume(stepTarget) {
    Utils.removeEvent($(stepTarget), Constants.DRAG_START);
    Utils.removeEvent($(stepTarget), Constants.DRAG_END);
}

/**
 * Function to remove everything and unbind all events. However, this doesn't stop the tour. This function will be reused for DnD, pause tour on request.
 */
function _removeAndUnbind() {
    _unbindResizeWindowListener();
    _unbindKeyboardListener();
    _cleanUpAfterStep();

    FlexTour.Component.removeComponents();
    FlexTour.running = false; // Reset this flag when users quit the tour
}

/**
 * Clean up everything when the tour is exited. This is to prevent memory leaks for attached events in DOM elements.
 * Remove all components and set the running flag to false, and set currentStepNumber to false
 */
function _exit() {
    _removeAndUnbind();
    FlexTour.currentStepNumber = 0;
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
        return;
    }

    FlexTour.currentTour = $.extend(true, {}, FlexTour.toursMap[FlexTour.currentTourIndex]);
    FlexTour.currentStepNumber = 0;

    let steps = FlexTour.currentTour[Constants.STEPS];
    if (Utils.isValid(steps)) {
        let firstStep = steps[FlexTour.currentStepNumber];
        _precheckForTransition(0, 0);
    }
};

FlexTour.prototype.exit = function () {
    _exit();
};

module.exports = FlexTour;