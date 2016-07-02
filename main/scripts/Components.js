/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

let Constants = require("./Constants");
let Utils = require("./Utilities");
let $ = require("./../../node_modules/jquery/dist/jquery.min");

function Components(stepDescription) {
    Components.stepDescription = $.extend({}, stepDescription);
    Components.ui = $(Constants.DIV_COMP);
    Components.ui.addClass(Constants.FLEXTOUR);
    if (Utils.isStepWithTarget(stepDescription)) {
        let target = $(stepDescription[Constants.TARGET]);
        let actualLocation = {};
        actualLocation.top = target.offset().top;
        actualLocation.left = target.offset().left;
        actualLocation.width = target.outerWidth();
        actualLocation.height = target.outerHeight();
        actualLocation.right = actualLocation.left + actualLocation.width;
        actualLocation.bottom = actualLocation.top + actualLocation.height;

        Components.rect = actualLocation;
    }
}

/**
 * Add top overlay into document body
 */
function _getTopOverlay() {
    return {
        width: Utils.getFullWindowWidth() + Constants.PX,
        height: Components.rect.top - Constants.BORDER_WIDTH + Constants.PX,
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
        height: Utils.getFullWindowHeight() - Components.rect.bottom - Constants.BORDER_WIDTH + Constants.PX,
        top: Components.rect.bottom + Constants.BORDER_WIDTH + Constants.PX,
        left: 0
    };
}

/**
 * Generate Left overlay rect
 */
function _getLeftOverlay() {
    // Put overlay over space on the left of target
    // Reason for adding Overlap height is that because we use 4 separated overlays constructed based on target
    // There is a really high chance that the overlays are not fit perfectly --> a small thin line will show --> UGLY.
    // We set this overlay overlap the top and bottom overlay, and make them blend together to cover the thin line. 1px would work
    return {
        width: Components.rect.left - Constants.BORDER_WIDTH + Constants.PX,
        height: Components.rect.height + Constants.OVERLAP_HEIGHT * 2 + Constants.BORDER_WIDTH * 2 + Constants.PX,
        top: Components.rect.top - Constants.OVERLAP_HEIGHT - Constants.BORDER_WIDTH + Constants.PX,
        left: 0
    };
}

/**
 * Add Right overlay next to target rect
 */
function _getRightOverlay() {
    // Reason for adding Overlap height is that because we use 4 separated overlays constructed based on target
    // There is a really high chance that the overlays are not fit perfectly --> a small thin line will show --> UGLY.
    // We set this overlay overlap the top and bottom overlay, and make them blend together to cover the thin line. 1px would work
    return {
        width: Utils.getFullWindowWidth() - Components.rect.right - Constants.BORDER_WIDTH + Constants.PX,
        height: Components.rect.height + Constants.OVERLAP_HEIGHT * 2 + Constants.BORDER_WIDTH * 2 + Constants.PX,
        top: Components.rect.top - Constants.OVERLAP_HEIGHT - Constants.BORDER_WIDTH + Constants.PX,
        left: Components.rect.right + Constants.BORDER_WIDTH + Constants.PX
    };
}

/**
 * Generate generic overlay from given width, height, top and left
 * @param locationObj     Object that contains width, height, top and left attributes for overlay
 * @return {object|*}       The DOM block that contains all overlays
 */
function _createOverlayNode(locationObj) {
    let overlay = $(Constants.DIV_COMP, {
        "class": Constants.OVERLAY_STYLE,
        "width": locationObj.width,
        "height": locationObj.height
    });
    overlay.css({top: locationObj.top, left: locationObj.left});
    return overlay;
}

/**
 * Add all overlays around target for better visual
 * Keep the same pattern as the padding. Top->Right->Bottom->Left
 */
