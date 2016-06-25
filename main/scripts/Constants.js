/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

module.exports = {
    CLASS: ".",
    COLON: ":",
    COMMA: ",",
    WAIT: "?",
    SKIP: "!",
    CURRENT_TARGET: "@target@",
    IS_VISIBLE: "isVisible",
    DOES_EXIST: "doesExist",
    OVERLAY_STYLE: "flextour-overlay-styles",

    // Bubble Block
    TARGET_BORDER: "flextour-target-border",
    TARGET_INTERACTABLE: "interactable",
    TOUR_BUBBLE: "flextour-tour-bubble",
    ARROW_LOCATION: "arrow-location",
    HOLLOW_ARROW: "inner-arrow",
    BUBBLE_CONTENT: "flextour-content",

    ACTION_ICON: "flextour-icon-action",
    DEFAULT_ICON: "flextour-icon-info",
    CLOSE_TOUR: "flextour-close",

    SKIP_BUTTON: "flextour-skip-button",
    BACK_BUTTON: "flextour-back-button",
    NEXT_BUTTON: "flextour-next-button",
    DONE_BUTTON: "flextour-done-button",
    BUTTON_GROUP: "flextour-button-group",

    // Event Block
    FLEX_CLICK: "click",
    FLEX_RESIZE: "resize",

    // Tour Attributes Block
    TOUR_DEFAULT_SETTINGS: {
        transition: {},
        canInteract: true,
        noButtons: false,
        noBack: false,
        noSkip: false,
        stepNumber: true,
        endOnOverlayClick: true,
        endOnEsc: true
    },

    ID: "id",
    STEPS: "steps",
    NO_BUTTONS: "noButtons",
    NO_BACK: "noBack",
    NO_SKIP: "noSkip",
    CAN_INTERACT: "canInteract",
    TYPE: "type",
    CONTENT: "content",
    PREREQUISITES: "prerequisites",
    TARGET: "target",
    POSITION: "position",
    NEXT_ON_TARGET: "nextOnTargetClick",
    TIME_INTERVAL: "waitIntervals",
    RETRIES: "retries",
    END_ON_ESC: "endOnEsc",

    DEFAULT_TYPE: "info",
    ACTION_TYPE: "action",
    DEFAULT_POSITION: "bottom",

    TOUR: "tour",

    TIMES: "&times;",
    BORDER_WIDTH: 3,
    ARROW_SIZE: 20,
    PX: "px",

    TOP: "top",
    RIGHT: "right",
    LEFT: "left",
    BOTTOM: "bottom",

    SKIP_TEXT: "Skip",
    NEXT_TEXT: "Next",
    BACK_TEXT: "Back",
    DONE_TEXT: "Done"
};