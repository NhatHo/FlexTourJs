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
 * @param {boolean} showSkip  True to show skip button
 * @param {boolean} showBack  True to show Back Button
 * @param {boolean} showNext  True to show Next Button, False to show Done Button
 */
function _createContentBubble(showSkip, showBack, showNext) {
    let bubble = document.createElement("div");

    let iconDiv = document.createElement("div");
    iconDiv.classList.add(Constants.ICON);

    bubble.appendChild(iconDiv);

    let contentDiv = document.createElement("p");
    contentDiv.innerText = Components.stepDescription[Constants.CONTENT];
    contentDiv.classList.add(Constants.BUBBLE_CONTENT);

    bubble.classList.add(Constants.TOUR_BUBBLE);

    bubble.appendChild(contentDiv);

    if (!Components.stepDescription[Constants.NEXT_ON_TARGET] && !Components.stepDescription[Constants.NO_BUTTONS]) {
        let buttonGroup = document.createElement("div");
        buttonGroup.classList.add(Constants.BUTTON_GROUP);

        let emptyButton = document.createElement("span");
        emptyButton.classList.add(Constants.EMPTY_BUTTON);
        emptyButton.innerHTML = Constants.EMPTY;

        if (!Components.stepDescription[Constants.NO_SKIP] && showSkip) {
            let skipButton = document.createElement("button");
            skipButton.classList.add(Constants.SKIP_BUTTON);
            skipButton.innerHTML = Constants.SKIP_TEXT;
            buttonGroup.appendChild(skipButton);
        } else {
            buttonGroup.appendChild(emptyButton);
        }


        if (!Components.stepDescription[Constants.NO_BACK] && showBack) {
            let backButton = document.createElement("button");
            backButton.classList.add(Constants.BACK_BUTTON);
            backButton.innerHTML = Constants.BACK_TEXT;
            buttonGroup.appendChild(backButton);
        } else {
            buttonGroup.appendChild(emptyButton);
        }

        if (!Components.stepDescription[Constants.NO_NEXT] && showNext) {
            let nextButton = document.createElement("button");
            nextButton.classList.add(Constants.NEXT_BUTTON);
            nextButton.innerHTML = Constants.NEXT_TEXT;
            buttonGroup.appendChild(nextButton);
        }

        if (!showNext) {
            let doneButton = document.createElement("button");
            doneButton.classList.add(Constants.DONE_BUTTON);
            doneButton.innerHTML = Constants.DONE_TEXT;
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
 * Find the current location of the bubble and modify it to point at correct target
 * Also, create the arrow according to the position defined by user
 */
function _placeBubbleLocation() {
    let targetPosition = Components.rect;
    let top = targetPosition.top;
    let left = targetPosition.left;
    let bottom = top + targetPosition.height;
    let right = left + targetPosition.width;

    let bubble = document.querySelector(Utils.getClassName(Constants.TOUR_BUBBLE));

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
                bubble.style.left = right + Constants.ARROW_SIZE + Constants.PX;
                break;
            case Constants.LEFT:
                arrow.classList.add(Constants.LEFT);
                bubble.style.left = Components.rect.left - bubbleRect.width - Constants.ARROW_SIZE + Constants.PX;
                bubble.style.top = Components.rect.top + halfTargetHeight - halfBubbleHeight + Constants.PX;
                break;
            default: // This is either bottom or something that doesn't exist
                arrow.classList.add(Constants.BOTTOM);
                bubble.style.top = bottom + Constants.ARROW_SIZE + Constants.PX;
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
 * Clear the border around target for cleaning up
 */
function _clearBorderAroundTarget() {
    let borderOverlay = Utils.getEleFromClassName(Constants.TARGET_BORDER);
    Components.ui.removeChild(borderOverlay);
}

/**
 * Main function to create overlays, border around target and the content bubble next to target
 * @param showSkip        True to show Skip button
 * @param showBack        True to show Back Button
 * @param showNext        True to show NExt Button, false will show Done button
 */
Components.prototype.createComponents = function (showSkip, showBack, showNext) {
    _addOverlays();
    _addBorderAroundTarget();
    _createContentBubble(showSkip, showBack, showNext);
    document.body.appendChild(Components.ui);
    _placeBubbleLocation();
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