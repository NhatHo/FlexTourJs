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
    } else {
        console.log("Target of step: " + JSON.stringify(stepDesc) + " is not found.");

    }
}

/**
 *
 * @param isLastStep
 * @private
 */
function _addClickEvents(isLastStep) {
    let overlays = document.querySelectorAll(Utils.getClassName(Constants.OVERLAY_STYLE));
    for (let overlay in overlays) {

    }

}

module.exports = {
    Framework: function (tourDesc) {
        this.toursMap = [];
        this.currentTourIndex = -1;
        this.currentStep = 0;
        this.currentTour = {};

        _preprocessingTours(tourDesc);
    },

    run: function (tourId) {
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
    }
};
