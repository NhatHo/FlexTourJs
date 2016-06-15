/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

var Constants = require("./Constants");
var Utils = require("./Utilities");

function Components(stepDescription) {
    if (Utils.isValidStep(stepDescription)) {
        Components.stepDescription = Utils.clone({}, stepDescription);
        Components.rect = document.querySelector(stepDescription[Constants.TARGET]).getBoundingClientRect();
        Components.ui = document.createElement("div");
    }
}

/**
 * Get rect variable
 */
Components.prototype.getRect = function () {
    return Components.rect;
};

/**
 * Add top overlay into document body
 */
function _createTopOverlay() {
    let height = Components.rect.top;
    let width = document.body.getBoundingClientRect().width;

    // Put overlay on top left of the screen
    _createOverlayNode(width + Constants.PX, height + Constants.PX, 0 + Constants.PX, 0 + Constants.PX);
}

/**
 * Generate Bottom overlay rect
 */
function _createBottomOverlay() {
    let height = "100vh";
    let width = document.body.getBoundingClientRect().width;

    // Put over on the bottom of target rect
    _createOverlayNode(width + Constants.PX, height, Components.rect.top + Components.rect.height + Constants.PX, 0 + Constants.PX);
}

/**
 * Generate Left overlay rect
 */
function _createLeftOverlay() {
    let height = Components.rect.height;
    let width = Components.rect.left;

    // Put overlay over space on the left of target
    _createOverlayNode(width + Constants.PX, height + Constants.PX, Components.rect.top + Constants.PX, 0 + Constants.PX);
}

/**
 * Add Right overlay next to target rect
 */
function _createRightOverlay() {
    let height = Components.rect.height;
    let width = document.body.getBoundingClientRect().width - Components.rect.left - Components.rect.width;

    // Put overlay on the top right of the target rect
    _createOverlayNode(width + Constants.PX, height + Constants.PX, Components.rect.top + Constants.PX, Components.rect.left + Components.rect.width + Constants.PX);
}

/**
 * Generate generic overlay from given width, height, top and left
 * @param width     The width of current overlay
 * @param height    The height of current overlay
 * @param top       Top location of current overlay
 * @param left      Left location of current overlay
 */
function _createOverlayNode(width, height, top, left) {
    let overlay = document.createElement("div");
    overlay.classList.add(Constants.OVERLAY_STYLE);
    overlay.style.width = width;
    overlay.style.height = height;
    overlay.style.top = top;
    overlay.style.left = left;

    Components.ui.appendChild(overlay);
}

/**
 * Add all overlays around target for better visual
 */
function _addOverlays() {
    _createTopOverlay();
    _createBottomOverlay();
    _createLeftOverlay();
    _createRightOverlay();
}

/**
 * Remove all overlays from document body for cleaning up
 */
function _removeAllOverlay() {
    let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
    for (let i = 0; i < overlays.length; i++) {
        Components.ui.removeChild(overlays[i]);
    }
}

/**
 * Create content bubble next to target to display the content of the step
 * @param {boolean} isLastStep  True if it is the last step of the tour
 */