function _addOverlays() {
    let overlayDiv = Utils.getEleFromClassName(Constants.OVERLAY_BLOCK, true);
    if (!Utils.hasELement(overlayDiv)) {
        overlayDiv = $(Constants.DIV_COMP, {
            "class": Constants.OVERLAY_BLOCK
        });
    }
    overlayDiv.append(_createOverlayNode(_getTopOverlay()));
    overlayDiv.append(_createOverlayNode(_getRightOverlay()));
    overlayDiv.append(_createOverlayNode(_getBottomOverlay()));
    overlayDiv.append(_createOverlayNode(_getLeftOverlay()));

    overlayDiv.appendTo(Components.ui);
}

/**
 * Modify the current DOM Node to the new location, this will help with transition animation
 * @param domNode       The DOM Node of current lement
 * @param locationObj   The object contains the width, height, top and left of the destination
 */
function _modifyOverlayNode(domNode, locationObj) {
    $(domNode).css({
        width: locationObj.width,
        height: locationObj.height,
        top: locationObj.top,
        left: locationObj.left
    });
}

/**
 * This function assumes that there are 4 different overlays around the target to modify for the transition.
 */
function _modifyOverlays() {
    let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
    if (Utils.hasELement(overlays) && overlays.length === 4) {
        _modifyOverlayNode(overlays[0], _getTopOverlay());
        _modifyOverlayNode(overlays[1], _getRightOverlay());
        _modifyOverlayNode(overlays[2], _getBottomOverlay());
        _modifyOverlayNode(overlays[3], _getLeftOverlay());
    } else {
        overlays.remove();
        _addOverlays();
    }
}

/**
 * This function is used for floating step which doesn't have a target and the bubble float in the middle of the screen.
 * Check if already there is a UNIQUE Overlay in the DOM, if yes don't do anyway, if not create 1 and add to the DOM
 */
function _addOverlay() {
    let overlayDiv = $(Constants.DIV_COMP, {
        "class": Constants.OVERLAY_BLOCK
    });
    overlayDiv(_createOverlayNode({
        width: Utils.getFullWindowWidth() + Constants.PX,
        height: Utils.getFullWindowHeight() + Constants.PX,
        top: 0,
        left: 0
    }));
    overlayDiv.appendTo(Components.ui);
}

/**
 * Check if there are 4 overlays, remove them all then add a single overlay.
 * If there is exactly 1 overlay, leave it be because it already covers the whole screen.
 */
function _modifyOverlay() {
    let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
    let overlayDiv = Utils.getEleFromClassName(Constants.OVERLAY_BLOCK, true);
    if (Utils.hasELement(overlays)) {
        if (overlays.length !== 1) {
            overlays.remove();
            overlayDiv.append(_createOverlayNode({
                width: Utils.getFullWindowWidth() + Constants.PX,
                height: Utils.getFullWindowHeight() + Constants.PX,
                top: 0,
                left: 0
            }));
        }
    }
}

/**
 * Create content bubble next to target to display the content of the step
 * @param {boolean} noButtons  True will hide all buttons
 * @param {boolean} showBack  True to show Back Button
 * @param {boolean} showNext  True to show Next Button, False to show Done Button
 * @param {boolean} disableNext  True to disable either Next or Done button
 * @param {String} skipButtonText   The NLS text for Skip button
 * @param {String} backButtonText   The NLS text for Back button
 * @param {String} nextButtonText   The NLS text for Next button
 * @param {String} doneButtonText   The NLS text for Done button
 */
