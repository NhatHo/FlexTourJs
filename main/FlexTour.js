/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

var Components = require("./Components");
var Constants = require("./Constants");
var Utils = require("./Utilities");
var $ = require("./../node_modules/jquery/dist/jquery.min.js");

/**
 * Pre-process all information for all tours make sure each step and each tour contains necessary
 * information for subsequent steps
 * @param tourDesc      JSON description file that has all information needed
 */
function _preprocessingTours(tourDesc) {
    if ($.isArray(tourDesc) && tourDesc.length > 0) {
        FlexTour.currentTourId = tourDesc[0][Constants.ID];
        for (var i = 0; i < tourDesc.length; i++) {
            _initializeTour(tourDesc[i]);
        }
    } else {
        _initializeTour(tourDesc);
        FlexTour.currentTourId = tourDesc[Constants.ID];
    }
}

/**
 * Initialize raw tour object to make it legal for the framework
 * @param tour      The tour object ---> Must be an object
 */
function _initializeTour(tour) {
    var rawTour = $.extend(true, {}, tour);
    // Fill in information for each tour in case any important information is missing
    rawTour = $.extend({}, Constants.TOUR_DEFAULT_SETTINGS, rawTour);

    // Fill in information for each step in case anything important is missing
    var numOfSteps = rawTour[Constants.STEPS].length;

    for (var i = 0; i < numOfSteps; i++) {
        var currentStep = rawTour[Constants.STEPS][i];
        var content = currentStep[Constants.CONTENT];
        if (Utils.isValid(FlexTour.translation) && FlexTour.translation.hasOwnProperty(content)) {
            currentStep[Constants.CONTENT] = FlexTour.translation[content];
        }

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
        var currentTarget = currentStep[Constants.NEXT_STEP_TRIGGER];
        if (currentTarget && currentTarget === Constants.CURRENT_TARGET) {
            currentStep[Constants.NEXT_STEP_TRIGGER] = currentStep[Constants.TARGET];
        }

        var flashTarget = currentStep[Constants.FLASH_TARGET];
        if (flashTarget && flashTarget === Constants.CURRENT_TARGET) {
            currentStep[Constants.FLASH_TARGET] = currentStep[Constants.TARGET];
        }

        /**
         * Get the functions correspond to the onClick function name describe in customized buttons
         */
        var currentStepCustomizedButtons = currentStep[Constants.BUTTONS_CUS] || rawTour[Constants.BUTTONS_CUS];
        if (Utils.isValid(currentStepCustomizedButtons)) {
            for (var j = 0; j < currentStepCustomizedButtons.length; j++) {
                var onClickFunctionName = currentStepCustomizedButtons[j][Constants.ONCLICK_NAME];
                if (FlexTour.actionsList.hasOwnProperty(onClickFunctionName)) {
                    currentStepCustomizedButtons[j][Constants.ONCLICK_NAME] = FlexTour.actionsList[onClickFunctionName];
                }
            }
            currentStep[Constants.BUTTONS_CUS] = currentStepCustomizedButtons;
        }
    }
    FlexTour.toursMap[rawTour[Constants.ID]] = rawTour;
}

/**
 * This is the head quarter of displaying steps, overlay, and other things.
 * Tags: CENTRAL, ORGANIZER, RUNNER
 * @param stepDesc          Description object of current step to be run
 * @param newStep           Flag to be set when this is the first time this step is rendered. Used to avoid duplicated event attachment
 */
