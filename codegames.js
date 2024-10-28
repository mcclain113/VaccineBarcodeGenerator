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
            factsHTML += `<p>${fact.fact}: <span class="truth hidden">${fact.value ? "True" : "False"}</span></p>`;
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

function uploadCsvFile() {
    const fileInput = document.getElementById("fileCsvUpload");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const csvData = event.target.result;

            const jsonData = parseCsvToJson(csvData);
            if (jsonData) {
                peopleData = jsonData;
                peopleDataView = JSON.parse(JSON.stringify(peopleData)); // Deep copy
                console.log("CSV file uploaded successfully!");
                alert("CSV file uploaded successfully!");
            } else {
                console.error("Error parsing CSV file!");
            }
        };

        reader.readAsText(file);
    } else {
        console.warn("No file selected");
    }
}

function parseCsvToJson(csvData) {
    const lines = csvData.trim().split(/\r?\n/); // Split into lines
    if (lines.length < 2) {
        return null; // Not a valid CSV file
    }

    const headers = lines[0].split(","); // Get headers
    const jsonData = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        if (values.length !== headers.length) {
            console.warn("Invalid CSV format on line", i + 1);
            continue; // Skip invalid lines
        }

        const person = {};
        for (let j = 0; j < headers.length; j++) {
            person[headers[j].trim()] = values[j].trim();
        }

        // Extract fact and value pairs from the CSV data
        const factValuePairs = [];
        for (let j = 1; j < headers.length; j += 2) {
            factValuePairs.push({
                fact: headers[j].trim(),
                value: person[headers[j + 1].trim()] === "true"
            });
        }

        person.facts = factValuePairs;
        jsonData.push(person);
    }

    return jsonData;
}