function _createContentBubble(noButtons, showBack, showNext, disableNext, skipButtonText, backButtonText, nextButtonText, doneButtonText) {
    let bubble = $(Constants.DIV_COMP, {
        "class": Constants.TOUR_BUBBLE
    });

    $(Constants.DIV_COMP, {
        "class": Constants.ICON_STYLE + " " + _getIconType()
    }).appendTo(bubble);

    let contentBlock = $(Constants.DIV_COMP, {
        "class": Constants.BUBBLE_CONTENT
    });

    if (Utils.isValid(Components.stepDescription[Constants.TITLE])) {
        $(Constants.DIV_COMP, {
            "class": Constants.BUBBLE_TITLE,
            html: Components.stepDescription[Constants.TITLE]
        }).appendTo(contentBlock);
    }

    $(Constants.DIV_COMP, {
        "class": Constants.BUBBLE_CONTENT_BODY,
        html: Components.stepDescription[Constants.CONTENT]
    }).appendTo(contentBlock);

    bubble.append(contentBlock);

    if (!noButtons) {
        let buttonGroup = $(Constants.DIV_COMP, {
            "class": Constants.BUTTON_GROUP
        });

        if (Utils.isValid(Components.stepDescription[Constants.SKIP])) {
            $(Constants.BUTTON_COMP, {
                "class": Constants.SKIP_BUTTON,
                text: skipButtonText
            }).appendTo(buttonGroup);
        }

        $(Constants.BUTTON_COMP, {
            "class": Constants.BACK_BUTTON,
            text: backButtonText,
            disabled: !showBack
        }).appendTo(buttonGroup);

        if (showNext) {
            $(Constants.BUTTON_COMP, {
                "class": Constants.NEXT_BUTTON,
                text: nextButtonText,
                disabled: disableNext
            }).appendTo(buttonGroup);
        } else {
            $(Constants.BUTTON_COMP, {
                "class": Constants.DONE_BUTTON,
                text: doneButtonText,
                disabled: disableNext
            }).appendTo(buttonGroup);
        }

        bubble.append(buttonGroup);
    }

    $(Constants.A_COMP, {
        "class": Constants.CLOSE_TOUR,
        html: Constants.TIMES
    }).appendTo(bubble);

    Components.ui.append(bubble);
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
 * @param {boolean} showBack  True to show Back Button
 * @param {boolean} showNext  True to show Next Button, False to show Done Button
 * @param {boolean} disableNext  True to disable either Next or Done button
 * @param {String} skipButtonText   The NLS text for Skip button
 * @param {String} backButtonText   The NLS text for Back button
 * @param {String} nextButtonText   The NLS text for Next button
 * @param {String} doneButtonText   The NLS text for Done button
 */
function _modifyContentBubble(noButtons, showBack, showNext, disableNext, skipButtonText, backButtonText, nextButtonText, doneButtonText) {
    /*
     * First block try to modify the icon in the bubble
     */
    let currentIconType = _getIconType();
    let currentIcon = Utils.getEleFromClassName(Constants.ICON_STYLE, true);
    if (!currentIcon.hasClass(currentIconType)) {
        let classTokens = currentIcon.attr("class").split(/\s+/g);
        $.each(classTokens, function (index, item) {
            if (item.indexOf(Constants.ICON_REGEXP) > -1) {
                currentIcon.removeClass(item);
            }
        });
        currentIcon.addClass(currentIconType);
    }

    /*
     * Modify title of the bubble to the new one
     */
    let contentBlock = Utils.getEleFromClassName(Constants.BUBBLE_CONTENT, true);
    let contentTitle = Utils.getEleFromClassName(Constants.BUBBLE_TITLE, true);
    if (Utils.isValid(Components.stepDescription[Constants.TITLE])) {
        if (Utils.hasELement(contentTitle)) {
            contentTitle.html(Components.stepDescription[Constants.TITLE]);
        } else {
            $(Constants.DIV_COMP, {
                "class": Constants.BUBBLE_TITLE,
                html: Components.stepDescription[Constants.TITLE]
            }).prependTo(contentBlock);
        }
    } else if (Utils.hasELement(contentTitle)) {
        // Remove if this step doesn't have a title but previous step has 1
        contentTitle.remove();
    }

    /*
     * Modify the step description of the bubble to the new one
     */
    let contentBody = Utils.getEleFromClassName(Constants.BUBBLE_CONTENT_BODY, true);
    contentBody.html(Components.stepDescription[Constants.CONTENT]);

    /**
     * Modify the button block.
     * 1. If the new step doesn't have buttons but the previous one has ... remove button-group.
     * 2. Modify the other buttons accordingly.
     */
    let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);
    if (noButtons) {
        let buttonGroup = Utils.getEleFromClassName(Constants.BUTTON_GROUP, true);
        if (Utils.hasELement(buttonGroup)) {
            buttonGroup.remove();
        }
    } else {
        let buttonGroup = $(Constants.DIV_COMP, {
            "class": Constants.BUTTON_GROUP
        });

        let skipRequirement = Components.stepDescription[Constants.SKIP];
        let skipButton = Utils.getEleFromClassName(Constants.SKIP_BUTTON, true);
        if (Utils.isValid(skipRequirement)) {
            if (!Utils.hasELement(skipButton)) {
                $(Constants.BUTTON_COMP, {
                    "class": Constants.SKIP_BUTTON,
                    text: skipButtonText
                }).appendTo(buttonGroup);
            }
        } else {
            if (Utils.hasELement(skipButton)) {
                Utils.getEleFromClassName(Constants.SKIP_BUTTON, true).remove();
            }
        }

        let backButton = Utils.getEleFromClassName(Constants.BACK_BUTTON, true);
        if (Utils.hasELement(backButton)) {
            backButton.prop('disabled', !showBack);
        } else {
            $(Constants.BUTTON_COMP, {
                "class": Constants.BACK_BUTTON,
                text: backButtonText,
                disabled: !showBack
            }).appendTo(buttonGroup);
        }

        if (showNext) {
            let nextButton = Utils.getEleFromClassName(Constants.NEXT_BUTTON, true);
            if (Utils.hasELement(nextButton)) {
                nextButton.prop('disabled', disableNext);
            } else {
                $(Constants.BUTTON_COMP, {
                    "class": Constants.NEXT_BUTTON,
                    text: nextButtonText,
                    disabled: disableNext
                }).appendTo(buttonGroup);
            }
        } else {
            let doneButton = Utils.getEleFromClassName(Constants.DONE_BUTTON, true);
            if (Utils.hasELement(doneButton)) {
                doneButton.prop('disabled', disableNext);
            } else {
                $(Constants.BUTTON_COMP, {
                    "class": Constants.DONE_BUTTON,
                    text: doneButtonText,
                    disabled: disableNext
                }).appendTo(buttonGroup);
            }
        }
        bubble.append(buttonGroup);
    }
}

