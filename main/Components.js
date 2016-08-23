/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

var Constants = require("./Constants");
var Utils = require("./Utilities");
var $ = require("./../node_modules/jquery/dist/jquery.min.js");

function Components(stepDescription, stepNumber) {
    Components.stepDescription = $.extend({}, stepDescription);
    Components.stepNumber = stepNumber;
    Components.ui = $(Constants.DIV_COMP);
    Components.ui.addClass(Constants.FLEXTOUR);
    if (Utils.isStepWithTarget(stepDescription)) {
        var target = $(stepDescription[Constants.TARGET]);
        if (!Utils.hasELement(target)) {
            return;
        }
        var actualLocation = {};
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
    // Reason for adding Overlap height is that because we use 4 separated overlays constructed based on target
    // There is a really high chance that the overlays are not fit perfectly --> a small thin line will show --> UGLY.
    // We set this overlay overlap the top and bottom overlay, and make them blend together to cover the thin line. 1px would work
    return {
        width: Components.rect.left + Constants.PX,
        height: Components.rect.height + Constants.OVERLAP_HEIGHT * 2 + Constants.PX,
        top: Components.rect.top - Constants.OVERLAP_HEIGHT + Constants.PX,
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
        width: Utils.getFullWindowWidth() - Components.rect.right + Constants.PX,
        height: Components.rect.height + Constants.OVERLAP_HEIGHT * 2 + Constants.PX,
        top: Components.rect.top - Constants.OVERLAP_HEIGHT + Constants.PX,
        left: Components.rect.right + Constants.PX
    };
}

/**
 * Generate generic overlay from given width, height, top and left
 * @param locationObj     Object that contains width, height, top and left attributes for overlay
 * @return {object|*}       The DOM block that contains all overlays
 */
function _createOverlayNode(locationObj) {
    if (locationObj.left < 0 || locationObj.top < 0) {
        return undefined;
    }

    var overlay = $(Constants.DIV_COMP, {
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
    var overlayDiv = Utils.getEleFromClassName(Constants.OVERLAY_BLOCK, true);
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
    var overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
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
    var overlayDiv = $(Constants.DIV_COMP, {
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
    var overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
    var overlayDiv = Utils.getEleFromClassName(Constants.OVERLAY_BLOCK, true);
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
 */
function _createContentBubble(noButtons, showBack, showNext, disableNext) {
    var bubble = $(Constants.DIV_COMP, {
        "class": Constants.TOUR_BUBBLE
    });
    var icon = $(Constants.DIV_COMP, {
        "class": Constants.ICON_STYLE + " " + _getIconType()
    });
    if (Utils.isValid(Components.stepNumber) && Components.stepDescription[Constants.TYPE] === Constants.NUMBER_TYPE) {
        icon.html(Components.stepNumber);
    }
    icon.appendTo(bubble);

    var contentBlock = $(Constants.DIV_COMP, {
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

    var buttonGroup = $(Constants.DIV_COMP, {
        "class": Constants.BUTTON_GROUP
    });
    bubble.append(buttonGroup);

    if (Utils.isValid(Components.stepDescription[Constants.BUTTONS_CUS])) {
        var customizedButtons = Components.stepDescription[Constants.BUTTONS_CUS];
        for (var i = 0; i < customizedButtons.length; i++) {
            _createCustomButton(customizedButtons[i], buttonGroup);
        }
    } else if (!noButtons) {
        if (Utils.isValid(Components.stepDescription[Constants.SKIP])) {
            _createSkipButton(buttonGroup).appendTo(buttonGroup);
        }
        _createBackButton(showBack).appendTo(buttonGroup);
        if (showNext) {
            _createNextButton(disableNext).appendTo(buttonGroup);
        } else {
            _createDoneButton(disableNext).appendTo(buttonGroup);
        }
    }

    $(Constants.A_COMP, {
        "class": Constants.CLOSE_TOUR,
        html: Constants.TIMES
    }).appendTo(bubble);

    Components.ui.append(bubble);
}

/**
 * Create a button with given text, style and onclick handler
 * @param buttonDesc {Object}       Contains buttonName, buttonStyle, and buttonOnClick function
 * @param buttonGroup {Element}     DOM Element of the button group
 * @returns {jQuery|HTMLElement}        The button DOM Node with all of those given things
 */
function _createCustomButton(buttonDesc, buttonGroup) {
    var customizedButton = $(Constants.BUTTON_COMP, {
        "class": buttonDesc[Constants.BUTTON_STYLE],
        text: buttonDesc[Constants.BUTTON_NAME]
    });
    var clickEvent = buttonDesc[Constants.ONCLICK_NAME];
    if (Utils.isValid(clickEvent) && typeof clickEvent == "function") {
        Utils.addEvent(customizedButton, Constants.FLEX_CLICK, clickEvent);
    } else if (Utils.isValid(clickEvent) && typeof clickEvent == "string") {
        switch (clickEvent) {
            case Constants.SKIP_TEXT:
                customizedButton.addClass(Constants.SKIP_BUTTON_TRIGGER);
                break;
            case Constants.BACK_TEXT:
                customizedButton.addClass(Constants.BACK_BUTTON_TRIGGER);
                break;
            case Constants.NEXT_TEXT:
                customizedButton.addClass(Constants.NEXT_BUTTON_TRIGGER);
                break;
            case Constants.DONE_TEXT:
                customizedButton.addClass(Constants.DONE_BUTTON_TRIGGER);
                break;
            default:
                break;
        }
    }
    customizedButton.appendTo(buttonGroup);
}

/**
 * Create skip button, use the customized content first, if it doesn't exist use the default one
 */
function _createSkipButton() {
    return $(Constants.BUTTON_COMP, {
        "class": Constants.SKIP_BUTTON + " " + Constants.SKIP_BUTTON_TRIGGER,
        text: _getSkipButtonText()
    });
}

/**
 * Get the text of skip button in current step. If it's not set, use default one
 * @returns {*|string}  Skip button NLS text
 */
function _getSkipButtonText() {
    return Components.stepDescription[Constants.SKIP_BUTTON_CUS] || Constants.SKIP_TEXT;
}

/**
 * Create back button, put the text that users want to put for NLS. If it doesn't exist, use the default one
 * @param showBack {Boolean}        Disable back button or not
 */
function _createBackButton(showBack) {
    return $(Constants.BUTTON_COMP, {
        "class": Constants.BACK_BUTTON + " " + Constants.BACK_BUTTON_TRIGGER,
        text: _getBackButtonText(),
        disabled: !showBack
    });
}

/**
 * Get the text of back button in current step. If it's not set, use default one
 * @returns {*|string}  Back button NLS text
 */
function _getBackButtonText() {
    return Components.stepDescription[Constants.BACK_BUTTON_CUS] || Constants.BACK_TEXT;
}

/**
 * Create next button, and put the text that users want to put for NLS purpose. If it doesn't exist, use the default one
 * @param disableNext {Boolean}     Disable next button or not
 */
function _createNextButton(disableNext) {
    return $(Constants.BUTTON_COMP, {
        "class": Constants.NEXT_BUTTON + " " + Constants.NEXT_BUTTON_TRIGGER,
        text: _getNextButtonText(),
        disabled: disableNext
    });
}

/**
 * Get the text of next button in current step. If it's not set, use default one
 * @returns {*|string}  Back button NLS text
 */
function _getNextButtonText() {
    return Components.stepDescription[Constants.NEXT_BUTTON_CUS] || Constants.NEXT_TEXT;
}

/**
 * Create done button, and put the text that users want to put for NLS purpose. If it doesn't exist, use the default one
 * @param disableNext {Boolean}     Disable done button or not
 */
function _createDoneButton(disableNext) {
    return $(Constants.BUTTON_COMP, {
        "class": Constants.NEXT_BUTTON + " " + Constants.DONE_BUTTON_TRIGGER,
        text: _getDoneButtonText(),
        disabled: disableNext
    });
}

/**
 * Get the text of done button in current step. If it's not set, use default one
 * @returns {*|string}  Back button NLS text
 */
function _getDoneButtonText() {
    return Components.stepDescription[Constants.DONE_BUTTON_CUS] || Constants.DONE_TEXT;
}

/**
 * Return the appropriate icon for the step.
 * @returns {*}     String that describe the class that should represent the icon
 */
function _getIconType() {
    var currentStepType = Components.stepDescription[Constants.TYPE];
    if (Components.stepDescription[Constants.TRANSITION]) {
        return Constants.LOADING_ICON;
    } else if (currentStepType === Constants.ACTION_TYPE) {
        return Constants.ACTION_ICON;
    } else if (currentStepType === Constants.NUMBER_TYPE) {
        return Constants.NUMBER_ICON;
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
 */
function _modifyContentBubble(noButtons, showBack, showNext, disableNext) {
    /*
     * First block try to modify the icon in the bubble
     */
    var currentIconType = _getIconType();
    var currentIcon = Utils.getEleFromClassName(Constants.ICON_STYLE, true);
    if (!currentIcon.hasClass(currentIconType)) {
        var classTokens = currentIcon.attr("class");
        if (classTokens.length > 0) {
            classTokens = classTokens.split(/\s+/g);
        }
        $.each(classTokens, function (index, item) {
            if (item.indexOf(Constants.ICON_REGEXP) > -1) {
                currentIcon.removeClass(item);
            }
        });
        currentIcon.addClass(currentIconType);
    }
    if (Utils.isValid(Components.stepNumber) && Components.stepDescription[Constants.TYPE] === Constants.NUMBER_TYPE) {
        currentIcon.html(Components.stepNumber);
    } else {
        currentIcon.html(""); // clear out the number from previous step
    }

    /*
     * Modify title of the bubble to the new one
     */
    var contentBlock = Utils.getEleFromClassName(Constants.BUBBLE_CONTENT, true);
    var contentTitle = Utils.getEleFromClassName(Constants.BUBBLE_TITLE, true);
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
    var contentBody = Utils.getEleFromClassName(Constants.BUBBLE_CONTENT_BODY, true);
    contentBody.html(Components.stepDescription[Constants.CONTENT]);

    /**
     * Modify the button block.
     * 1. If the new step doesn't have buttons but the previous one has ... remove button-group.
     * 2. Modify the other buttons accordingly.
     */
    var bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);
    var buttonGroup = Utils.getEleFromClassName(Constants.BUTTON_GROUP, true);
    if (noButtons) {
        if (Utils.hasELement(buttonGroup)) {
            buttonGroup.remove();
        }
    } else if (Utils.isValid(Components.stepDescription[Constants.BUTTONS_CUS])) {
        if (Utils.hasELement(buttonGroup)) {
            buttonGroup.remove();
        }
        buttonGroup = $(Constants.DIV_COMP, {
            "class": Constants.BUTTON_GROUP
        });
        bubble.append(buttonGroup);

        var customizedButtons = Components.stepDescription[Constants.BUTTONS_CUS];
        for (var i = 0; i < customizedButtons.length; i++) {
            _createCustomButton(customizedButtons[i], buttonGroup);
        }
    } else {
        if (!Utils.hasELement(buttonGroup)) {
            buttonGroup = $(Constants.DIV_COMP, {
                "class": Constants.BUTTON_GROUP
            });
            bubble.append(buttonGroup);
        }
        var nextButton = Utils.getEleFromClassName(Constants.NEXT_BUTTON, true);
        if (showNext) {
            // For the case where user go back from last step --> replace Done button with Next button
            if (Utils.hasELement(nextButton)) {
                nextButton.text(_getNextButtonText());
                nextButton.prop('disabled', disableNext);
            } else {
                nextButton = _createNextButton(disableNext).appendTo(buttonGroup);
            }
        } else {
            // For last step, replace Next with Done button.
            if (Utils.hasELement(nextButton)) {
                nextButton.prop('disabled', disableNext);
                nextButton.text(_getDoneButtonText());
            } else {
                nextButton = _createDoneButton(disableNext).appendTo(buttonGroup);
            }
        }

        var backButton = Utils.getEleFromClassName(Constants.BACK_BUTTON, true);
        if (Utils.hasELement(backButton)) {
            backButton.prop('disabled', !showBack);
            backButton.text(_getBackButtonText());
        } else {
            backButton = _createBackButton(showBack);
            if (Utils.hasELement(nextButton)) {
                backButton.insertBefore(nextButton);
            }
        }

        var skipRequirement = Components.stepDescription[Constants.SKIP];
        var skipButton = Utils.getEleFromClassName(Constants.SKIP_BUTTON, true);
        if (Utils.isValid(skipRequirement) && !Utils.isValid(Components.stepDescription[Constants.NO_SKIP])) {
            if (!Utils.hasELement(skipButton)) {
                skipButton = _createSkipButton().prependTo(buttonGroup);
            }
            skipButton.text(_getSkipButtonText());
        } else {
            if (Utils.hasELement(skipButton)) {
                skipButton.remove();
            }
        }
    }
}

/**
 * Find the current location of the bubble and modify it to point at correct target
 * Also, create the arrow according to the position defined by user
 */
function _placeBubbleLocation() {
    var targetPosition = Components.rect;
    var bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);

    if (Utils.hasELement(bubble)) {
        var bubbleRect = bubble[0].getBoundingClientRect();
        var halfBubbleHeight = bubbleRect.height / 2;
        var halfBubbleWidth = bubbleRect.width / 2;

        var halfTargetHeight = Components.rect.height / 2;
        var halfTargetWidth = Components.rect.width / 2;

        var arrow = $(Constants.SPAN_COMP, {
            "class": Constants.ARROW_LOCATION
        });

        switch (Components.stepDescription[Constants.POSITION]) {
            case Constants.TOP:
                arrow.addClass(Constants.TOP);
                bubble.css({'top': Components.rect.top - bubbleRect.height - Constants.ARROW_SIZE + Constants.BORDER_WIDTH * 4 + Constants.PX});
                bubble.css({'left': Components.rect.left + halfTargetWidth - halfBubbleWidth + Constants.PX});
                break;
            case Constants.RIGHT:
                arrow.addClass(Constants.RIGHT);
                bubble.css({'top': Components.rect.top + halfTargetHeight - halfBubbleHeight + Constants.PX});
                bubble.css({'left': targetPosition.right + Constants.ARROW_SIZE - Constants.BORDER_WIDTH * 4 + Constants.PX});
                break;
            case Constants.LEFT:
                arrow.addClass(Constants.LEFT);
                bubble.css({'top': Components.rect.top + halfTargetHeight - halfBubbleHeight + Constants.PX});
                bubble.css({'left': Components.rect.left - bubbleRect.width - Constants.ARROW_SIZE + Constants.BORDER_WIDTH * 4 + Constants.PX});
                break;
            default: // This is either bottom or something that doesn't exist
                arrow.addClass(Constants.BOTTOM);
                bubble.css({'top': targetPosition.bottom + Constants.ARROW_SIZE - Constants.BORDER_WIDTH * 4 + Constants.PX});
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
    var bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);
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
    var bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);
    bubble.addClass(Constants.FLOAT_STYLE);
}

/**
 * Modify the bubble to floating style, first add the float style to the bubble.
 * Then remove the arrow that ties to the previous target, and set top and left to auto for CSS to take over.
 * Because Styles have higher priority than CSS styles.
 */
function _modifyFloatBubble() {
    var bubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true);
    bubble.addClass(Constants.FLOAT_STYLE);
    var arrow = Utils.getEleFromClassName(Constants.ARROW_LOCATION, true);
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
        var borderOverlay = $(Constants.DIV_COMP, {
            "class": Constants.TARGET_BORDER
        });
        borderOverlay.css({
            width: Components.rect.width + Constants.PX,
            height: Components.rect.height + Constants.PX,
            top: Components.rect.top + Constants.PX,
            left: Components.rect.left + Constants.PX
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
        var borderOverlay = Utils.getEleFromClassName(Constants.TARGET_BORDER, true);
        borderOverlay.css({
            width: Components.rect.width + Constants.PX,
            height: Components.rect.height + Constants.PX,
            top: Components.rect.top + Constants.PX,
            left: Components.rect.left + Constants.PX
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
    var modal = Components.stepDescription[Constants.MODAL];
    if (!Utils.isValid(modal)) {
        Utils.smoothScroll(Components.rect, Components.stepDescription.position);
    }
}

/**
 * Add a flashing border around flashTarget to indicate user where to click to proceed.
 * This should be used with nextStepTrigger attribute --> so that user knows where to click.
 */
function _addFlashBorder() {
    var flashTarget = Components.stepDescription[Constants.FLASH_TARGET];
    if (Utils.isValid(flashTarget)) {
        var flashTargetLocation = $(flashTarget);
        var flashOverlay = $(Constants.DIV_COMP, {
            "class": Constants.FLASH_BORDER
        });
        flashOverlay.css({
            width: flashTargetLocation.outerWidth() + Constants.BORDER_WIDTH * 2 + Constants.PX,
            height: flashTargetLocation.outerHeight() + Constants.BORDER_WIDTH * 2 + Constants.PX,
            top: flashTargetLocation.offset().top - Constants.FLASH_BORDER_WIDTH + Constants.PX,
            left: flashTargetLocation.offset().left - Constants.FLASH_BORDER_WIDTH + Constants.PX
        });
        Components.ui.append(flashOverlay);
    }
}

/**
 * Modify the border to a newer target if it is required by the new step
 * If the new step doesn't require, and old step has the flashTarget --> remove it
 */
function _modifyFlashBorder() {
    var flashTarget = Components.stepDescription[Constants.FLASH_TARGET];
    var flashOverlay = Utils.getEleFromClassName(Constants.FLASH_BORDER, true);
    if (Utils.isValid(flashTarget)) {
        if (Utils.hasELement(flashOverlay)) {
            var flashTargetLocation = $(flashTarget);
            flashOverlay.css({
                width: flashTargetLocation.outerWidth() + Constants.BORDER_WIDTH * 2 + Constants.PX,
                height: flashTargetLocation.outerHeight() + Constants.BORDER_WIDTH * 2 + Constants.PX,
                top: flashTargetLocation.offset().top - Constants.FLASH_BORDER_WIDTH + Constants.PX,
                left: flashTargetLocation.offset().left - Constants.FLASH_BORDER_WIDTH + Constants.PX
            });
        } else {
            _addFlashBorder();
        }
    } else if (Utils.hasELement(flashOverlay)) {
        flashOverlay.remove();
    }
}

/**
 * Main function to create overlays, border around target and the content bubble next to target
 * @param noButtons        True to hide all buttons
 * @param showBack        True to show Back Button
 * @param showNext        True to show Next Button, False to show Done Button
 * @param disableNext     True to disable Next and Done button
 */
Components.prototype.createComponents = function (noButtons, showBack, showNext, disableNext) {
    if (!Utils.isFloatStep(Components.stepDescription)) {
        _addBorderAroundTarget();
        _addFlashBorder();
        _createContentBubble(noButtons, showBack, showNext, disableNext);
        _addOverlays();
        // Note to self: must append every to the body here so that we can modify the location of the bubble later
        $(document.body).append(Components.ui);
        _placeBubbleLocation();
    } else {
        // The target element cannot be found which mean this is a floating step
        _createContentBubble(noButtons, showBack, showNext, disableNext);
        _addOverlay();
        // Note to self: must append every to the body here so that we can modify the location of the bubble later
        $(document.body).append(Components.ui);
        _placeFloatBubble();
    }
    if (!Components.stepDescription[Constants.SCROLL_LOCK]) {
        _scrollMethod();
    }
};

/**
 * Main function to modify the existing overlays, border around target and the content bubble next to target.
 * This function is called when all of those nodes already exist in the DOM. Modify it so that it transition
 * @param noButtons        True to hide all buttons
 * @param showBack        True to show Back Button
 * @param showNext        True to show Next Button, False to show Done Button
 * @param disableNext     True to disable Next and Done button
 */
Components.prototype.modifyComponents = function (noButtons, showBack, showNext, disableNext) {
    Components.ui = Utils.getEleFromClassName(Constants.FLEXTOUR, true);

    if (!Utils.isFloatStep(Components.stepDescription)) {
        _modifyBorderAroundTarget();
        _modifyFlashBorder();
        _modifyContentBubble(noButtons, showBack, showNext, disableNext);
        _modifyOverlays();
        _modifyBubbleLocation();
    } else {
        // The target element cannot be found which mean this is a floating step
        _modifyContentBubble(noButtons, showBack, showNext, disableNext);
        _modifyFloatBubble();
        _modifyOverlay();
    }
    if (!Components.stepDescription[Constants.SCROLL_LOCK]) {
        _scrollMethod();
    }
};

/**
 * Main function to clean up the components that were added into the DOM.
 */
Components.prototype.removeComponents = function () {
    Components.ui.remove();
};

/**
 * This function is used to remove the overlays of current step. Only used for resizing windows so that new window size is recalculated properly.
 */
Components.prototype.removeOverlays = function () {
    var overlayDiv = Utils.getEleFromClassName(Constants.OVERLAY_BLOCK, true);
    if (Utils.hasELement(overlayDiv)) {
        overlayDiv.remove();
    }
};

module.exports = Components;