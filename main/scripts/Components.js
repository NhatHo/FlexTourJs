/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

var Constants = require("./Constants");
var Utils = require("./Utilities");

module.exports = {
    Component: function (stepDescription) {
        this.stepDescription = Utils.clone({}, stepDescription);
        this.rect = document.querySelector(stepDescription[Constants.TARGET]).getBoundingClientRect();
    },

    /**
     * Add top overlay into document body
     */
    _createTopOverlay: function () {
        let height = this.rect.top;
        let width = document.body.getBoundingClientRect().width;

        // Put overlay on top left of the screen
        this._createOverlayNode(width, height, 0, 0);
    },

    /**
     * Generate Bottom overlay rect
     */
    _createBottomOverlay: function () {
        let height = document.body.getBoundingClientRect().height - this.rect.top - this.rect.height;
        let width = document.body.getBoundingClientRect().width;

        // Put over on the bottom of target rect
        this._createOverlayNode(width, height, this.rect.top + this.rect.height, 0);
    },

    /**
     * Generate Left overlay rect
     */
    _createLeftOverlay: function () {
        let height = this.rect.height;
        let width = this.rect.left;

        // Put overlay over space on the left of target
        this._createOverlayNode(width, height, this.rect.top, 0);
    },

    /**
     * Add Right overlay next to target rect
     */
    _createRightOverlay: function () {
        let height = this.rect.height;
        let width = document.body.getBoundingClientRect().width - this.rect.left - this.rect.width;

        // Put overlay on the top right of the target rect
        this._createOverlayNode(width, height, this.rect.top, this.rect.left + this.rect.width);
    },

    /**
     * Generate generic overlay from given width, height, top and left
     * @param width     The width of current overlay
     * @param height    The height of current overlay
     * @param top       Top location of current overlay
     * @param left      Left location of current overlay
     */
    _createOverlayNode: function (width, height, top, left) {
        let overlay = document.createElement("div");
        overlay.classList.add(Constants.OVERLAY_STYLE);
        overlay.width = width;
        overlay.height = height;
        overlay.top = top;
        overlay.left = left;

        document.body.appendChild(overlay);
    },

    /**
     * Add all overlays around target for better visual
     */
    addOverlays: function () {
        this._createTopOverlay();
        this._createBottomOverlay();
        this._createLeftOverlay();
        this._createRightOverlay();
    },

    /**
     * Remove all overlays from document body for cleaning up
     */
    removeAllOverlay: function () {
        let overlays = Utils.getElesFromClassName(Constants.OVERLAY_STYLE);
        for (let overlay in overlays) {
            document.body.removeChild(overlay);
        }
    },

    /**
     * Create content bubble next to target to display the content of the step
     * @param {boolean} isLastStep  True if it is the last step of the tour
     */
    createContentBubble: function (isLastStep) {
        let element = Utils.getEleFromClassName(Constants.TARGET_BORDER);
        let targetPosition = element.getBoundingClientRect();
        let top = targetPosition.top;
        let left = targetPosition.left;
        let bottom = top + targetPosition.height;
        let right = left + targetPosition.width;

        let bubble = document.createElement("div");

        let iconDiv = document.createElement("div");
        iconDiv.classList.add(Constants.ICON);

        bubble.appendChild(iconDiv);

        let contentDiv = document.createElement("p");
        contentDiv.innerText = this.stepDescription[Constants.CONTENT];

        bubble.classList.add(Constants.TOUR_BUBBLE);

        switch (this.stepDescription[Constants.POSITION]) {
            case "top":
                bubble.classList.add("top");
                break;
            case "right":
                bubble.classList.add("right");
                break;
            case "left":
                bubble.classList.add("left");
                break;
            default: // This is either bottom or something that doesn't exist
                bubble.classList.add("bottom");
                break;
        }
        bubble.appendChild(contentDiv);

        if (!Utils.isValid(this.stepDescription[Constants.NEXT_ON_TARGET]) && !Utils.isValid(this.stepDescription[Constants.NO_BUTTONS])) {
            let buttonGroup = document.createElement("div");
            buttonGroup.classList.add(Constants.BUTTON_GROUP);

            if (!Utils.isValid(this.stepDescription[Constants.NO_SKIP])) {
                let skipButton = document.createElement("button");
                skipButton.classList.add(Constants.SKIP_BUTTON);
                buttonGroup.appendChild(skipButton);
            }

            if (!Utils.isValid(this.stepDescription[Constants.NO_BACK])) {
                let backButton = document.createElement("button");
                backButton.classList.add(Constants.BACK_BUTTON);
                buttonGroup.appendChild(backButton);
            }

            if (!Utils.isValid(this.stepDescription[Constants.NO_NEXT]) && !isLastStep) {
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

        document.body.appendChild(bubble);
    },

    /**
     * Remove content bubble from document body for cleaning up
     */
    clearContentBubble: function () {
        let contentBubble = Utils.getEleFromClassName(Constants.TOUR_BUBBLE);
        document.body.removeChild(contentBubble);
    },

    /**
     * Create a border around target by generating an overlay over target. The overlay can be clicked through only when the step can be interated or triggerable
     * @param canInteract     Boolean value to see if user can interact with the UI
     */
    addBorderAroundTarget: function (canInteract) {
        if (Utils.isValid(this.rect)) {

            let borderOverlay = document.createElement("div");
            borderOverlay.classList.add(Constants.TARGET_BORDER);
            borderOverlay.width = this.rect.width + Constants.BORDER_WIDTH * 2;
            borderOverlay.height = this.rect.height + Constants.BORDER_WIDTH * 2;
            borderOverlay.top = this.rect.top - Constants.BORDER_WIDTH;
            borderOverlay.left = this.rect.left - Constants.BORDER_WIDTH;

            if (canInteract) {
                borderOverlay.classList.add(Constants.TARGET_INTERACTABLE);
            }

            document.body.appendChild(borderOverlay);
        }
    },

    /**
     * Clear the border around target for cleaning up
     */
    clearBorderAroundTarget: function () {
        let borderOverlay = Utils.getEleFromClassName(Constants.TARGET_BORDER);
        document.body.removeChild(borderOverlay);
    }
};