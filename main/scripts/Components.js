/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

var Constants = require("./Constants");
var Utils = require("./Utilities");

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