/**
 * Find the current location of the bubble and modify it to point at correct target
 * Also, create the arrow according to the position defined by user
 */
function _placeBubbleLocation() {
    let targetPosition = Components.rect;
    let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);

    if (Utils.hasELement(bubble)) {
        let bubbleRect = bubble[0].getBoundingClientRect();
        let halfBubbleHeight = bubbleRect.height / 2;
        let halfBubbleWidth = bubbleRect.width / 2;

        let halfTargetHeight = Components.rect.height / 2;
        let halfTargetWidth = Components.rect.width / 2;

        let arrow = $(Constants.SPAN_COMP, {
            "class": Constants.ARROW_LOCATION
        });

        switch (Components.stepDescription[Constants.POSITION]) {
            case Constants.TOP:
                arrow.addClass(Constants.TOP);
                bubble.css({'top': Components.rect.top - bubbleRect.height - Constants.ARROW_SIZE + Constants.PX});
                bubble.css({'left': Components.rect.left + halfTargetWidth - halfBubbleWidth + Constants.PX});
                break;
            case Constants.RIGHT:
                arrow.addClass(Constants.RIGHT);
                bubble.css({'top': Components.rect.top + halfTargetHeight - halfBubbleHeight + Constants.PX});
                bubble.css({'left': targetPosition.right + Constants.ARROW_SIZE + Constants.PX});
                break;
            case Constants.LEFT:
                arrow.addClass(Constants.LEFT);
                bubble.css({'top': Components.rect.top + halfTargetHeight - halfBubbleHeight + Constants.PX});
                bubble.css({'left': Components.rect.left - bubbleRect.width - Constants.ARROW_SIZE + Constants.PX});
                break;
            default: // This is either bottom or something that doesn't exist
                arrow.addClass(Constants.BOTTOM);
                bubble.css({'top': targetPosition.bottom + Constants.ARROW_SIZE + Constants.PX});
                bubble.css({'left': Components.rect.left + halfTargetWidth - halfBubbleWidth + Constants.PX});
                break;
        }

        $(Constants.SPAN_COMP, {
            "class": Constants.HOLLOW_ARROW
        }).appendTo(arrow);

        bubble.append(arrow);
    }
}