function _createContentBubble(isLastStep) {
    let targetPosition = Components.rect;
    let top = targetPosition.top;
    let left = targetPosition.left;
    let bottom = top + targetPosition.height;
    let right = left + targetPosition.width;

    let bubble = document.createElement("div");

    let iconDiv = document.createElement("div");
    iconDiv.classList.add(Constants.ICON);

    bubble.appendChild(iconDiv);

    let contentDiv = document.createElement("p");
    contentDiv.innerText = Components.stepDescription[Constants.CONTENT];

    bubble.classList.add(Constants.TOUR_BUBBLE);

    switch (Components.stepDescription[Constants.POSITION]) {
        case Constants.TOP:
            bubble.classList.add(Constants.TOP);
            break;
        case Constants.RIGHT:
            bubble.classList.add(Constants.RIGHT);
            break;
        case Constants.LEFT:
            bubble.classList.add(Constants.LEFT);
            break;
        default: // This is either bottom or something that doesn't exist
            bubble.classList.add(Constants.BOTTOM);
            break;
    }
    bubble.appendChild(contentDiv);

    if (!Utils.isValid(Components.stepDescription[Constants.NEXT_ON_TARGET]) && !Utils.isValid(Components.stepDescription[Constants.NO_BUTTONS])) {
        let buttonGroup = document.createElement("div");
        buttonGroup.classList.add(Constants.BUTTON_GROUP);

        if (!Utils.isValid(Components.stepDescription[Constants.NO_SKIP])) {
            let skipButton = document.createElement("button");
            skipButton.classList.add(Constants.SKIP_BUTTON);
            buttonGroup.appendChild(skipButton);
        }

        if (!Utils.isValid(Components.stepDescription[Constants.NO_BACK])) {
            let backButton = document.createElement("button");
            backButton.classList.add(Constants.BACK_BUTTON);
            buttonGroup.appendChild(backButton);
        }

        if (!Utils.isValid(Components.stepDescription[Constants.NO_NEXT]) && !isLastStep) {
            // Unlikely to be used
            let nextButton = document.createElement("button");
            nextButton.classList.add(Constants.NEXT_BUTTON);
            buttonGroup.appendChild(nextButton);
        }

        if (isLastStep) {
            let doneButton = document.createElement("button");
            doneButton.classList.add(Constants.DONE_BUTTON);
            buttonGroup.appendChild(doneButton);
        }
        bubble.appendChild(buttonGroup);
    }

    let closeButton = document.createElement("a");
    closeButton.appendChild(document.createTextNode(Constants.EMPTY));
    closeButton.classList.add(Constants.CLOSE_TOUR);

    bubble.appendChild(closeButton);

    Components.ui.appendChild(bubble);
}

/**
 * Remove content bubble from document body for cleaning up
 */
function _clearContentBubble() {
    let contentBubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE);
    Components.ui.removeChild(contentBubble);
}

/**
 * Create a border around target by generating an overlay over target. The overlay can be clicked through only when the step can be interated or triggerable
 */
function _addBorderAroundTarget() {
    if (Utils.isValid(Components.rect)) {

        let borderOverlay = document.createElement("div");
        borderOverlay.classList.add(Constants.TARGET_BORDER);
        borderOverlay.width = Components.rect.width + Constants.BORDER_WIDTH * 2;
        borderOverlay.height = Components.rect.height + Constants.BORDER_WIDTH * 2;
        borderOverlay.top = Components.rect.top - Constants.BORDER_WIDTH;
        borderOverlay.left = Components.rect.left - Constants.BORDER_WIDTH;

        if (Components.stepDescription[Constants.CAN_INTERACT]) {
            borderOverlay.classList.add(Constants.TARGET_INTERACTABLE);
        }

        Components.ui.appendChild(borderOverlay);
    }
}

/**
 * Clear the border around target for cleaning up
 */
function _clearBorderAroundTarget() {
    let borderOverlay = Utils.getEleFromClassName(Constants.TARGET_BORDER);
    Components.ui.removeChild(borderOverlay);
}

/**
 * Main function to create overlays, border around target and the content bubble next to target
 * @param isLastStep        True if current step is last step, false otherwise
 */
Components.prototype.createComponents = function (isLastStep) {
    debugger;
    _addOverlays();
    _addBorderAroundTarget();
    _createContentBubble(isLastStep);
    document.body.appendChild(Components.ui);
};

/**
 * Main function to clean up the components that were added into the DOM.
 */
Components.prototype.removeComponents = function () {
    _removeAllOverlay();
    _clearBorderAroundTarget();
    _clearContentBubble();
    document.body.removeChild(Components.ui);
};

module.exports = Components;