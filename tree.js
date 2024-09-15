
var wordSubjects = document.querySelectorAll(".Tree li");
var svgSubjects = document.querySelectorAll("#subjects > *");
var sectionSubjects = document.querySelectorAll(".Tree h4,.Tree h3,.Tree h2");

function removeAllOn() {
    wordSubjects.forEach(function(el) {
        el.classList.remove("on");
    });
    svgSubjects.forEach(function(el) {
        el.classList.remove("on");
    });
    sectionSubjects.forEach(function(el) {
        el.classList.remove("on");
    });
}

function addOnFromList(el) {
    var subjectCode = el.getAttribute("data-subject");
    var svgSubject = document.querySelector("#" + subjectCode);
    el.classList.add("on");
    svgSubject.classList.add("on");
    if(subjectCode === "Revenue") {
        document.querySelector("#Cycle").classList.add("on");
    }
    else{}
    if(subjectCode === "Patient"){
        document.querySelector("#Access").classList.add("on");
    }

}


function addOnFromListSection(el) {
    var subjectCode = el.getAttribute("data-subject");
    // Select all SVG elements that match the data-subject attribute
    var svgSubject = document.querySelectorAll("." + subjectCode);
    el.classList.add("on");
    svgSubject.forEach(function(svgEl) {
        svgEl.classList.add("on");
    });
}

function addOnFromSubject(el) {
    var subjectId = el.getAttribute("id");
    if(subjectId === "Tree1" || subjectId === "Tree2"){subjectId = "Tree"}
    var wordSubject = document.querySelector("[data-subject='" + subjectId + "']");
   if(subjectId !== "svg_1") {
       el.classList.add("on");
       wordSubject.classList.add("on");
       if(subjectId === "Tree") {
           document.querySelector("#Tree").classList.add("on");
           document.querySelector("#Tree1").classList.add("on");
           document.querySelector("#Tree2").classList.add("on");
       }
   }
   else{}
}

wordSubjects.forEach(function(el) {
    el.addEventListener("mouseenter", function() {
        addOnFromList(el);
    });
    el.addEventListener("mouseleave", function() {
        removeAllOn();
    });

    el.addEventListener("touchstart", function() {
        removeAllOn();
        addOnFromList(el);
    });
});

sectionSubjects.forEach(function(el) {
    el.addEventListener("mouseenter", function() {
        addOnFromListSection(el);
    });
    el.addEventListener("mouseleave", function() {
        removeAllOn();
    });

    el.addEventListener("touchstart", function() {
        removeAllOn();
        addOnFromList(el);
    });
});

svgSubjects.forEach(function(el) {
    el.addEventListener("mouseenter", function() {
        addOnFromSubject(el);
    });
    el.addEventListener("mouseleave", function() {
        removeAllOn();
    });

    el.addEventListener("touchstart", function() {
        removeAllOn();
        addOnFromSubject(el);
    });


});

$(document).ready(function() {
    $(window).on('resize', function() {
        const screenWidth = window.innerWidth;

        if (screenWidth <= 800) {
            $('.container').replaceWith(function() {
                return this.childNodes;
            });
            document.getElementById("target-me-1").open = false;
            document.getElementById("target-me-2").open = false;
            document.getElementById("target-me-3").open = false;
            document.getElementById("target-me-4").open = false;
            document.getElementById("target-me-5").open = false;

        } else {
            location.reload();
        }
    });

    // Initial check for screen width
    const initialWidth = window.innerWidth;
    if (initialWidth <= 800) {
        $('.container').replaceWith(function() {
            return this.childNodes;
        });
    }
});