/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

module.exports = {
    CLASS: ".",
    OVERLAY_STYLE: "flextour-overlay-styles",

    // Bubble Block
    TARGET_BORDER: "flextour-target-border",
    TARGET_INTERACTABLE: "interactable",
    TOUR_BUBBLE: "flextour-tour-bubble",

    ICON: "flextour-icon",
    CLOSE_TOUR: "flextour-close",

    SKIP_BUTTON: "flextour-skip-button",
    BACK_BUTTON: "flextour-back-button",
    NEXT_BUTTON: "flextour-next-button",
    DONE_BUTTON: "flextour-done-button",
    BUTTON_GROUP: "flextour-button-group",

    // Event Block
    FLEX_CLICK: "click.flextour",
    FLEX_RESIZE: "resize.flextour",

    // Tour Attributes Block
    TOUR_DEFAULT_SETTINGS: {
        transition: {},
        canInteract: true,
        noButtons: false,
        noBack: false,
        noSkip: false,
        noNext: false,
        stepNumber: true,
        endOnOverlayClick: true,
        endOnEsc: true
    },

    ID: "id",
    STEPS: "steps",
    NO_BACK: "noBack",
    NO_SKIP: "noSkip",
    NO_NEXT: "noNext",
    NO_BUTTONS: "noButtons",
    CAN_INTERACT: "canInteract",
    TYPE: "type",
    CONTENT: "content",
    TARGET: "target",
    POSITION: "position",
    NEXT_ON_TARGET: "nextOnTargetClick",
    TIME_INTERVAL: "timeIntervals",
    RETRIES: "retries",
    END_ON_ESC: "endOnEsc",

    DEFAULT_TYPE: "info",
    ACTION_TYPE: "action",
    DEFAULT_POSITION: "bottom",

    TOUR: "tour",

    EMPTY: "&nbsp,",
    BORDER_WIDTH: 2,
    PX: "px",

    TOP: "top",
    RIGHT: "right",
    LEFT: "left",
    BOTTOM: "bottom"
};