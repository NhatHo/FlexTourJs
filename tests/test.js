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
    waitIntervals: 1000,
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
    }, {
        content: "Open Modal",
        position: "right",
        target: "#myBtn",
        nextOnTargetClick: true,
        type: "action"
    }, {
        content: "Show Modal here",
        position: "bottom",
        target: ".modal-content",
        delay: 500,
        prerequisites: ["action1", "?isVisible:@target@"]
    }]
}];

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
    setTimeout(function () {
        modal.style.display = "block";
    }, 8000);
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

document.querySelector("#trigger").onclick = function () {
    let flexTour = new FlexTour(tourDesc, actionsList);
    flexTour.run();
};