function _centralOrganizer(stepDesc, newStep) {
    var currentStepNumber = FlexTour.currentStepNumber;
    FlexTour.Component = new Components(stepDesc, currentStepNumber + 1);

    if (Utils.isValid(FlexTour.Component)) {
        var showBack = false,
            showNext = false,
            disableNext = false,
            noButtons = false;

        // When the current step has NextOnTarget flag set, assuming that this step setup prerequisite for next step
        // Which means that user cannot click Next, or Skip.

        if (stepDesc[Constants.NO_BUTTONS] || stepDesc[Constants.TRANSITION]) {
            noButtons = true;
        }

        var numberOfStep = FlexTour.currentTour[Constants.STEPS].length;

        if (currentStepNumber < numberOfStep - 1) {
            showNext = true;
        }

        if (stepDesc[Constants.NEXT_STEP_TRIGGER]) {
            disableNext = true;
        }

        if (currentStepNumber > 0 && !stepDesc[Constants.NO_BACK]) {
            showBack = true;
        }

        _executeGeneralFunction(Constants.BEFORE_STEP);

        /**
         * Create components can be only called once when the tour start for the first time.
         */
        if (!FlexTour.running) {
            FlexTour.Component.createComponents(noButtons, showBack, showNext, disableNext);
            FlexTour.running = true;
            _addResizeWindowListener();
            _addKeyBoardListener();

            var bubbleStyles = FlexTour.currentTour[Constants.STYLES];
            if (Utils.isValid(bubbleStyles)) {
                Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true).addClass(bubbleStyles);
            }

        } else {
            FlexTour.Component.modifyComponents(noButtons, showBack, showNext, disableNext);
        }

        // Add event to Skip button if it exist
        if (Utils.isValid(stepDesc[Constants.SKIP])) {
            Utils.getElementsAndAttachEvent(Constants.SKIP_BUTTON_TRIGGER, Constants.FLEX_CLICK, _skipStep);
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

            if (Utils.isValid(stepDesc[Constants.SCROLL_LOCK])) {
                _blockScrolling();
            }

            _addClickEvents();

            if (Utils.isDnDStep(stepDesc)) {
                _dragStartPause(stepDesc[Constants.TARGET]);
            }
            if (Utils.isValid(stepDesc[Constants.MULTIPAGE])) {
                _saveCurrentTourState();
                Utils.setKeyValuePairLS(Constants.MULTIPAGE_KEY, true);
                // We assume that the URL will be changed after this step, so we attach cleanup step on hashchange in case that happens.
                Utils.addEvent($(window), FlexTour.HASH_CHANGE, function () {
                    debugger;
                    Utils.removeEvent($(window), FlexTour.HASH_CHANGE);
                    _exit(false);
                });
            }
        }

        _executeGeneralFunction(Constants.AFTER_STEP);
    } else {
        console.log("Target of step: " + JSON.stringify(stepDesc) + " is not found in the DOM in the current step.");
        _exit(true);
        Utils.removeLSValue(Constants.LOCALSTORAGE_KEY); // Cleanup Local Storage if anything goes wrong.
    }
}

/**
 * Attached all necessary handlers to the elements
 */
function _addClickEvents() {
    if (FlexTour.currentTour[Constants.END_ON_OVERLAY_CLICK]) {
        Utils.getElementsAndAttachEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK, function () {
            _exit(false);
        });
    }

    Utils.getElementsAndAttachEvent(Constants.BACK_BUTTON_TRIGGER, Constants.FLEX_CLICK, _previousStep);

    Utils.getElementsAndAttachEvent(Constants.NEXT_BUTTON_TRIGGER, Constants.FLEX_CLICK, _nextStep);

    Utils.getElementsAndAttachEvent(Constants.DONE_BUTTON_TRIGGER, Constants.FLEX_CLICK, function () {
        _exit(true);
        Utils.removeLSValue(Constants.LOCALSTORAGE_KEY); // When the tour is done ... remove everything stored before.
    });

    Utils.getElementsAndAttachEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK, function () {
        _exit(false);
    });
}

/**
 * This function get attached only when the step has NextOnTargetClick set to true
 * @param nextTrigger {String}      QuerySelector string for next Trigger
 */
function _addClickEventOnTargetClick(nextTrigger) {
    var nextTriggerTarget = $(nextTrigger);
    if (Utils.hasELement(nextTriggerTarget)) {
        Utils.addEvent(nextTriggerTarget, Constants.FLEX_CLICK, _nextStep);
    }
}

/**
 * Remove all attached event to avoid leaking memories
 */
function _removeEvents() {
    Utils.removeELementsAndAttachedEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK);

    Utils.removeELementsAndAttachedEvent(Constants.BACK_BUTTON_TRIGGER, Constants.FLEX_CLICK);

    Utils.removeELementsAndAttachedEvent(Constants.NEXT_BUTTON_TRIGGER, Constants.FLEX_CLICK);

    Utils.removeELementsAndAttachedEvent(Constants.DONE_BUTTON_TRIGGER, Constants.FLEX_CLICK);

    Utils.removeELementsAndAttachedEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK);
}

/**
 * Remove the event listener for nextOnTargetClick
 */
