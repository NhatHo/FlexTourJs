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
actionsList.skipWhenElementIsNotShowed = function () {
    let isShowed = document.querySelector("#randomEle");
    return isShowed.style.display === "block";
};

let tourDesc = [{
    id: "test",
    endOnEsc: true,
    endOnOverlayClick: false,
    canInteract: false,
    waitIntervals: 1000,
    retries: 20,
    steps: [{
        title: "First Step of the thing",
        content: "Header level 1\nTesting level again\n\nLine 3",
        position: "right",
        target: "#title",
        type: "info"
    }, {
        title: "Second Step of the thing",
        content: "Header level 2",
        position: "bottom",
        target: "#title2",
        type: "action",
        nextOnTargetClick: true,
        prerequisites: ["action2"]
    }, {
        content: "Random Header",
        position: "bottom",
        target: "#randomEle",
        type: "info",
        prerequisites: ["!skipWhenElementIsNotShowed"]
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
        content: "Please wait for Modal",
        position: "float",
        type: "info",
        transition: true
    }, {
        content: "Show Modal here",
        position: "bottom",
        target: ".modal-content",
        delay: 500,
        noBack: true,
        prerequisites: ["action1", "?isVisible:@target@"]
    }]
}];

// Get the modal
let modal = document.getElementById('myModal');

// Get the button that opens the modal
let btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
    setTimeout(function () {
        modal.style.display = "block";
    }, 4000);
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

let random = document.getElementById("randomEle");

let randomNum = Math.round(Math.random() * 1000);
if (randomNum % 2 === 0) {
    random.style.display = "block";
} else {
    random.style.display = "none";
}

