/**
 * Created by NhatHo on 2016-06-01.
 */

import * as Components from "./Components";
import * as Constants from "./Constants";
import * as Utils from "./Utilities";

/**
 * Pre-process all information for all tours make sure each step and each tour contains necessary
 * information for subsequent steps
 * @param tourDesc      JSON description file that has all information needed
 */
function _preprocessingTours(tourDesc) {
    let _tourDesc = Utils.deepClone({}, tourDesc);

    for (let i = 0; i < _tourDesc.length; i++) {
        let rawTour = _tourDesc[i];

        // Fill in information for each tour in case any important information is missing
        rawTour[Constants.ID] = rawTour[Constants.ID] || Constants.TOUR + i;
        rawTour = Utils.deepClone({}, Constants.TOUR_DEFAULT_SETTINGS, rawTour);

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
        this.toursMap.push(rawTour);
    }
}

/**
 * This is the head quarter of displaying steps, overlay, and other things.
 * Tags: CENTRAL, ORGANIZER, RUNNER
 * @param stepDesc          Description object of current step to be run
 * @param isLastStep        Indicator whether current step is the last step of tour
 */
function _centralOrganizer(stepDesc, isLastStep) {
    let component = new Components(stepDesc);
    if (Utils.isValid(component.rect)) {
        component.addOverlays();
        component.addBorderAroundTarget(stepDesc[Constants.CAN_INTERACT]);
        component.createContentBubble(isLastStep);

        _addClickEvents();
        _addResizeWindowListener();
    } else {
        console.log("Target of step: " + JSON.stringify(stepDesc) + " is not found.");
    }
}

/**
 * Attached all necessary handlers to the elements
 */
function _addClickEvents(isLastStep) {
    let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
    for (let overlay in overlays) {
        Utils.addEvent(overlay, Constants.FLEX_CLICK, _cleanUp);
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
    for (let overlay in overlays) {
        Utils.removeEvent(overlay, Constants.FLEX_CLICK, _cleanUp);
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

// TODO: skip a step but make sure the step ahead condition is met ... maybe display a message
function _skipStep() {

}

/**
 * Decrement current step counter and go back to previous step ... Obviously it will not be the last step
 */
function _previousStep() {
    _cleanUp();
    this.currentStep--;
    if (this.currentStep >= 0 && this.currentTour[Constants.STEPS][this.currentStep]) {
        _centralOrganizer(this.currentTour[Constants.STEPS][this.currentStep], false);
    }
}

/**
 * Trigger next step of the tour. If the next step is the last step, trigger the isLastStep flag
 */
function _nextStep() {
    _cleanUp();
    this.currentStep++;

    let steps = this.currentTour[Constants.STEPS];

    if (this.currentStep >= steps.length - 1) {
        _centralOrganizer(this.currentTour[Constants.STEPS][this.currentStep], true);
    } else {
        _centralOrganizer(this.currentTour[Constants.STEPS][this.currentStep], false);
    }
}

/**
 * Add window resize event to recalculate location of tour step.
 * The event is namespaced to avoid conflict with program's handler and easier to unbind later on.
 */
function _addResizeWindowListener() {
    this.addEvent(window, Constants.FLEX_RESIZE, function (event) {
        console.log("Doing resizing window event");
    });
}

/**
 * Remove resize listener from window without detaching other handlers from main program
 */
function _unbindResizeWindowListener() {
    this.removeEvent(window, Constants.FLEX_RESIZE);
}

/**
 * Clean up everything in the DOM from running the tour
 */
function _cleanUp() {
    _removeEvents();
    _unbindResizeWindowListener();

    Components.removeAllOverlay();
    Components.clearContentBubble();
    Components.clearBorderAroundTarget();
}

module.exports = {
    Framework: function (tourDesc) {
        this.toursMap = [];
        this.currentTourIndex = -1;
        this.currentStep = 0;
        this.currentTour = {};

        _preprocessingTours(tourDesc);
    },

    /**
     * Run the first step of the tour
     */
    run: function () {
        if (this.currentTourIndex < 0) {
            console.log("There is NOT any available tour to run.");
            return;
        }

        this.currentTour = Utils.clone({}, this.toursMap[this.currentTourIndex]);
        this.currentStep = 0;

        let steps = this.currentTour[Constants.STEPS];
        if (Utils.isValid(steps)) {
            let firstStep = steps[this.currentStep];
            _centralOrganizer(firstStep);
        }
        console.log("Tour does NOT contain any step to display.");
    },

    /**
     * Exit the current tour engine
     */
    exit: function () {
        _cleanUp();
    }
};