/**
 * Find the size and location of the bubble and target, then move the bubble to that location accordingly
 * This will automatically trigger the
 */
function _modifyBubbleLocation() {
    let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);
    Utils.getEleFromClassName(Constants.ARROW_LOCATION, true).remove();
    /**
     * Remove the floating style if exist. In here we modify it so it will be concrete style
     */
    bubble.removeClass(Constants.FLOAT_STYLE);

    // Remove the arrow from the bubble, the recalculate the new location the re-attach a new arrow accordingly
    _placeBubbleLocation();
}

/**
 * Find the location of the bubble and put it in the middle of the screen.
 */
function _placeFloatBubble() {
    let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);
    bubble.addClass(Constants.FLOAT_STYLE);
}

/**
 * Modify the bubble to floating style, first add the float style to the bubble.
 * Then remove the arrow that ties to the previous target, and set top and left to auto for CSS to take over.
 * Because Styles have higher priority than CSS styles.
 */
function _modifyFloatBubble() {
    let bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);
    bubble.addClass(Constants.FLOAT_STYLE);
    let arrow = Utils.getEleFromClassName(Constants.ARROW_LOCATION, true);
    if (Utils.hasELement(arrow)) {
        arrow.remove();
        bubble.css({
            top: "",
            left: ""
        });
    }
}

/**
 * Create a border around target by generating an overlay over target. The overlay can be clicked through only when the step can be interated or triggerable
 */
function _addBorderAroundTarget() {
    if (Utils.isValid(Components.rect)) {
        let borderOverlay = $(Constants.DIV_COMP, {
            "class": Constants.TARGET_BORDER,
            "width": Components.rect.width + Constants.BORDER_WIDTH * 2 + Constants.PX,
            "height": Components.rect.height + Constants.BORDER_WIDTH * 2 + Constants.PX
        });
        borderOverlay.css({
            top: Components.rect.top - Constants.BORDER_WIDTH * 2 + Constants.PX,
            left: Components.rect.left - Constants.BORDER_WIDTH * 2 + Constants.PX
        });

        if (Components.stepDescription[Constants.CAN_INTERACT]) {
            borderOverlay.addClass(Constants.TARGET_INTERACTABLE);
        }

        Components.ui.append(borderOverlay);
    }
}

/**
 * Modify the border around target to the new position so that the transition animation can happen.
 * If the previous node is interactable and current node is not, remove interactable class from the border
 */
function _modifyBorderAroundTarget() {
    if (Utils.isValid(Components.rect)) {
        let borderOverlay = Utils.getEleFromClassName(Constants.TARGET_BORDER, true);
        borderOverlay.css({
            width: Components.rect.width + Constants.BORDER_WIDTH * 2 + Constants.PX,
            height: Components.rect.height + Constants.BORDER_WIDTH * 2 + Constants.PX,
            top: Components.rect.top - Constants.BORDER_WIDTH * 2 + Constants.PX,
            left: Components.rect.left - Constants.BORDER_WIDTH * 2 + Constants.PX
        });

        if (Components.stepDescription[Constants.CAN_INTERACT]) {
            borderOverlay.addClass(Constants.TARGET_INTERACTABLE);
        } else {
            borderOverlay.removeClass(Constants.TARGET_INTERACTABLE);
        }
    }
}

