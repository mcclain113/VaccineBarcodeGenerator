var peopleData = [
    // {
    //     name: "Person1",
    //     facts: [
    //         { fact: "Fact 1", value: true },
    //         { fact: "Fact 2", value: false },
    //         { fact: "Fact 3", value: true }
    //     ]
    // },
    // {
    //     name: "Person2",
    //     facts: [
    //         { fact: "Fact 1", value: true },
    //         { fact: "Fact 2", value: false },
    //         { fact: "Fact 3", value: true }
    //     ]
    // },
    // {
    //     name: "Person3",
    //     facts: [
    //         { fact: "Fact 1", value: true },
    //         { fact: "Fact 2", value: false },
    //         { fact: "Fact 3", value: true }
    //     ]
    // },
    // // Add more people and their facts here
];

var peopleDataView = [];


let lastObject;


function generator() {
    if (peopleDataView.length === 0 || peopleDataView.length === 1) {
        peopleDataView = JSON.parse(JSON.stringify(peopleData));
    } else {
        peopleDataView.splice(lastObject, 1);
    }

    let randomNumber = Math.floor(Math.random() * peopleDataView.length);
    const randomPerson = peopleDataView[randomNumber];

    if (randomPerson) {
        lastObject = randomNumber;
        document.getElementById("name").innerHTML = randomPerson.name;

        // Display random facts with hidden values initially
        const randomFacts = randomPerson.facts.sort(() => Math.random() - 0.5).slice(0, 3);
        let factsHTML = "";
        for (const fact of randomFacts) {
            factsHTML += `<p>${fact.fact}: <span class="truth hidden">${String(fact.value)}</span></p>`;
        }
        document.getElementById("facts").innerHTML = factsHTML;
    }
}

function revealTruth() {
    const factsElement = document.getElementById("facts");
    const truthElements = factsElement.querySelectorAll(".truth");

    truthElements.forEach((truthElement) => {
        truthElement.classList.remove("hidden");
    });

}

function uploadFile() {
    const fileInput = document.getElementById("fileUpload");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event)
        {
            try {
                peopleData = JSON.parse(event.target.result);
                peopleDataView = JSON.parse(JSON.stringify(peopleData)); // Deep copy
                console.log("File uploaded successfully!");
                alert("File uploaded successfully!");
            } catch (error) {
                console.error("Error parsing JSON file:", error);
            }
        };

        reader.readAsText(file);
    } else {
        console.warn("No file selected");
    }
}