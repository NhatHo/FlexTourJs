(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jQuery"));
	else if(typeof define === 'function' && define.amd)
		define("FlexTour", ["jQuery"], factory);
	else if(typeof exports === 'object')
		exports["FlexTour"] = factory(require("jQuery"));
	else
		root["FlexTour"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*******************************************************************************
	 * Copyright (c) 2016. MIT License.
	 * NhatHo-nhatminhhoca@gmail.com
	 ******************************************************************************/

	var Components = __webpack_require__(1);
	var Constants = __webpack_require__(2);
	var Utils = __webpack_require__(3);
	var $ = __webpack_require__(4);

	/**
	 * Pre-process all information for all tours make sure each step and each tour contains necessary
	 * information for subsequent steps
	 * @param tourDesc      JSON description file that has all information needed
	 */
	function _preprocessingTours(tourDesc) {
	    if ($.isArray(tourDesc) && tourDesc.length > 0) {
	        FlexTour.currentTourId = tourDesc[0][Constants.ID];
	        for (var i = 0; i < tourDesc.length; i++) {
	            _initializeTour(tourDesc[i]);
	        }
	    } else {
	        _initializeTour(tourDesc);
	        FlexTour.currentTourId = tourDesc[Constants.ID];
	    }
	}

	/**
	 * Initialize raw tour object to make it legal for the framework
	 * @param tour      The tour object ---> Must be an object
	 */
	function _initializeTour(tour) {
	    var rawTour = $.extend(true, {}, tour);
	    // Fill in information for each tour in case any important information is missing
	    rawTour = $.extend({}, Constants.TOUR_DEFAULT_SETTINGS, rawTour);

	    // Fill in information for each step in case anything important is missing
	    var numOfSteps = rawTour[Constants.STEPS].length;

	    for (var i = 0; i < numOfSteps; i++) {
	        var currentStep = rawTour[Constants.STEPS][i];
	        var content = currentStep[Constants.CONTENT];
	        if (Utils.isValid(FlexTour.translation) && FlexTour.translation.hasOwnProperty(content)) {
	            currentStep[Constants.CONTENT] = FlexTour.translation[content];
	        }

	        currentStep[Constants.TYPE] = currentStep[Constants.TYPE] || Constants.DEFAULT_TYPE;
	        currentStep[Constants.POSITION] = currentStep[Constants.POSITION] || Constants.DEFAULT_POSITION;
	        currentStep[Constants.NO_BUTTONS] = currentStep[Constants.NO_BUTTONS] || rawTour[Constants.NO_BUTTONS];
	        currentStep[Constants.DELAY] = currentStep[Constants.DELAY] || rawTour[Constants.DELAY];
	        currentStep[Constants.NO_BACK] = currentStep[Constants.NO_BACK] || rawTour[Constants.NO_BACK];
	        currentStep[Constants.CAN_INTERACT] = currentStep[Constants.CAN_INTERACT] || currentStep[Constants.NEXT_STEP_TRIGGER] || currentStep[Constants.DND] || rawTour[Constants.CAN_INTERACT]; // This mean that if target can trigger next step on click, it must be clickable
	        currentStep[Constants.WAIT_INTERVALS] = currentStep[Constants.WAIT_INTERVALS] || rawTour[Constants.WAIT_INTERVALS];
	        currentStep[Constants.RETRIES] = currentStep[Constants.RETRIES] || rawTour[Constants.RETRIES];
	        currentStep[Constants.NEXT_BUTTON_CUS] = currentStep[Constants.NEXT_BUTTON_CUS] || rawTour[Constants.NEXT_BUTTON_CUS];
	        currentStep[Constants.BACK_BUTTON_CUS] = currentStep[Constants.BACK_BUTTON_CUS] || rawTour[Constants.BACK_BUTTON_CUS];
	        currentStep[Constants.SKIP_BUTTON_CUS] = currentStep[Constants.SKIP_BUTTON_CUS] || rawTour[Constants.SKIP_BUTTON_CUS];
	        currentStep[Constants.DONE_BUTTON_CUS] = currentStep[Constants.DONE_BUTTON_CUS] || rawTour[Constants.DONE_BUTTON_CUS];
	        var currentTarget = currentStep[Constants.NEXT_STEP_TRIGGER];
	        if (currentTarget && currentTarget === Constants.CURRENT_TARGET) {
	            currentStep[Constants.NEXT_STEP_TRIGGER] = currentStep[Constants.TARGET];
	        }

	        var flashTarget = currentStep[Constants.FLASH_TARGET];
	        if (flashTarget && flashTarget === Constants.CURRENT_TARGET) {
	            currentStep[Constants.FLASH_TARGET] = currentStep[Constants.TARGET];
	        }

	        /**
	         * Get the functions correspond to the onClick function name describe in customized buttons
	         */
	        var currentStepCustomizedButtons = currentStep[Constants.BUTTONS_CUS] || rawTour[Constants.BUTTONS_CUS];
	        if (Utils.isValid(currentStepCustomizedButtons)) {
	            for (var j = 0; j < currentStepCustomizedButtons.length; j++) {
	                var onClickFunctionName = currentStepCustomizedButtons[j][Constants.ONCLICK_NAME];
	                if (FlexTour.actionsList.hasOwnProperty(onClickFunctionName)) {
	                    currentStepCustomizedButtons[j][Constants.ONCLICK_NAME] = FlexTour.actionsList[onClickFunctionName];
	                }
	            }
	            currentStep[Constants.BUTTONS_CUS] = currentStepCustomizedButtons;
	        }
	    }
	    FlexTour.toursMap[rawTour[Constants.ID]] = rawTour;
	}

	/**
	 * This is the head quarter of displaying steps, overlay, and other things.
	 * Tags: CENTRAL, ORGANIZER, RUNNER
	 * @param stepDesc          Description object of current step to be run
	 * @param newStep           Flag to be set when this is the first time this step is rendered. Used to avoid duplicated event attachment
	 */
	function _centralOrganizer(stepDesc, newStep) {
	    var currentStepNumber = FlexTour.currentStepNumber;
	    FlexTour.Component = new Components(stepDesc, currentStepNumber + 1);

	    if (Utils.isValid(FlexTour.Component)) {
	        var showBack = false,
	            showNext = false,
	            disableNext = false,
	            noButtons = false;

	        // When the current step has NextOnTarget flag set, assuming that this step setup prerequisite for next step
	        // Which means that user cannot click Next, or Skip.

	        if (stepDesc[Constants.NO_BUTTONS] || stepDesc[Constants.TRANSITION]) {
	            noButtons = true;
	        }

	        var numberOfStep = FlexTour.currentTour[Constants.STEPS].length;

	        if (currentStepNumber < numberOfStep - 1) {
	            showNext = true;
	        }

	        if (stepDesc[Constants.NEXT_STEP_TRIGGER]) {
	            disableNext = true;
	        }

	        if (currentStepNumber > 0 && !stepDesc[Constants.NO_BACK]) {
	            showBack = true;
	        }

	        _executeGeneralFunction(Constants.BEFORE_STEP);

	        /**
	         * Create components can be only called once when the tour start for the first time.
	         */
	        if (!FlexTour.running) {
	            FlexTour.Component.createComponents(noButtons, showBack, showNext, disableNext);
	            FlexTour.running = true;
	            _addResizeWindowListener();
	            _addKeyBoardListener();

	            var bubbleStyles = FlexTour.currentTour[Constants.STYLES];
	            if (Utils.isValid(bubbleStyles)) {
	                Utils.getEleFromClassName(Constants.TOUR_BUBBLE, true).addClass(bubbleStyles);
	            }

	        } else {
	            FlexTour.Component.modifyComponents(noButtons, showBack, showNext, disableNext);
	        }

	        // Add event to Skip button if it exist
	        if (Utils.isValid(stepDesc[Constants.SKIP])) {
	            Utils.getElementsAndAttachEvent(Constants.SKIP_BUTTON_TRIGGER, Constants.FLEX_CLICK, _skipStep);
	        }
	        if (stepDesc[Constants.TRANSITION] && _isAllowToMove(currentStepNumber + 1, 0)) {
	            _transitionToNextStep(currentStepNumber + 1);
	        }

	        /**
	         * When this is a new step, attach event handlers to it. Otherwise skip.
	         */
	        if (newStep) {
	            if (Utils.isValid(stepDesc[Constants.NEXT_STEP_TRIGGER])) {
	                _addClickEventOnTargetClick(stepDesc[Constants.NEXT_STEP_TRIGGER]);
	            }
	            if (Utils.isValid(stepDesc[Constants.MODAL])) {
	                _bindScrollListener();
	            }

	            if (Utils.isValid(stepDesc[Constants.SCROLL_LOCK])) {
	                _blockScrolling();
	            }

	            _addClickEvents();

	            if (Utils.isDnDStep(stepDesc)) {
	                _dragStartPause(stepDesc[Constants.TARGET]);
	            }
	            if (Utils.isValid(stepDesc[Constants.MULTIPAGE])) {
	                _saveCurrentTourState();
	                Utils.setKeyValuePairLS(Constants.MULTIPAGE_KEY, true);
	                // We assume that the URL will be changed after this step, so we attach cleanup step on hashchange in case that happens.
	                Utils.addEvent($(window), FlexTour.HASH_CHANGE, function () {
	                    debugger;
	                    Utils.removeEvent($(window), FlexTour.HASH_CHANGE);
	                    _exit(false);
	                });
	            }
	        }

	        _executeGeneralFunction(Constants.AFTER_STEP);
	    } else {
	        console.log("Target of step: " + JSON.stringify(stepDesc) + " is not found in the DOM in the current step.");
	        _exit(true);
	        Utils.removeLSValue(Constants.LOCALSTORAGE_KEY); // Cleanup Local Storage if anything goes wrong.
	    }
	}

	/**
	 * Attached all necessary handlers to the elements
	 */
	function _addClickEvents() {
	    if (FlexTour.currentTour[Constants.END_ON_OVERLAY_CLICK]) {
	        Utils.getElementsAndAttachEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK, function () {
	            _exit(false);
	        });
	    }

	    Utils.getElementsAndAttachEvent(Constants.BACK_BUTTON_TRIGGER, Constants.FLEX_CLICK, _previousStep);

	    Utils.getElementsAndAttachEvent(Constants.NEXT_BUTTON_TRIGGER, Constants.FLEX_CLICK, _nextStep);

	    Utils.getElementsAndAttachEvent(Constants.DONE_BUTTON_TRIGGER, Constants.FLEX_CLICK, function () {
	        _exit(true);
	        Utils.removeLSValue(Constants.LOCALSTORAGE_KEY); // When the tour is done ... remove everything stored before.
	    });

	    Utils.getElementsAndAttachEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK, function () {
	        _exit(false);
	    });
	}

	/**
	 * This function get attached only when the step has NextOnTargetClick set to true
	 * @param nextTrigger {String}      QuerySelector string for next Trigger
	 */
	function _addClickEventOnTargetClick(nextTrigger) {
	    var nextTriggerTarget = $(nextTrigger);
	    if (Utils.hasELement(nextTriggerTarget)) {
	        Utils.addEvent(nextTriggerTarget, Constants.FLEX_CLICK, _nextStep);
	    }
	}

	/**
	 * Remove all attached event to avoid leaking memories
	 */
	function _removeEvents() {
	    Utils.removeELementsAndAttachedEvent(Constants.OVERLAY_STYLE, Constants.FLEX_CLICK);

	    Utils.removeELementsAndAttachedEvent(Constants.BACK_BUTTON_TRIGGER, Constants.FLEX_CLICK);

	    Utils.removeELementsAndAttachedEvent(Constants.NEXT_BUTTON_TRIGGER, Constants.FLEX_CLICK);

	    Utils.removeELementsAndAttachedEvent(Constants.DONE_BUTTON_TRIGGER, Constants.FLEX_CLICK);

	    Utils.removeELementsAndAttachedEvent(Constants.CLOSE_TOUR, Constants.FLEX_CLICK);
	}

	/**
	 * Remove the event listener for nextOnTargetClick
	 */
	function _removeClickEventOnTargetClick(nextTrigger) {
	    var nextTriggerTarget = $(nextTrigger);
	    if (Utils.hasELement(nextTriggerTarget)) {
	        Utils.removeEvent(nextTriggerTarget, Constants.FLEX_CLICK); //Remove this event listener
	    }
	}

	/**
	 * THIS PART RIGHT HERE IS WHAT MAKE FLEXTOUR DIFFERENT FROM OTHER ENGINES.
	 *
	 * This function resolves "prerequisites": [] attribute in the step description.
	 * There are 3 different functions that will define the flow of the tour:
	 * 1. Prerequisite functions:
	 *      - Syntax: ["Function Name", ...]
	 *      - Logic: Each function name correspond to a function in actionsList. At any point a prerequisite function return false, the flow will be stopped. --> All prerequisites MUST return true to continue.
	 * 2. Wait For Functions:
	 *      - Syntax: ["?FunctionName:params", ...]
	 *      - Logic: Similar to prerequisite, funciton name must be registered in actionsList. The params will be passed into the function.
	 *      There are 2 default functions: isVisible, doesExist which check if given DOM elemnts are visible, or exist respectively. You can also create your own custom functions to do the check.
	 *      When the wait for function returns false, FlexTourJS will retry after a set time interval, until it runs out of retries then it would proceed to the next function on the list.
	 * 3. Proceed If Function:
	 *      - Syntax: ["!FunctionName:params", ...]
	 *      - Logic: This function directly branchese the tour flow when needed. When this function returns false, the next step will not be processed, but it will branch to wherever "skip" attribute defines. If "skip" attribute is not defined, it will skip 2 steps ahead.
	 *      When this function returns true, it will continue the flow as normal.
	 *      This function can be used as a fail-safe measure, when all prerequisites seems to passed, but the target of next step will not be AVAILABLE (server error, etc.) this function will make sure your tour won't fail helplessly.
	 *
	 * @param possibleStepNumber    Step number to be checked for conditions. This is the future step, could be next 2 steps ahead.
	 * @param currPrerequisite      Counter to signal which condition where are checking right now.
	 * @returns {boolean}   True will var the transition happens, false will make it stay at the current step until the conditions are met
	 */
	function _isAllowToMove(possibleStepNumber, currPrerequisite) {
	    var possibleStep = FlexTour.currentTour[Constants.STEPS][possibleStepNumber];
	    if (!Utils.isValid(possibleStep)) {
	        return false;
	    }
	    var prerequisites = possibleStep[Constants.PREREQUISITES];
	    var prerequisiteBlock;
	    if (Utils.isValid(prerequisites) && currPrerequisite < prerequisites.length) {
	        var prerequisite = prerequisites[currPrerequisite].trim();
	        if (prerequisite.indexOf(Constants.WAIT) > -1) {
	            prerequisiteBlock = prerequisite.split(Constants.WAIT)[1].trim();

	            var temporaryResult = _executePrerequisiteCondition(possibleStepNumber, prerequisiteBlock);

	            if (!temporaryResult) {
	                if (possibleStep[Constants.RETRIES] <= 0) {
	                    // Reset the retries entry for current step, only works if Retries is set on Tour Description
	                    if (FlexTour.currentTour.hasOwnProperty(Constants.RETRIES)) {
	                        possibleStep[Constants.RETRIES] = FlexTour.currentTour[Constants.RETRIES];
	                    }
	                    _isAllowToMove(possibleStepNumber, ++currPrerequisite);
	                    return temporaryResult; // Return false when retries reaches 0;
	                } else {
	                    possibleStep[Constants.RETRIES]--;
	                    // Retry the the waitFor after certain time invertal
	                    setTimeout(function () {
	                        // Proceed to next one when this is waitFor is met. Of course this will require the next conditions are also successful
	                        _precheckForTransition(possibleStepNumber, currPrerequisite);
	                    }, possibleStep[Constants.WAIT_INTERVALS]);
	                }
	            } else {
	                // Reset the retries entry for current step, only works if Retries is set on Tour Description
	                if (FlexTour.currentTour.hasOwnProperty(Constants.RETRIES)) {
	                    possibleStep[Constants.RETRIES] = FlexTour.currentTour[Constants.RETRIES];
	                }
	                // Move to the next prerequisite when the Wait for condition is met.
	                return _isAllowToMove(possibleStepNumber, ++currPrerequisite);
	            }
	        } else if (prerequisite.indexOf(Constants.PROCEED_INDICATOR) > -1) {
	            prerequisiteBlock = prerequisite.split(Constants.PROCEED_INDICATOR)[1].trim();

	            if (!_executePrerequisiteCondition(possibleStepNumber, prerequisiteBlock)) {
	                var skipNumber = possibleStep[Constants.SKIP];
	                if (possibleStepNumber >= FlexTour.currentStepNumber) {
	                    // If the tour is going forward then skip it forward
	                    if (Utils.isValid(skipNumber)) {
	                        _precheckForTransition(skipNumber - 1, 0);
	                    } else {
	                        _precheckForTransition(possibleStepNumber + 1, 0);
	                    }
	                } else {
	                    // If the tour is going backward then skip it backward 1 step only
	                    _precheckForTransition(possibleStepNumber - 1, 0);
	                }
	                // At this point the step will be skipped. Return false so the potential step will not be rendered.
	                return false;
	            }
	            return true;
	        } else {
	            // This is the regular prerequisite function
	            if (_executeFunctionWithName(prerequisite, possibleStepNumber)) {
	                return _isAllowToMove(possibleStepNumber, ++currPrerequisite);
	            }
	            // Return false immediately if the result is false. The prerequisite condition is not met
	            return false;
	        }
	    } else {
	        // Return true if nobody sets prerequisite
	        // Base case, this is when it get to the last condition without failure
	        return true;
	    }
	}

	/**
	 * Execute the function with given name in a given lists of function.
	 * Make sure that the function exists in the list before executing it.
	 * @param functionName {String}     The name of the given function
	 * @param stepNumber {Number}      The possible step that is being tested
	 */
	function _executeFunctionWithName(functionName, stepNumber) {
	    if (typeof FlexTour.actionsList[functionName] === "function") {
	        return FlexTour.actionsList[functionName].call(this, FlexTour.currentTour[Constants.STEPS][stepNumber]);
	    }
	    // If the given function name exist in the list, return false to halt the process. Because this could cause the flow to break.
	    return false;
	}

	/**
	 * This is used to execute general functions in the framework: onStart, onExit, beforeStepRender, afterStepRender
	 * @param functionName {String}     Given function name to execute from actionsList
	 */
	function _executeGeneralFunction(functionName) {
	    if (typeof FlexTour.actionsList[functionName] === "function") {
	        FlexTour.actionsList[functionName].call(this);
	    }
	}

	/**
	 * Execute block where wait condition and skip condition. Split things up to condition name and parameters.
	 * Execute them accordingly. Either isVisible, doesExist (built-in) functions or custom functions
	 * @param stepNumber    Index of possible step
	 * @param prerequisite  The prerequisite block after removing ! and ? from it.
	 */
	function _executePrerequisiteCondition(stepNumber, prerequisite) {
	    // This is the most complex one in all. There are 3 parts to waitFor: "?condName:el1,el2,el3"
	    // First split the COLON Separator.
	    var tokens = prerequisite.split(Constants.COLON);

	    // Split "condName" must be in the 1st slot after splitting at colon
	    var condName = tokens[0];

	    var temporaryResult = true;

	    if (tokens.length > 1) {
	        // Split the DOM elements list if exist "el1,el2,el3".
	        var elementsList = tokens[1].split(Constants.COMMA);

	        var indexOfCurrentTarget = elementsList.indexOf(Constants.CURRENT_TARGET);
	        if (indexOfCurrentTarget !== -1) {
	            elementsList[indexOfCurrentTarget] = FlexTour.currentTour[Constants.STEPS][stepNumber][Constants.TARGET];
	        }

	        if (condName === Constants.IS_VISIBLE) {
	            temporaryResult = temporaryResult && Utils.isVisible(elementsList);
	        } else if (condName === Constants.DOES_EXIST) {
	            temporaryResult = temporaryResult && Utils.doesExist(elementsList);
	        } else {
	            // When the condition name is not built-in, pass the array of element into the customized functions.
	            if (typeof FlexTour.actionsList[condName] === "function") {
	                temporaryResult = temporaryResult && FlexTour.actionsList[condName].apply(this, elementsList);
	            }
	        }
	    } else {
	        return _executeFunctionWithName(condName, stepNumber);
	    }

	    return temporaryResult;
	}

	/**
	 * Factored function to check if the next step is allowed, if yes move to that step
	 * @param stepNumber        Next step index number
	 * @param prerequisiteNumber        The prerequisite to be checked
	 */
	function _precheckForTransition(stepNumber, prerequisiteNumber) {
	    if (stepNumber >= FlexTour.currentTour[Constants.STEPS].length) {
	        _exit(true);
	    }
	    if (_isAllowToMove(stepNumber, prerequisiteNumber)) {
	        _transitionToNextStep(stepNumber);
	    }
	}

	/**
	 * Skip the next step to the next next step.
	 */
	function _skipStep(event) {
	    Utils.noDefault(event);
	    _cleanUpAfterStep();
	    Utils.removeELementsAndAttachedEvent(Constants.SKIP_BUTTON_TRIGGER, Constants.FLEX_CLICK);

	    var skipToStep = FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber][Constants.SKIP];
	    if (Utils.isValid(skipToStep)) {
	        _precheckForTransition(skipToStep - 1, 0);
	    }
	}

	/**
	 * Decrement current step counter and go back to previous step ... Obviously it will not be the last step
	 */
	function _previousStep(event) {
	    Utils.noDefault(event);
	    _cleanUpAfterStep();

	    _precheckForTransition(FlexTour.currentStepNumber - 1, 0);
	}

	/**
	 * Trigger next step of the tour. If the next step is the last step, trigger the isLastStep flag
	 */
	function _nextStep(event) {
	    Utils.noDefault(event);
	    _cleanUpAfterStep();

	    _precheckForTransition(FlexTour.currentStepNumber + 1, 0);
	}

	/**
	 * Common factor for transition step, either skip, previous or next.
	 * @param stepNumber
	 */
	function _transitionToNextStep(stepNumber) {
	    var stepDelay = FlexTour.currentTour[Constants.STEPS][stepNumber][Constants.DELAY];

	    function __transitionFunction(stepNumber) {
	        FlexTour.currentStepNumber = stepNumber;
	        _centralOrganizer(FlexTour.currentTour[Constants.STEPS][stepNumber], true);
	    }

	    if (Utils.isValid(stepDelay)) {
	        setTimeout(__transitionFunction.bind(this, stepNumber), stepDelay);
	    } else {
	        __transitionFunction(stepNumber);
	    }
	}

	/**
	 * Add window resize event to recalculate location of tour step.
	 */
	function _addResizeWindowListener() {
	    Utils.addEvent($(window), Constants.FLEX_RESIZE, Utils.debounce(__rerenderResize, 500, false));
	}

	/**
	 * CallBack function that get executed when window is resized
	 * This event is only trigger once every 1/2 second. So that it won't go crazy and trigger too many event on resizing
	 */
	function __rerenderResize() {
	    _removeEvents();
	    FlexTour.Component.removeOverlays();
	    _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber], false);
	    _addClickEvents();
	}

	/**
	 * Rerender current step.
	 */
	function __rerenderScroll() {
	    _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber], false);
	}

	/**
	 * Remove resize listener from window without detaching other handlers from main program
	 */
	function _unbindResizeWindowListener() {
	    Utils.removeEvent($(window), Constants.FLEX_RESIZE);
	}

	/**
	 * Attach keyup event into the window element so that it will be trigger on keyup
	 */
	function _addKeyBoardListener() {
	    Utils.addEvent($(window), Constants.KEY_UP, _keyUpCallBack);
	}

	/**
	 * Callback function when keyup is triggered.
	 * When keycode is ESC, and current tour end on escape --> invoke exit
	 * @param event     Keyboard event
	 */
	function _keyUpCallBack(event) {
	    // Escape key is triggered
	    if (event.keyCode === 27 && Utils.isValid(FlexTour.currentTour[Constants.END_ON_ESC])) {
	        _exit(false);
	    }
	}

	/**
	 * Unbind the keyup handler on exit, so that it won't cause memory leak
	 */
	function _unbindKeyboardListener() {
	    Utils.removeEvent($(window), Constants.KEY_UP);
	}

	/**
	 * Bind scrolling event to the window. Debounce function call every 0.1 second so that it won't overload the app
	 */
	function _bindScrollListener() {
	    Utils.addEvent($(window), Constants.SCROLL, Utils.debounce(__rerenderScroll, 200, false));
	}

	/**
	 * Unbind scrolling event in the window. So that it won't throw unneccesary event calls when it's not needed
	 */
	function _unbindScrollListener() {
	    Utils.removeEvent($(window), Constants.SCROLL);
	}

	/**
	 * Clean things up after each step. Unbind the event listeners to avoid memory leaks
	 */
	function _cleanUpAfterStep() {
	    var currentStep = FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber];
	    if (!Utils.isValid(currentStep)) {
	        return;
	    }
	    if (Utils.isValid(currentStep[Constants.NEXT_STEP_TRIGGER])) {
	        // Clean up next on target click here.
	        _removeClickEventOnTargetClick(currentStep[Constants.NEXT_STEP_TRIGGER]);
	    }
	    if (currentStep[Constants.MODAL]) {
	        _unbindScrollListener();
	    }
	    _removeEvents();

	    if (Utils.isValid(currentStep[Constants.SCROLL_LOCK])) {
	        _unblockScrolling();
	    }

	    if (Utils.isValid(currentStep[Constants.BUTTONS_CUS])) {
	        var buttons = currentStep[Constants.BUTTONS_CUS];
	        for (var i = 0; i < buttons.length; i++) {
	            Utils.removeEvent(Utils.getEleFromClassName(buttons[i][Constants.BUTTON_STYLE], true), Constants.FLEX_CLICK);
	        }
	    }
	}

	/**
	 * Block the scroll bar in place. This goes against philosophy of FlexTourJS because it interfere with the application's behavior
	 * But this method reduces the performance hit of re-render when user scroll. This method only render once and locked-in place.
	 * @private
	 */
	function _blockScrolling() {
	    var top = $(window).scrollTop();
	    var left = $(window).scrollLeft();

	    Utils.addEvent($(window), Constants.SCROLL, function (e) {
	        e.preventDefault();
	        $(window).scrollTop(top).scrollLeft(left);
	    });
	    // Re-render the components after the scrolling has been locked.
	    Utils.debounce(__rerenderScroll, 10, true);
	}

	/**
	 * Unblock scrolling so that it won't interfere with the application
	 */
	function _unblockScrolling() {
	    Utils.removeEvent($(window), Constants.SCROLL);
	}

	/**
	 * Attach event to pause the tour engine when users start dragging something.
	 * Ondrop, the framework will check if the next step should be proceed, in case it's not --> stay at the same step
	 * Syntax: {Boolean}. If it's set to true, it will temporarily remove all overlays and var users drag at will.
	 * @param stepTarget {String}     DOM Selector string for current step target
	 */
	function _dragStartPause(stepTarget) {
	    Utils.addEvent($(stepTarget), Constants.DRAG_START, _removeAndUnbind);
	    Utils.addEvent($(stepTarget), Constants.DRAG_END, function () {
	        __moveOnDropTarget(stepTarget);
	    });
	}

	/**
	 * Function that corresponds to drag end call.
	 * @param stepTarget        The dragged element that is dropped
	 */
	function __moveOnDropTarget(stepTarget) {
	    _dragEndResume(stepTarget);
	    if (_isAllowToMove(FlexTour.currentStepNumber + 1, 0)) {
	        _transitionToNextStep(FlexTour.currentStepNumber + 1);
	    } else {
	        _centralOrganizer(FlexTour.currentTour[Constants.STEPS][FlexTour.currentStepNumber], true);
	    }
	}

	/**
	 * Resume the tour engine when users drop the element into whereever they want.
	 * onDrop event, the tour will resume to the next step and resume all overlays.
	 * @param stepTarget {String}     DOM Selector string for current step target
	 */
	function _dragEndResume(stepTarget) {
	    Utils.removeEvent($(stepTarget), Constants.DRAG_START);
	    Utils.removeEvent($(stepTarget), Constants.DRAG_END);
	}

	/**
	 * Function to remove everything and unbind all events. However, this doesn't stop the tour. This function will be reused for DnD, pause tour on request.
	 */
	function _removeAndUnbind() {
	    _unbindResizeWindowListener();
	    _unbindKeyboardListener();
	    _cleanUpAfterStep();

	    if (Utils.isValid(FlexTour.Component)) {
	        FlexTour.Component.removeComponents();
	    }
	    FlexTour.running = false; // Reset this flag when users quit the tour
	}

	/**
	 * Clean up everything when the tour is exited. This is to prevent memory leaks for attached events in DOM elements.
	 * Remove all components and set the running flag to false, and set currentStepNumber to false
	 * @param isDone: Boolean       Only set when users have finished the tour successfully.
	 */
	function _exit(isDone) {
	    if (FlexTour.currentTour[Constants.PAUSE_ON_EXIT] && (!Utils.isValid(isDone) || !isDone)) {
	        _saveCurrentTourState();
	        Utils.setKeyValuePairLS(Constants.PAUSED_KEY, true);
	    }
	    _removeAndUnbind();
	    FlexTour.currentStepNumber = 0;
	    _executeGeneralFunction(Constants.ON_EXIT);
	}

	/**
	 * Run the tour starting with the given step number.
	 */
	function _runTourWithGivenSteps() {
	    var steps = FlexTour.currentTour[Constants.STEPS];
	    if (Utils.isValid(steps)) {
	        _precheckForTransition(FlexTour.currentStepNumber, 0);
	    }
	}

	/**
	 * Update the tour infor from LS. This is used for multipage and pause/resume feature for now
	 */
	function _updateTourInfoFromLS() {
	    var previouslyRunTour = Utils.getKeyValuePairLS(Constants.STEP_STATUS);
	    if (!$.isEmptyObject(previouslyRunTour)) {
	        FlexTour.currentTourId = previouslyRunTour[Constants.PAUSED_TOUR];
	        FlexTour.currentTour = $.extend(true, {}, FlexTour.toursMap[FlexTour.currentTourId]);
	        FlexTour.currentStepNumber = previouslyRunTour[Constants.PAUSED_STEP];
	        Utils.removeKeyValuePairLS(Constants.STEP_STATUS);
	    }
	}

	/**
	 * Save current state into local storage
	 */
	function _saveCurrentTourState() {
	    var currentInfo = {
	        pausedTour: FlexTour.currentTourId,
	        pausedStep: FlexTour.currentStepNumber
	    };
	    Utils.setKeyValuePairLS(Constants.STEP_STATUS, currentInfo);
	}

	/**
	 * This function will loop back until it finds a savePoint. This is to avoid executing every single step to find the available step.
	 * Instead, what's going to happen is that the framework will try to find the current target. If it doesn't exist, it will loop back till it finds the closest save point.
	 * When no save point is set, it will run from the beginning.
	 *
	 * Why? Since this framework is supposed to support dynamic tours which at some points the target only shows when a previous step triggers something (i.e: Click on a button to open a modal, or dropdown, etc.). In this example, you should set that button as savePoint because it is where you trigger your target.
	 */
	function _findSavePoint() {
	    var steps = FlexTour.currentTour[Constants.STEPS];
	    if (Utils.isValid(steps)) {
	        var currentStepTarget = steps[FlexTour.currentStepNumber][Constants.TARGET];
	        // If current step target cannot be found, loops back till you find the closest save point
	        if (!(Utils.hasELement($(currentStepTarget)) && Utils.isVisible(currentStepTarget))) {
	            --FlexTour.currentStepNumber;
	            while (FlexTour.currentStepNumber > -1) {
	                if (Utils.checkFlag(steps[FlexTour.currentStepNumber][Constants.SAVE_POINT])) {
	                    break;
	                }
	                --FlexTour.currentStepNumber;
	            }
	        }
	        _precheckForTransition(FlexTour.currentStepNumber, 0);
	    }
	}

	/**
	 * Constructor of the whole thing.
	 * @param tourDesc      The JSON file that describe what the tours should be like
	 * @param actionsList   The object contains all functions that control the flow of the tours
	 * @param translation   The object contains all translated string for this tour, the content will be sub in
	 * @constructor
	 */
	function FlexTour(tourDesc, actionsList, translation) {
	    FlexTour.toursMap = {};
	    FlexTour.currentTourId = "";
	    FlexTour.currentStepNumber = 0;
	    FlexTour.currentTour = {};
	    FlexTour.actionsList = actionsList || {};
	    FlexTour.translation = translation || {};
	    FlexTour.running = false; // A flag that var the system know that a tour is being run
	    _preprocessingTours(tourDesc);
	}

	/**
	 * Run the tour, if it is multipage --> run the previously set step. This is ensured by dev that the next step will be successful.
	 * If this is the first time you run the tour --> it will just run from step 1.
	 */
	FlexTour.prototype.run = function () {
	    if ($.isEmptyObject(FlexTour.toursMap)) {
	        return;
	    }
	    _executeGeneralFunction(Constants.ON_START);

	    var multipageFlag = Utils.getKeyValuePairLS(Constants.MULTIPAGE);
	    var pausedFlag = Utils.getKeyValuePairLS(Constants.PAUSED_KEY);
	    if (Utils.checkFlag(pausedFlag)) {
	        _updateTourInfoFromLS();
	        Utils.removeKeyValuePairLS(Constants.PAUSED_KEY);
	        // In case the step is both multipage trigger and paused on --> remove multipage trigger for now because it will be set later on.
	        Utils.removeKeyValuePairLS(Constants.MULTIPAGE_KEY);
	        _findSavePoint();
	    } else if (Utils.checkFlag(multipageFlag)) {
	        _updateTourInfoFromLS();
	        Utils.removeKeyValuePairLS(Constants.MULTIPAGE_KEY);
	        ++FlexTour.currentStepNumber;

	        _runTourWithGivenSteps();
	    } else {
	        // You started a new tour --> just run the first step of new tour.
	        FlexTour.currentTour = $.extend(true, {}, FlexTour.toursMap[FlexTour.currentTourId]);
	        FlexTour.currentStepNumber = 0;

	        _runTourWithGivenSteps();
	    }
	};

	/**
	 * User can trigger this function to end tour premature
	 */
	FlexTour.prototype.exit = function () {
	    _exit(false);
	};

	/**
	 * Store the current value of tour id and current step number. The terminate the framework
	 */
	FlexTour.prototype.pause = function () {
	    _saveCurrentTourState();
	    Utils.setKeyValuePairLS(Constants.PAUSED_KEY, true);
	    this.exit();
	};

	/**
	 * Resume the previously run tour with given id and the step number.
	 * Resume to the previously run step ... not the step after it.
	 */
	FlexTour.prototype.resume = function () {
	    _updateTourInfoFromLS();
	    Utils.removeKeyValuePairLS(Constants.PAUSED_KEY);
	    _findSavePoint();
	};

	module.exports = FlexTour;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*******************************************************************************
	 * Copyright (c) 2016. MIT License.
	 * NhatHo-nhatminhhoca@gmail.com
	 ******************************************************************************/

	var Constants = __webpack_require__(2);
	var Utils = __webpack_require__(3);
	var $ = __webpack_require__(4);

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
	        height: Components.rect.height + Constants.PX,
	        top: Components.rect.top + Constants.PX,
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
	        height: Components.rect.height + Constants.PX,
	        top: Components.rect.top + Constants.PX,
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
	    _createOverlayNode(_getTopOverlay()).appendTo(Components.ui);
	    _createOverlayNode(_getRightOverlay()).appendTo(Components.ui);
	    _createOverlayNode(_getBottomOverlay()).appendTo(Components.ui);
	    _createOverlayNode(_getLeftOverlay()).appendTo(Components.ui);
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
	        "class": Constants.OVERLAY_STYLE
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
	    if (Utils.hasELement(overlays)) {
	        if (overlays.length !== 1) {
	            overlays.remove();
	            var overlay = _createOverlayNode({
	                width: Utils.getFullWindowWidth() + Constants.PX,
	                height: Utils.getFullWindowHeight() + Constants.PX,
	                top: 0,
	                left: 0
	            });
	            overlay.appendTo(Components.ui);
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
	    var overlayDivs = Utils.getEleFromClassName(Constants.OVERLAY_STYLE, true);
	    if (Utils.hasELement(overlayDivs)) {
	        overlayDivs.remove();
	    }
	};

	module.exports = Components;

/***/ },
/* 2 */
/***/ function(module, exports) {

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

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*******************************************************************************
	 * Copyright (c) 2016. MIT License.
	 * NhatHo-nhatminhhoca@gmail.com
	 ******************************************************************************/

	var Constants = __webpack_require__(2);
	var $ = __webpack_require__(4);

	module.exports = {
	    /**
	     * Check if the target is visible or not. This has a draw back that the target might not have render completely
	     * If that is the case the bubble and highlight box will not render properly.
	     * @param targets    Array of targets of current step
	     * @return {boolean}    True if target takes up a rectangle in the DOM, false otherwise
	     */
	    isVisible: function (targets) {
	        var result = true;
	        var targetsArray = this.convertToArray(targets);
	        for (var i = 0; i < targetsArray.length; i++) {
	            var element = $(targetsArray[i]);
	            if (this.hasELement(element)) {
	                result = result && element.is(":visible");
	            } else {
	                // If any element doesn't exist --> return false immediately
	                return false;
	            }
	        }

	        return result;
	    },

	    /**
	     * Check if the target exists in the DOM or not. This operator costs less than _isTargetVisible function.
	     * @param targets    Target of current step
	     * @returns {boolean}       True if target exists in DOM, false otherwise
	     */
	    doesExist: function (targets) {
	        var result = true;
	        // Make sure the input becomes an array event if it's a single target
	        var targetsArray = this.convertToArray(targets);
	        for (var i = 0; i < targetsArray.length; i++) {
	            result = result && this.hasELement($(targetsArray[i]));
	        }
	        return result;
	    },

	    /**
	     * Check if the input is an array, convert it to an array when it is NOT
	     * @param elements {String|Array}   Input elements
	     * @returns {*}     An array contains elements
	     */
	    convertToArray: function (elements) {
	        if ($.isArray(elements)) {
	            return elements;
	        } else {
	            return [elements];
	        }
	    },

	    /**
	     * Check if a given object a valid object with content.
	     * If given an array, the array must have element
	     * @param object        Any object, array, letiable
	     * @returns {boolean}   True if valid, false otherwise
	     */
	    isValid: function (object) {
	        if ($.isArray(object)) {
	            return object.length > 0;
	        }
	        return (object != null && typeof object != 'undefined');
	    },

	    /**
	     * Check if the given Jquery selector has any element
	     * @param $el       JQuery selector
	     * @returns {boolean}       True if it has child element
	     */
	    hasELement: function ($el) {
	        return ($el.length > 0);
	    },

	    /**
	     * Add event to element without unnecessarily overrid original handlers
	     * @param el        Element to be attached listener/event on
	     * @param type      Type of event to listen to
	     * @param callback  Callback function when event is fired
	     */
	    addEvent: function (el, type, callback) {
	        if (!this.isValid(el))
	            return;
	        el.on(type, callback);
	    },

	    /**
	     * Remove event listener for cleaning up
	     * @param el        Element that contains event that needs to be removed
	     * @param type      Type of event that was attached
	     * @param callback  Function to remove from the event
	     */
	    removeEvent: function (el, type, callback) {
	        if (!this.isValid(el))
	            return;
	        el.off(type, callback);
	    },

	    /**
	     * Prevent event to propagate and behave by default. Generally used for click event
	     * @param event     The event to be stopped default behavior
	     */
	    noDefault: function (event) {
	        event.preventDefault();
	        event.stopPropagation();
	    },

	    /**
	     * Simple function to create Class Name selector from give html class
	     * @param className     class name of give DOM element
	     * @returns {*}     .className for query selector
	     */
	    getClassName: function (className) {
	        return Constants.CLASS + className;
	    },

	    /**
	     * Get the first element found in the DOM
	     * @param className     The classname of the element without the "."
	     * @param jquerySelector    When set to true, just the return the selector instead of the 1st element
	     * @returns {*}     The first element or nothing
	     */
	    getEleFromClassName: function (className, jquerySelector) {
	        var $el = $(this.getClassName(className));

	        if (jquerySelector) {
	            return $el;
	        }

	        if ($el) {
	            return $el[0];
	        }
	        return $el;
	    },

	    /**
	     * Get multiple DOM elements from given class, usually use for multiple elements with same class name
	     * @param className     Similar classname of group of elements
	     */
	    getElesFromClassName: function (className) {
	        return $(this.getClassName(className));
	    },

	    /**
	     * Check if the description of this step is valid.
	     * Step must at least have target and description
	     * @param stepDesc      The description of the step
	     * @returns {*|boolean} True if it has target AND content, false otherwise
	     */
	    isStepWithTarget: function (stepDesc) {
	        return (stepDesc.hasOwnProperty(Constants.TARGET) && stepDesc.hasOwnProperty(Constants.CONTENT));
	    },

	    /**
	     * Check if the current step is a floating step. Meaning there isn't a target.
	     * @param stepDesc      Description of the step
	     * @returns {boolean|*} True when step has content and position is set to float
	     */
	    isFloatStep: function (stepDesc) {
	        return (stepDesc[Constants.POSITION] === Constants.FLOAT && stepDesc.hasOwnProperty(Constants.CONTENT));
	    },

	    /**
	     * Check to see if current step is a valid drag and drop step, the DND flag must be set, and there must be a target to attach event to.
	     * @param stepDesc {Object}     The object that contains the description of the current step
	     */
	    isDnDStep: function (stepDesc) {
	        return (stepDesc[Constants.DND] && stepDesc.hasOwnProperty(Constants.TARGET));
	    },

	    /**
	     * Get the element list from the given classname.
	     * Run through each element and attach event and callback function to it
	     * @param className     The className of element (without the DOT)
	     * @param event         The event that will trigger
	     * @param callback      The callback function that will be triggered when event is triggered
	     */
	    getElementsAndAttachEvent: function (className, event, callback) {
	        var els = this.getElesFromClassName(className);
	        this.addEvent(els, event, callback);
	    },

	    /**
	     * Get the element list from the given classname.
	     * Run through each element and UNATTACH event and trigger callback function
	     * @param className     The className of element (without the DOT)
	     * @param event         The event that will trigger
	     * @param callback      The callback function that will be triggered when event is triggered
	     */
	    removeELementsAndAttachedEvent: function (className, event, callback) {
	        var els = this.getElesFromClassName(className);
	        this.removeEvent(els, event, callback);
	    },

	    /**
	     * Get max of Window height or document height
	     * @returns {Number|number}     window width through 1 of 3 methods
	     */
	    getFullWindowWidth: function () {
	        return Math.max($(document).width(), $(window).width());
	    },

	    /**
	     * Get max of either window width or document width.
	     * @returns {Number|number}     window height through 1 of 3 methods
	     */
	    getFullWindowHeight: function () {
	        return Math.max($(document).height(), $(window).innerHeight());
	    },

	    /**
	     * Returns a function, that, as long as it continues to be invoked, will not
	     * be triggered. The function will be called after it stops being called for
	     * N milliseconds. If `immediate` is passed, trigger the function on the
	     * leading edge, instead of the trailing.
	     * Taken from Underscore.js
	     */
	    debounce: function (func, wait, immediate) {
	        var timeout;
	        return function () {
	            var context = this, args = arguments;
	            var later = function () {
	                timeout = null;
	                if (!immediate) func.apply(context, args);
	            };
	            var callNow = immediate && !timeout;
	            clearTimeout(timeout);
	            timeout = setTimeout(later, wait);
	            if (callNow) func.apply(context, args);
	        };
	    },

	    /**
	     * Smooth scroll to the element
	     * @param rect    The target of the step that needs to be scrolled to
	     * @param position  The position of the tooltip relative to the content
	     */
	    smoothScroll: function (rect, position) {
	        var offset = rect.top - 40; // Minus extra 20 pixels from the top of the target
	        if (position === Constants.TOP) {
	            offset -= this.getEleFromClassName(Constants.TOUR_BUBBLE, true).height();
	        }
	        $('html, body').animate({
	            scrollTop: offset
	        }, 300);
	    },

	    /**
	     * Store the give key, value pair to localstorage
	     * Flextour uses flextour.localstorage key in localstorage for storing data.
	     * @param key {String}      The key of the data piece that you want to store
	     * @param value {String|Object|Number}    The value that you want to store
	     */
	    setKeyValuePairLS: function (key, value) {
	        try {
	            var storageValue = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_KEY));
	            // Initialize the storageValue object if it was not previously set
	            if (!this.isValid(storageValue)) {
	                storageValue = {};
	            }
	            storageValue[key] = value;
	            localStorage.setItem(Constants.LOCALSTORAGE_KEY, JSON.stringify(storageValue));
	        } catch (e) {
	            // Ignore the error message, print to console that multipage features are not supported
	            console.log("Multipage feature cannot be supported in this browser version");
	        }
	    },

	    /**
	     * Get the value that is currently stored in localstorage corresponds to the given key
	     * @param key {String}      The key of the data piece that we want to retrieve
	     * @returns {Object}        The content of given key, if it doesn't exist, return empty object
	     */
	    getKeyValuePairLS: function (key) {
	        try {
	            return JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_KEY))[key];
	        } catch (e) {
	            // Ignore the error if the key doesn't exist
	            return {};
	        }
	    },

	    /**
	     * Remove the key and value pair in localstorage with given key. This is to cleanup everything properly after used.
	     * @param key {String}      The key of data that we want to remove from LS
	     */
	    removeKeyValuePairLS: function (key) {
	        try {
	            var flexTourLS = JSON.parse(localStorage.getItem(Constants.LOCALSTORAGE_KEY));
	            delete flexTourLS[key];
	            localStorage.setItem(Constants.LOCALSTORAGE_KEY, JSON.stringify(flexTourLS));
	        } catch (e) {
	            // Ignore the error message
	        }
	    },

	    /**
	     * Remove the key-value pair in current localStorage
	     * @param key       The key that needs to be removed
	     */
	    removeLSValue: function (key) {
	        try {
	            localStorage.removeItem(key);
	        } catch (e) {
	            // Ignore the error if the key doesn't exist
	            console.log("The localstorage might not contain the given key");
	        }
	    },

	    /**
	     * Check if the flag exists, if it exist, is it true or false?
	     */
	    checkFlag: function (flag) {
	        if (typeof flag === 'object' && $.isEmptyObject(flag)) {
	            return false;
	        } else {
	            return flag;
	        }
	    }
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }
/******/ ])
});
;