/**
 * When the current step is not a modal, scroll to target when needed.
 * If it is a modal, re-render continuously every 10 seconds. This is bad for performance ... but oh well.
 * Alternatively, set scrollLock: true, so that user cannot scroll around unnecessary
 */
function _scrollMethod() {
    let modal = Components.stepDescription[Constants.MODAL];
    if (!Utils.isValid(modal)) {
        Utils.smoothScroll(Components.rect);
    }
}

/**
 * Main function to create overlays, border around target and the content bubble next to target
 * @param noButtons        True to hide all buttons
 * @param showBack        True to show Back Button
 * @param showNext        True to show Next Button, False to show Done Button
 * @param disableNext     True to disable Next and Done button
 * @param {String} skipButtonText   The NLS text for Skip button
 * @param {String} backButtonText   The NLS text for Back button
 * @param {String} nextButtonText   The NLS text for Next button
 * @param {String} doneButtonText   The NLS text for Done button
 */
Components.prototype.createComponents = function (noButtons, showBack, showNext, disableNext, skipButtonText, backButtonText, nextButtonText, doneButtonText) {
    if (!Utils.isFloatStep(Components.stepDescription)) {
        _addOverlays();
        _addBorderAroundTarget();
        _createContentBubble(noButtons, showBack, showNext, disableNext, skipButtonText, backButtonText, nextButtonText, doneButtonText);
        // Note to self: must append every to the body here so that we can modify the location of the bubble later
        $(document.body).append(Components.ui);
        _placeBubbleLocation();
        _scrollMethod();
    } else {
        // The target element cannot be found which mean this is a floating step
        _addOverlay();
        _createContentBubble(noButtons, showBack, showNext, disableNext, skipButtonText, backButtonText, nextButtonText, doneButtonText);
        // Note to self: must append every to the body here so that we can modify the location of the bubble later
        $(document.body).append(Components.ui);
        _placeFloatBubble();
        Utils.scrollToTop();
    }
};

/**
 * Main function to modify the existing overlays, border around target and the content bubble next to target.
 * This function is called when all of those nodes already exist in the DOM. Modify it so that it transition
 * @param noButtons        True to hide all buttons
 * @param showBack        True to show Back Button
 * @param showNext        True to show Next Button, False to show Done Button
 * @param disableNext     True to disable Next and Done button
 * @param {String} skipButtonText   The NLS text for Skip button
 * @param {String} backButtonText   The NLS text for Back button
 * @param {String} nextButtonText   The NLS text for Next button
 * @param {String} doneButtonText   The NLS text for Done button
 */
Components.prototype.modifyComponents = function (noButtons, showBack, showNext, disableNext, skipButtonText, backButtonText, nextButtonText, doneButtonText) {
    Components.ui = Utils.getEleFromClassName(Constants.FLEXTOUR);

    if (!Utils.isFloatStep(Components.stepDescription)) {
        _modifyOverlays();
        _modifyBorderAroundTarget();
        _modifyContentBubble(noButtons, showBack, showNext, disableNext, skipButtonText, backButtonText, nextButtonText, doneButtonText);
        _modifyBubbleLocation();
        _scrollMethod();
    } else {
        // The target element cannot be found which mean this is a floating step
        _modifyOverlay();
        _modifyContentBubble(noButtons, showBack, showNext, disableNext, skipButtonText, backButtonText, nextButtonText, doneButtonText);
        _modifyFloatBubble();
        Utils.scrollToTop();
    }
};

/**
 * Main function to clean up the components that were added into the DOM.
 */
Components.prototype.removeComponents = function () {
    Components.ui.remove();
};

module.exports = Components;