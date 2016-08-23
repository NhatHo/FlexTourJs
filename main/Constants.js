/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

module.exports = {
    CLASS: ".",
    COLON: ":",
    COMMA: ",",
    WAIT: "?",
    PROCEED_INDICATOR: "!",
    CURRENT_TARGET: "@target@",
    IS_VISIBLE: "isVisible",
    DOES_EXIST: "doesExist",
    OVERLAY_STYLE: "flextour-overlay-styles",
    OVERLAY_BLOCK: "flextour-overlay-blocks",

    FLEXTOUR: "flextour",

    // Bubble Block
    TARGET_BORDER: "flextour-target-border",
    FLASH_BORDER: "flextour-flash-border",
    TARGET_INTERACTABLE: "interactable",
    TOUR_BUBBLE: "flextour-tour-bubble",
    ARROW_LOCATION: "arrow-location",
    HOLLOW_ARROW: "inner-arrow",
    BUBBLE_CONTENT: "flextour-content",
    BUBBLE_CONTENT_BODY: "flextour-content-body",
    FLOAT_STYLE: "flextour-float-bubble",
    BUBBLE_TITLE: "flextour-bubble-title",
    ICON_STYLE: "icon-style",

    ICON_REGEXP: "flextour-icon",
    ACTION_ICON: "flextour-icon-action",
    DEFAULT_ICON: "flextour-icon-info",
    LOADING_ICON: "flextour-icon-loading",
    NUMBER_ICON: "flextour-icon-number",

    CLOSE_TOUR: "flextour-close",

    BUTTON_GROUP: "flextour-button-group",

    SKIP_BUTTON: "flextour-skip-button",
    BACK_BUTTON: "flextour-back-button",
    NEXT_BUTTON: "flextour-next-button",

    SKIP_BUTTON_TRIGGER: "flextour-skip-trigger",
    BACK_BUTTON_TRIGGER: "flextour-back-trigger",
    NEXT_BUTTON_TRIGGER: "flextour-next-trigger",
    DONE_BUTTON_TRIGGER: "flextour-done-trigger",

    // Event Block
    FLEX_CLICK: "click.flextour",
    FLEX_RESIZE: "resize.flextour",
    KEY_UP: "keyup.flextour",
    SCROLL: "scroll.flextour",
    DRAG_START: "dragstart.flextour",
    DRAG_END: "dragend.flextour",
    HASH_CHANGE: "hashchange.flextour",

    // Local storage Block
    LOCALSTORAGE_KEY: "flextour.storage",
    MULTIPAGE_KEY: "multipage",
    CURRENT_TOUR: "currentTour",
    CURRENT_STEP: "currentStep",
    PAUSED_KEY: "paused",
    STEP_STATUS: "stepStatus",
    PAUSED_TOUR: "pausedTour",
    PAUSED_STEP: "pausedStep",

    // Tour Attributes Block
    TOUR_DEFAULT_SETTINGS: {
        transition: {},
        canInteract: false,
        noButtons: false,
        noBack: false,
        noSkip: false,
        endOnOverlayClick: true,
        endOnEsc: true,
        pauseOnExit: false
    },
    // Attributes Block
    ID: "id",
    TITLE: "title",
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
    NEXT_STEP_TRIGGER: "nextStepTrigger",
    FLASH_TARGET: "flashTarget",
    WAIT_INTERVALS: "waitIntervals",
    RETRIES: "retries",
    END_ON_ESC: "endOnEsc",
    END_ON_OVERLAY_CLICK: "endOnOverlayClick",
    DELAY: "delay",
    TRANSITION: "transition",
    SKIP: "skip",
    MODAL: "modal",
    SCROLL_LOCK: "scrollLock",
    STYLES: "styles",

    NEXT_BUTTON_CUS: "nextButton",
    BACK_BUTTON_CUS: "backButton",
    SKIP_BUTTON_CUS: "skipButton",
    DONE_BUTTON_CUS: "doneButton",

    BUTTONS_CUS: "buttons",
    BUTTON_NAME: "name",
    BUTTON_STYLE: "style",
    ONCLICK_NAME: "onclick",

    MULTIPAGE: "multipage",
    SAVE_POINT: "savePoint",
    PAUSE_ON_EXIT: "pauseOnExit",
    DND: "dragAndDrop",

    DEFAULT_TYPE: "info",
    ACTION_TYPE: "action",
    NUMBER_TYPE: "number",

    DEFAULT_POSITION: "bottom",

    // Utilities
    TIMES: "&times;",
    BORDER_WIDTH: 1,
    FLASH_BORDER_WIDTH: 1,
    OVERLAP_HEIGHT: 1,
    ARROW_SIZE: 20,
    PX: "px",

    TOP: "top",
    RIGHT: "right",
    LEFT: "left",
    BOTTOM: "bottom",
    FLOAT: "float",

    SKIP_TEXT: "Skip",
    NEXT_TEXT: "Next",
    BACK_TEXT: "Back",
    DONE_TEXT: "Done",

    DIV_COMP: "<div></div>",
    SPAN_COMP: "<span></span>",
    BUTTON_COMP: "<button></button>",
    A_COMP: "<a></a>",

    // Utilities
    TOUR: "tour",

    // Customized event
    ON_EXIT: "onExit",
    ON_START: "onStart",
    BEFORE_STEP: "beforeStepRender",
    AFTER_STEP: "afterStepRender"
};