/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

document.querySelector("#trigger").onclick = function () {
    let flexTour = new FlexTour([{
        id: "test",
        endOnOverlayClick: true,
        endOnEsc: true,
        canInteract: false,
        steps: [{
            content: "Header level 1",
            position: "right",
            target: "#title",
            type: "info"
        }, {
            content: "Header level 2",
            position: "bottom",
            target: "#title2",
            type: "info"
        }, {
            content: "Big box of nothing",
            position: "top",
            target: "#testbox"
        }]
    }]);
    flexTour.run();
};
