/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

let actionsList = {};
actionsList.action("action1", function () {
    return true;
}).action("action2", function () {
    return false;
});

let tourDesc = [{
    id: "test",
    endOnOverlayClick: true,
    endOnEsc: true,
    canInteract: false,
    steps: [{
        content: "Header level 1\nTesting level again\n\nLine 3",
        position: "right",
        target: "#title",
        type: "info",
        prerequisite: ["action1"]
    }, {
        content: "Header level 2",
        position: "bottom",
        target: "#title2",
        type: "action",
        nextOnTargetClick: true,
        prerequisite: ["action2"]
    }, {
        content: "Header level 2 again",
        position: "left",
        target: "#title3",
        type: "info"
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
