/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

let actionsList = {};
actionsList.action1 = function (currentStep) {
    currentStep.position = "top";
    return true;
};
actionsList.action2 = function () {
    return true;
};
actionsList.skipWhenElementIsNotShowed = function () {
    let isShowed = document.querySelector("#randomEle");
    return isShowed.style.display === "block";
};
actionsList.showAlert = function () {
    alert("Hello you're stuck here.");
};
actionsList.showAlert2 = function () {
    alert("Hello Alert 2 here, are you stuck again?");
};

let tourDesc = [{
    id: "test",
    endOnEsc: true,
    endOnOverlayClick: true,
    canInteract: false,
    waitIntervals: 1000,
    retries: 20,
    steps: [{
        title: "First Step of the thing",
        content: "Header level 1<br />Testing level again<br /><br />Line 3",
        position: "right",
        skip: 5,
        target: "#title",
        type: "info",
        prerequisites: ["action1"]
    }, {
        title: "Drag and Drop Test",
        content: "You must drag this thing",
        position: "right",
        target: "#draggable",
        dragAndDrop: true,
        type: "action",
        noButtons: true
    }, {
        title: "Second Step of the thing",
        content: "Header level 2",
        position: "bottom",
        target: "#testBlock",
        type: "action",
        nextStepTrigger: "#nextButtonTest",
        prerequisites: ["action2"],
        nextButton: "Next",
        backButton: "Back",
        doneButton: "Yay"
    }, {
        content: "Random Header",
        position: "bottom",
        skip: 4,
        target: "#randomEle",
        type: "info",
        prerequisites: ["!skipWhenElementIsNotShowed"]
    }, {
        content: "Standard block inside scroll",
        target: "#ite1",
        position: "right"
    }, {
        content: "Header level 2 again",
        position: "left",
        skip: 6,
        target: "#title3",
        type: "info",
        prerequisites: ["action1"]
    }, {
        content: "Big box of nothing",
        position: "top",
        target: "#testbox",
        buttons: [{
            name: "Alert",
            buttonStyle: "flextour-next-button",
            onclick: "showAlert"
        }, {
            name: "Alert 2",
            buttonStyle: "flextour-back-button",
            onclick: "showAlert2"
        }]
    }, {
        content: "Open Modal",
        position: "right",
        target: "#myBtn",
        nextStepTrigger: "@target@",
        type: "action"
    }, {
        content: "Please wait for Modal",
        position: "float",
        type: "info",
        transition: true
    }, {
        content: "Show Modal here",
        position: "top",
        target: ".modal-content",
        scrollLock: true,
        delay: 600,
        noBack: true,
        prerequisites: ["action1", "?isVisible:@target@"]
    }, {
        content: "Child Element",
        position: "left",
        scrollLock: true,
        target: "#item3",
        modal: true
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

function drag(event) {
    localStorage.setItem("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    var data = localStorage.getItem("text");
    event.target.appendChild(document.getElementById(data));
}

function allowDrop(event) {
    event.preventDefault();
}
