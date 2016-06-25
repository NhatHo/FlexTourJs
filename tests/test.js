/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

let actionsList = {};
actionsList.action1 = function () {
    return true;
};
actionsList.action2 = function () {
    return true;
};

let tourDesc = [{
    id: "test",
    endOnOverlayClick: true,
    endOnEsc: true,
    canInteract: false,
    waitIntervals: 100,
    retries: 20,
    steps: [{
        content: "Header level 1\nTesting level again\n\nLine 3",
        position: "right",
        target: "#title",
        type: "info"
    }, {
        content: "Header level 2",
        position: "bottom",
        target: "#title2",
        type: "action",
        nextOnTargetClick: true,
        prerequisites: ["action2"]
    }, {
        content: "Header level 2 again",
        position: "left",
        target: "#title3",
        type: "info",
        prerequisites: ["action1"]
    }, {
        content: "Big box of nothing",
        position: "top",
        target: "#testbox"
    }]
}];

document.querySelector("#trigger").onclick = function () {
    let flexTour = new FlexTour(tourDesc, actionsList);
    flexTour.run();
};
