/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

let Components = require("./Components");
let Constants = require("./Constants");
let Utils = require("./Utilities");

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
    if (Utils.isValid(FlexTour.Component) && Utils.isValid(FlexTour.Component.getRect())) {
        let showSkip = false,
            showBack = false,
            showNext = false,
            disableNext = false;

        let currentStepNumber = FlexTour.currentStepNumber;
        // When the current step has NextOnTarget flag set, assuming that this step setup prerequisite for next step
        // Which means that user cannot click Next, or Skip.

        if (!stepDesc[Constants.NO_BUTTONS]) {
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
        }

        FlexTour.Component.createComponents(showSkip, showBack, showNext, disableNext);

        _addClickEvents();
        _addResizeWindowListener();
    } else {
        console.log("Target of step: " + JSON.stringify(stepDesc) + " is not found.");
    }
}

/**
 * Attached all necessary handlers to the elements
 */
function _addClickEvents() {
    Utils.getElementsAndAttachEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK, _cleanUp);

    Utils.getElementsAndAttachEvent(Constants.SKIP_BUTTON, Constants.FLEX_CLICK, _skipStep);

    Utils.getElementsAndAttachEvent(Constants.BACK_BUTTON, Constants.FLEX_CLICK, _previousStep);

    Utils.getElementsAndAttachEvent(Constants.NEXT_BUTTON, Constants.FLEX_CLICK, _nextStep);

    Utils.getElementsAndAttachEvent(Constants.DONE_BUTTON, Constants.FLEX_CLICK, _cleanUp);

    Utils.getElementsAndAttachEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK, _cleanUp);

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
    Utils.removeELementsAndAttachedEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK, _cleanUp);

    Utils.removeELementsAndAttachedEvent(Constants.SKIP_BUTTON, Constants.FLEX_CLICK, _skipStep);

    Utils.removeELementsAndAttachedEvent(Constants.BACK_BUTTON, Constants.FLEX_CLICK, _previousStep);

    Utils.removeELementsAndAttachedEvent(Constants.NEXT_BUTTON, Constants.FLEX_CLICK, _nextStep);

    Utils.removeELementsAndAttachedEvent(Constants.DONE_BUTTON, Constants.FLEX_CLICK, _cleanUp);

    Utils.removeELementsAndAttachedEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK, _cleanUp);

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
 * IMPORTANT: This is only used for Next and Skip, it's the developer job to know if the previous step can be reached. If the previous step should not be REACHED, set "noBack: true" in step description.
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

    if (Utils.isValid(prerequisites) && currPrerequisite < prerequisites.length) {
        let prerequisite = prerequisites[currPrerequisite].trim();
        if (prerequisite.indexOf(Constants.WAIT) > -1) {
            let possibleStep = FlexTour.currentTour[Constants.STEPS][possibleStepNumber];

            // This is the most complex one in all. There are 3 parts to waitFor: "?condName:el1,el2,el3"
            // First split the COLON Separator.
            let tokens = prerequisite.split(Constants.COLON);

            // Split "?condName" and get "condName"
            let condName = tokens[0].split(Constants.WAIT)[1];

            // Split the DOM elements list if exist "el1,el2,el3".
            let elementsList = tokens[1].split(Constants.COMMA);

            let indexOfCurrentTarget = elementsList.indexOf(Constants.CURRENT_TARGET);
            if (indexOfCurrentTarget !== -1) {
                elementsList[indexOfCurrentTarget] = possibleStep[Constants.TARGET];
            }

            let temporaryResult = true;
            if (condName === Constants.IS_VISIBLE) {
                temporaryResult = temporaryResult && Utils.isVisible(elementsList);
            } else if (condName === Constants.DOES_EXIST) {
                temporaryResult = temporaryResult && Utils.doesExist(elementsList);
                console.log("Does exist condition, return " + temporaryResult);
            } else {
                // When the condition name is not built-in, pass the array of element into the customized functions.
                if (typeof FlexTour.actionsList[condName] === "function") {
                    temporaryResult = temporaryResult && FlexTour.actionsList[condName].apply(this, elementsList);
                    console.log("Custom function: " + condName + " return: " + temporaryResult);
                }
            }

            if (!temporaryResult) {
                if (possibleStep[Constants.RETRIES] === 0) {
                    // Reset the retries entry for current step, only works if Retries is set on Tour Description
                    if (FlexTour.currentTour.hasOwnProperty(Constants.RETRIES)) {
                        possibleStep[Constants.RETRIES] = FlexTour.currentTour[Constants.RETRIES];
                    }
                    return temporaryResult; // Return false when retries reaches 0;
                } else {
                    --possibleStep[Constants.RETRIES];
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
            // The syntax is: "!funcName". For sure the 2nd element after split is funcName
            // IMPORTANT: as mentioned before, this should be the last on the list. When this is true it will autmatically increment the FlexTour.currentStepNumber to 2 steps ahead which effectively skip the current possible step.
            let funcName = prerequisite.split(Constants.SKIP)[1].trim();
            console.log("Skip function: " + funcName + " returned: " + Utils.executeFunctionWithName(funcName, FlexTour.actionsList));
            if (Utils.executeFunctionWithName(funcName, FlexTour.actionsList)) {
                _transitionToNextStep(possibleStepNumber + 1);
                return true;
            }
            return false;
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
    _transitionToNextStep(FlexTour.currentStepNumber - 1, 0);
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
        _cleanUp();
        FlexTour.currentStepNumber = stepNumber;
        _centralOrganizer(FlexTour.currentTour[Constants.STEPS][stepNumber]);
    }

    if (Utils.isValid(stepDelay)) {
        setTimeout(__transitionFunction.bind(this, stepNumber), stepDelay);
    } else {
        __transitionFunction(stepNumber);
    }
}

/**
 * Add window resize event to recalculate location of tour step.
 * The event is namespaced to avoid conflict with program's handler and easier to unbind later on.
 */
function _addResizeWindowListener() {
    Utils.addEvent(window, Constants.FLEX_RESIZE, function (event) {
        console.log("Doing resizing window event");
    });
}

/**
 * Remove resize listener from window without detaching other handlers from main program
 */
function _unbindResizeWindowListener() {
    Utils.removeEvent(window, Constants.FLEX_RESIZE);
}

/**
 * Clean up everything in the DOM from running the tour
 */
function _cleanUp() {
    _removeEvents();
    _unbindResizeWindowListener();

    FlexTour.Component.removeComponents();
}

function FlexTour(tourDesc, actionsList) {
    FlexTour.toursMap = [];
    FlexTour.currentTourIndex = 0;
    FlexTour.currentStepNumber = 0;
    FlexTour.currentTour = {};
    FlexTour.actionsList = actionsList;
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
    _cleanUp();
};

module.exports = FlexTour;