function _removeClickEventOnTargetClick(nextTrigger) {
    var nextTriggerTarget = $(nextTrigger);
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
 * @returns {boolean}   True will var the transition happens, false will make it stay at the current step until the conditions are met
 */
function _isAllowToMove(possibleStepNumber, currPrerequisite) {
    var possibleStep = FlexTour.currentTour[Constants.STEPS][possibleStepNumber];
    if (!Utils.isValid(possibleStep)) {
        return false;
    }
    var prerequisites = possibleStep[Constants.PREREQUISITES];
    var prerequisiteBlock;
    if (Utils.isValid(prerequisites) && currPrerequisite < prerequisites.length) {
        var prerequisite = prerequisites[currPrerequisite].trim();
        if (prerequisite.indexOf(Constants.WAIT) > -1) {
            prerequisiteBlock = prerequisite.split(Constants.WAIT)[1].trim();

            var temporaryResult = _executePrerequisiteCondition(possibleStepNumber, prerequisiteBlock);

            if (!temporaryResult) {
                if (possibleStep[Constants.RETRIES] <= 0) {
                    // Reset the retries entry for current step, only works if Retries is set on Tour Description
                    if (FlexTour.currentTour.hasOwnProperty(Constants.RETRIES)) {
                        possibleStep[Constants.RETRIES] = FlexTour.currentTour[Constants.RETRIES];
                    }
                    _isAllowToMove(possibleStepNumber, ++currPrerequisite);
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
            prerequisiteBlock = prerequisite.split(Constants.PROCEED_INDICATOR)[1].trim();

            if (!_executePrerequisiteCondition(possibleStepNumber, prerequisiteBlock)) {
                var skipNumber = possibleStep[Constants.SKIP];
                if (possibleStepNumber >= FlexTour.currentStepNumber) {
                    // If the tour is going forward then skip it forward
                    if (Utils.isValid(skipNumber)) {
                        _precheckForTransition(skipNumber - 1, 0);
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
            if (_executeFunctionWithName(prerequisite, possibleStepNumber)) {
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
function _executeFunctionWithName(functionName, stepNumber) {
    if (typeof FlexTour.actionsList[functionName] === "function") {
        return FlexTour.actionsList[functionName].call(this, FlexTour.currentTour[Constants.STEPS][stepNumber]);
    }
    // If the given function name exist in the list, return false to halt the process. Because this could cause the flow to break.
    return false;
}

/**
 * This is used to execute general functions in the framework: onStart, onExit, beforeStepRender, afterStepRender
 * @param functionName {String}     Given function name to execute from actionsList
 */
function _executeGeneralFunction(functionName) {
    if (typeof FlexTour.actionsList[functionName] === "function") {
        FlexTour.actionsList[functionName].call(this);
    }
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
    var tokens = prerequisite.split(Constants.COLON);

    // Split "condName" must be in the 1st slot after splitting at colon
    var condName = tokens[0];

    var temporaryResult = true;

    if (tokens.length > 1) {
        // Split the DOM elements list if exist "el1,el2,el3".
        var elementsList = tokens[1].split(Constants.COMMA);

        var indexOfCurrentTarget = elementsList.indexOf(Constants.CURRENT_TARGET);
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
        return _executeFunctionWithName(condName, stepNumber);
    }

    return temporaryResult;
}

/**
 * Factored function to check if the next step is allowed, if yes move to that step
 * @param stepNumber        Next step index number
 * @param prerequisiteNumber        The prerequisite to be checked
 */
function _precheckForTransition(stepNumber, prerequisiteNumber) {
    if (stepNumber >= FlexTour.currentTour[Constants.STEPS].length) {
        _exit(true);
    }
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
    Utils.removeELementsAndAttachedEvent(Constants.SKIP_BUTTON_TRIGGER, Constants.FLEX_CLICK);

    var skipToStep = FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber][Constants.SKIP];
    if (Utils.isValid(skipToStep)) {
        _precheckForTransition(skipToStep - 1, 0);
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
    var stepDelay = FlexTour.currentTour[Constants.STEPS][stepNumber][Constants.DELAY];

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
    Utils.addEvent($(window), Constants.FLEX_RESIZE, Utils.debounce(__rerenderResize, 500, false));
}

/**
 * CallBack function that get executed when window is resized
 * This event is only trigger once every 1/2 second. So that it won't go crazy and trigger too many event on resizing
 */
function __rerenderResize() {
    _removeEvents();
    FlexTour.Component.removeOverlays();
    _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber], false);
    _addClickEvents();
}

/**
 * Rerender current step.
 */
function __rerenderScroll() {
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
        _exit(false);
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
    Utils.addEvent($(window), Constants.SCROLL, Utils.debounce(__rerenderScroll, 200, false));
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
    var currentStep = FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber];
    if (!Utils.isValid(currentStep)) {
        return;
    }
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
        var buttons = currentStep[Constants.BUTTONS_CUS];
        for (var i = 0; i < buttons.length; i++) {
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
    var top = $(window).scrollTop();
    var left = $(window).scrollLeft();

    Utils.addEvent($(window), Constants.SCROLL, function (e) {
        e.preventDefault();
        $(window).scrollTop(top).scrollLeft(left);
    });
    // Re-render the components after the scrolling has been locked.
    Utils.debounce(__rerenderScroll, 10, true);
}

/**
 * Unblock scrolling so that it won't interfere with the application
 */
function _unblockScrolling() {
    Utils.removeEvent($(window), Constants.SCROLL);
}

/**
 * Attach event to pause the tour engine when users start dragging something.
 * Ondrop, the framework will check if the next step should be proceed, in case it's not --> stay at the same step
 * Syntax: {Boolean}. If it's set to true, it will temporarily remove all overlays and var users drag at will.
 * @param stepTarget {String}     DOM Selector string for current step target
 */
function _dragStartPause(stepTarget) {
    Utils.addEvent($(stepTarget), Constants.DRAG_START, _removeAndUnbind);
    Utils.addEvent($(stepTarget), Constants.DRAG_END, function () {
        __moveOnDropTarget(stepTarget);
    });
}

/**
 * Function that corresponds to drag end call.
 * @param stepTarget        The dragged element that is dropped
 */
function __moveOnDropTarget(stepTarget) {
    _dragEndResume(stepTarget);
    if (_isAllowToMove(FlexTour.currentStepNumber + 1, 0)) {
        _transitionToNextStep(FlexTour.currentStepNumber + 1);
    } else {
        _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber], true);
    }
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

    if (Utils.isValid(FlexTour.Component)) {
        FlexTour.Component.removeComponents();
    }
    FlexTour.running = false; // Reset this flag when users quit the tour
}

/**
 * Clean up everything when the tour is exited. This is to prevent memory leaks for attached events in DOM elements.
 * Remove all components and set the running flag to false, and set currentStepNumber to false
 * @param isDone: Boolean       Only set when users have finished the tour successfully.
 */
function _exit(isDone) {
    if (FlexTour.currentTour[Constants.PAUSE_ON_EXIT] && (!Utils.isValid(isDone) || !isDone)) {
        _saveCurrentTourState();
        Utils.setKeyValuePairLS(Constants.PAUSED_KEY, true);
    }
    _removeAndUnbind();
    FlexTour.currentStepNumber = 0;
    _executeGeneralFunction(Constants.ON_EXIT);
}

/**
 * Run the tour starting with the given step number.
 */
function _runTourWithGivenSteps() {
    var steps = FlexTour.currentTour[Constants.STEPS];
    if (Utils.isValid(steps)) {
        _precheckForTransition(FlexTour.currentStepNumber, 0);
    }
}

/**
 * Update the tour infor from LS. This is used for multipage and pause/resume feature for now
 */
function _updateTourInfoFromLS() {
    var previouslyRunTour = Utils.getKeyValuePairLS(Constants.STEP_STATUS);
    if (!$.isEmptyObject(previouslyRunTour)) {
        FlexTour.currentTourId = previouslyRunTour[Constants.PAUSED_TOUR];
        FlexTour.currentTour = $.extend(true, {}, FlexTour.toursMap[FlexTour.currentTourId]);
        FlexTour.currentStepNumber = previouslyRunTour[Constants.PAUSED_STEP];
        Utils.removeKeyValuePairLS(Constants.STEP_STATUS);
    }
}

/**
 * Save current state into local storage
 */
function _saveCurrentTourState() {
    var currentInfo = {
        pausedTour: FlexTour.currentTourId,
        pausedStep: FlexTour.currentStepNumber
    };
    Utils.setKeyValuePairLS(Constants.STEP_STATUS, currentInfo);
}

/**
 * This function will loop back until it finds a savePoint. This is to avoid executing every single step to find the available step.
 * Instead, what's going to happen is that the framework will try to find the current target. If it doesn't exist, it will loop back till it finds the closest save point.
 * When no save point is set, it will run from the beginning.
 *
 * Why? Since this framework is supposed to support dynamic tours which at some points the target only shows when a previous step triggers something (i.e: Click on a button to open a modal, or dropdown, etc.). In this example, you should set that button as savePoint because it is where you trigger your target.
 */
function _findSavePoint() {
    var steps = FlexTour.currentTour[Constants.STEPS];
    if (Utils.isValid(steps)) {
        var currentStepTarget = steps[FlexTour.currentStepNumber][Constants.TARGET];
        // If current step target cannot be found, loops back till you find the closest save point
        if (!(Utils.hasELement($(currentStepTarget)) && Utils.isVisible(currentStepTarget))) {
            --FlexTour.currentStepNumber;
            while (FlexTour.currentStepNumber > -1) {
                if (Utils.checkFlag(steps[FlexTour.currentStepNumber][Constants.SAVE_POINT])) {
                    break;
                }
                --FlexTour.currentStepNumber;
            }
        }
        _precheckForTransition(FlexTour.currentStepNumber, 0);
    }
}

/**
 * Constructor of the whole thing.
 * @param tourDesc      The JSON file that describe what the tours should be like
 * @param actionsList   The object contains all functions that control the flow of the tours
 * @param translation   The object contains all translated string for this tour, the content will be sub in
 * @constructor
 */
function FlexTour(tourDesc, actionsList, translation) {
    FlexTour.toursMap = {};
    FlexTour.currentTourId = "";
    FlexTour.currentStepNumber = 0;
    FlexTour.currentTour = {};
    FlexTour.actionsList = actionsList || {};
    FlexTour.translation = translation || {};
    FlexTour.running = false; // A flag that var the system know that a tour is being run
    _preprocessingTours(tourDesc);
}

/**
 * Run the tour, if it is multipage --> run the previously set step. This is ensured by dev that the next step will be successful.
 * If this is the first time you run the tour --> it will just run from step 1.
 */
FlexTour.prototype.run = function () {
    if ($.isEmptyObject(FlexTour.toursMap)) {
        return;
    }
    _executeGeneralFunction(Constants.ON_START);

    var multipageFlag = Utils.getKeyValuePairLS(Constants.MULTIPAGE);
    var pausedFlag = Utils.getKeyValuePairLS(Constants.PAUSED_KEY);
    if (Utils.checkFlag(pausedFlag)) {
        _updateTourInfoFromLS();
        Utils.removeKeyValuePairLS(Constants.PAUSED_KEY);
        // In case the step is both multipage trigger and paused on --> remove multipage trigger for now because it will be set later on.
        Utils.removeKeyValuePairLS(Constants.MULTIPAGE_KEY);
        _findSavePoint();
    } else if (Utils.checkFlag(multipageFlag)) {
        _updateTourInfoFromLS();
        Utils.removeKeyValuePairLS(Constants.MULTIPAGE_KEY);
        ++FlexTour.currentStepNumber;

        _runTourWithGivenSteps();
    } else {
        // You started a new tour --> just run the first step of new tour.
        FlexTour.currentTour = $.extend(true, {}, FlexTour.toursMap[FlexTour.currentTourId]);
        FlexTour.currentStepNumber = 0;

        _runTourWithGivenSteps();
    }
};

/**
 * User can trigger this function to end tour premature
 */
FlexTour.prototype.exit = function () {
    _exit(false);
};

/**
 * Store the current value of tour id and current step number. The terminate the framework
 */
FlexTour.prototype.pause = function () {
    _saveCurrentTourState();
    Utils.setKeyValuePairLS(Constants.PAUSED_KEY, true);
    this.exit();
};

/**
 * Resume the previously run tour with given id and the step number.
 * Resume to the previously run step ... not the step after it.
 */
FlexTour.prototype.resume = function () {
    _updateTourInfoFromLS();
    Utils.removeKeyValuePairLS(Constants.PAUSED_KEY);
    _findSavePoint();
};

module.exports = FlexTour;