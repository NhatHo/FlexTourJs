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
        currentStep[Constants.NO_NEXT] = currentStep[Constants.NO_NEXT] || rawTour[Constants.NO_NEXT];
        currentStep[Constants.NO_BACK] = currentStep[Constants.NO_BACK] || rawTour[Constants.NO_BACK];
        currentStep[Constants.NO_SKIP] = currentStep[Constants.NO_SKIP] || rawTour[Constants.NO_SKIP];
        currentStep[Constants.CAN_INTERACT] = currentStep[Constants.CAN_INTERACT] || currentStep[Constants.NEXT_ON_TARGET] || rawTour[Constants.CAN_INTERACT]; // This mean that if target can trigger next step on click, it must be clickable
        currentStep[Constants.TIME_INTERVAL] = currentStep[Constants.TIME_INTERVAL] || rawTour[Constants.TIME_INTERVAL];
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
            showNext = false;
        let currentStep = FlexTour.currentStep;
        let numberOfStep = FlexTour.currentTour[Constants.STEPS].length;
        if (currentStep > 0) {
            showBack = true;
        }
        if (currentStep < numberOfStep - 1) {
            showNext = true;
        }

        if (currentStep < numberOfStep - 2) {
            showSkip = true;
        }

        FlexTour.Component.createComponents(showSkip, showBack, showNext);

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
    let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
    for (let i = 0; i < overlays.length; i++) {
        Utils.addEvent(overlays[i], Constants.FLEX_CLICK, _cleanUp);
    }

    let skipButton = Utils.getEleFromClassName(Constants.SKIP_BUTTON);
    if (Utils.isValid(skipButton)) {
        Utils.addEvent(skipButton, Constants.FLEX_CLICK, _skipStep);
    }

    let backButton = Utils.getEleFromClassName(Constants.BACK_BUTTON);
    if (Utils.isValid(backButton)) {
        Utils.addEvent(backButton, Constants.FLEX_CLICK, _previousStep);
    }

    let nextButton = Utils.getEleFromClassName(Constants.NEXT_BUTTON);
    if (Utils.isValid(nextButton)) {
        Utils.addEvent(nextButton, Constants.FLEX_CLICK, _nextStep);
    }

    let doneButton = Utils.getEleFromClassName(Constants.DONE_BUTTON);
    if (Utils.isValid(doneButton)) {
        Utils.addEvent(doneButton, Constants.FLEX_CLICK, _cleanUp);
    }

    let closeButton = Utils.getEleFromClassName(Constants.CLOSE_TOUR);
    if (Utils.isValid(closeButton)) {
        Utils.addEvent(closeButton, Constants.FLEX_CLICK, _cleanUp);
    }
}

/**
 * Remove all attached event to avoid leaking memories
 */
function _removeEvents() {
    let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
    for (let i = 0; i < overlays.length; i++) {
        Utils.removeEvent(overlays[i], Constants.FLEX_CLICK, _cleanUp);
    }

    let skipButton = Utils.getEleFromClassName(Constants.SKIP_BUTTON);
    if (Utils.isValid(skipButton)) {
        Utils.removeEvent(skipButton, Constants.FLEX_CLICK, _skipStep);
    }

    let backButton = Utils.getEleFromClassName(Constants.BACK_BUTTON);
    if (Utils.isValid(backButton)) {
        Utils.removeEvent(backButton, Constants.FLEX_CLICK, _previousStep);
    }

    let nextButton = Utils.getEleFromClassName(Constants.NEXT_BUTTON);
    if (Utils.isValid(nextButton)) {
        Utils.removeEvent(nextButton, Constants.FLEX_CLICK, _nextStep);
    }

    let doneButton = Utils.getEleFromClassName(Constants.DONE_BUTTON);
    if (Utils.isValid(doneButton)) {
        Utils.removeEvent(doneButton, Constants.FLEX_CLICK, _cleanUp);
    }

    let closeButton = Utils.getEleFromClassName(Constants.CLOSE_TOUR);
    if (Utils.isValid(closeButton)) {
        Utils.removeEvent(closeButton, Constants.FLEX_CLICK, _cleanUp);
    }
}

/**
 * Skip the next step to the next next step.
 * @private
 */
function _skipStep() {
    _cleanUp();
    FlexTour.currentStep += 2;
    _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStep]);
}

/**
 * Decrement current step counter and go back to previous step ... Obviously it will not be the last step
 */
function _previousStep() {
    _cleanUp();
    FlexTour.currentStep--;
    _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStep]);
}

/**
 * Trigger next step of the tour. If the next step is the last step, trigger the isLastStep flag
 */
function _nextStep() {
    _cleanUp();
    FlexTour.currentStep++;
    _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStep]);
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

function FlexTour(tourDesc) {
    FlexTour.toursMap = [];
    FlexTour.currentTourIndex = 0;
    FlexTour.currentStep = 0;
    FlexTour.currentTour = {};
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
    FlexTour.currentStep = 0;

    let steps = FlexTour.currentTour[Constants.STEPS];
    if (Utils.isValid(steps)) {
        let firstStep = steps[FlexTour.currentStep];
        _centralOrganizer(firstStep);
    }
};

FlexTour.prototype.exit = function () {
    _cleanUp();
};

module.exports = FlexTour;