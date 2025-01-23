
const apiCache = {};
/*Site Settings -> Build & Deploy -> Environment. Add a new variable with a descriptive name (e.g., MY_API_KEY) and set its value to your actual key.*/
let apiKey =  '';
const encodedApiKey = btoa(`${apiKey}:`);
let receivedDate = "";
let endDate = "";
let receivedDateLookUp = "";
let endDateLookUp = "";
let genericDrugName = [];
let establishedPharmClass = [];
let chemicalStructureClass = [];
let reaction = [];
let country = [];
let byCount = null;
let limit = null;
let safetyReportId = null;
let url = "https://api.fda.gov/drug/event.json?";
let isConstructingUrl = false;
let isSearchInProgress = false;

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

function handleSearch(container, initialApiUrl) { // Store initial URL
     apiKey =  apiCall();
    constructUrl();
    const searchBar = container.querySelector('.search-bar');
    const charactersList = container.querySelector('.characters-list');
    const searchResults = container.querySelector('.search-results');


    container.addEventListener('click', async (event) => {
        const target = event.target;

        if (isConstructingUrl) {
            return;
        }

        isConstructingUrl = true;
        try {

            if (target.id === 'addDateRange') {
                receivedDate = getSelectedValueForRequestDate()
                endDate = getSelectedValueForEndDate()
                if (receivedDate === "" || endDate === "") {
                    alert("Missing Correct Date Range");
                    receivedDate="";
                    endDate="";
                } else {
                    constructUrl();
                }
            }
            else if(target.id === 'reset'){
                 receivedDate = "";
                 endDate = "";
                 genericDrugName = [];
                 establishedPharmClass = [];
                 chemicalStructureClass = [];
                 reaction = [];
                 country = [];
                 byCount = null;
                 limit = null;
                 safetyReportId = null;
                 url = "https://api.fda.gov/drug/event.json?";
                constructUrl();
                document.getElementById('showError').innerHTML = `<p> </p>`;
                document.getElementById('showGraph').innerHTML = '';
            }
            else if (target.id === 'submit') {
                if(byCount == null){
                    alert("Y axis must count by a variable, please select an option");
                }
                else {
                document.getElementById('showError').innerHTML = `<p> </p>`;
                await fetchDataAndPlot(url, encodedApiKey);}

            }
            else if (target.id === 'includeGenericName') {
                const selectedGenericDrug = getSelectedValueForGenericDrug();
                genericDrugName.push(selectedGenericDrug);
                constructUrl();
            } else if (target.id === 'includeEPC') {
                const selectedEPC = getSelectedValueForEPC();
                establishedPharmClass.push(selectedEPC);
                constructUrl();
            } else if (target.id === 'includeCS') {
                const selectedCS = getSelectedValueForCS();
                chemicalStructureClass.push(selectedCS);
                constructUrl();
            } else if (target.id === 'includeReaction') {
                const selectedReaction = getSelectedValueForRxn();
                reaction.push(selectedReaction);
                constructUrl();
            } else if (target.id === 'includeCountry') {
                const selectedCountry = getSelectedValueForCountry();
                country.push(selectedCountry);
                constructUrl();
            } else if (target.id === 'includeLimit') {
                limit = getSelectedValueForLimit();
                constructUrl();

            }

            else if (target.classList.contains('byCount')) {
                byCount = target.name;
                constructUrl();
            }

          }
            finally {
            isConstructingUrl = false;
        }
    });
    const searchCharacters = debounce(async (e) => {
        isSearchInProgress = true; // Set flag to true at the start of the search
        charactersList.innerHTML = ''; // Clear previous results
        const searchString = e.target.value.toLowerCase();
        const includeDateRangeCheckbox = document.getElementById('IncludeRangeForLookup');
         receivedDateLookUp = document.getElementById('receivedDate').value;
         endDateLookUp = document.getElementById('endDate').value;




        let apiUrl = initialApiUrl; // Start with the initial URL


            if (includeDateRangeCheckbox.checked && (receivedDateLookUp === "" || endDateLookUp === "")) {
                alert("Missing Correct Date Range");
                isSearchInProgress = false; // Important: Reset the flag if there's an error
                return; // Stop the search
            } else {



                if (includeDateRangeCheckbox.checked && receivedDateLookUp && endDateLookUp) {
                    apiUrl += `&search=receivedate:[${receivedDateLookUp}+TO+${endDateLookUp}]`;
                }
            }

        let results;

        if (apiCache[apiUrl]) {
            results = apiCache[apiUrl];
        } else {
            try {


                const res = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Basic ${encodedApiKey}`,
                    },
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();

                if (apiUrl.includes('occurcountry.exact')) {
                    results = processCountryData(data.results);
                } // ... other data processing logic
                else if (apiUrl.includes('patient.drug.openfda.generic_name.exact')) {
                    results = processGenericNameData(data.results);
                }
                else if (apiUrl.includes('patient.drug.openfda.pharm_class_epc.exact')) {
                    results = processEPCData(data.results);
                }
                else if (apiUrl.includes('patient.drug.openfda.pharm_class_cs.exact')) {
                    results = processCSData(data.results);
                }
                else if (apiUrl.includes('patient.reaction.reactionmeddrapt.exact')) {
                    results = processReactionData(data.results);
                } else {
                    console.warn("Unknown API endpoint:", apiUrl);
                    results = [];
                }

                apiCache[apiUrl] = results;
            } catch (error) {
                console.error("Error fetching data:", error);
                charactersList.innerHTML = `<li class="error-message">Error loading data. Please try again later.</li>`;
                isSearchInProgress = false; // Reset the flag in case of an error
                return; // Stop the search
            }
        }

        const filteredResults = results.filter((item) =>
            item.name.toLowerCase().includes(searchString)
        );

        displayCharacters(charactersList, filteredResults);
        toggleResultsDisplay(container, searchString);
        isSearchInProgress = false; // Reset flag at the end of the search
    },250);

    searchBar.addEventListener('keyup', searchCharacters);

    // Event delegation for click events on list items
    charactersList.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('clickable-result')) { // Check for the class
            searchBar.value = event.target.textContent; // Set search bar value to the term
            searchResults.style.display = 'none'; // Hide the results after selection
        }
    });
}

function getSelectedValueForGenericDrug() {
    const genericDrugInput = document.getElementById('genericDrugName');
    return genericDrugInput.value;
}
function getSelectedValueForRequestDate() {
    const requestDateInput = document.getElementById('receivedDate');
    return requestDateInput.value;
}
function getSelectedValueForEndDate() {
    const endDateInput = document.getElementById('endDate');
    return endDateInput.value;
}
function getSelectedValueForEPC() {
    const ePCInput = document.getElementById('establishedPharmClass');
    return ePCInput.value;
}
function getSelectedValueForCS() {
    const cSInput = document.getElementById('chemicalStructureClass');
    return cSInput.value;
}
function getSelectedValueForRxn() {
    const rxnInput = document.getElementById('reaction');
    return rxnInput.value;
}
function getSelectedValueForCountry() {
    const countryInput = document.getElementById('country');
    return countryInput.value;
}
function getSelectedValueForLimit() {
    const limitInput = document.getElementById('limit');
    return limitInput.value;
}



function constructUrl() {
     url = "https://api.fda.gov/drug/event.json?";


    if (
        receivedDate ||
        endDate ||
        genericDrugName.length > 0 ||
        establishedPharmClass.length > 0 ||
        chemicalStructureClass.length > 0 ||
        reaction.length > 0 ||
        country.length > 0
    ) {
        url += "search=";
    }

    if (receivedDate && endDate) {
        url += `(receivedate:[${receivedDate}+TO+${endDate}])`;
    }

    if (
        (receivedDate &&
        genericDrugName.length > 0)
    ) {
        url += "+AND+";
    }

    let firstParamAdded = false;
    for (const drugName of genericDrugName) {
        if (firstParamAdded) {
            url += `+${drugName}`;
        }
        if(firstParamAdded === false){
        url += `patient.drug.openfda.generic_name.exact:${drugName}`;
        }
        firstParamAdded = true;
    }

    if (
        ( receivedDate && establishedPharmClass.length > 0)||

        (genericDrugName.length > 0 && establishedPharmClass.length > 0)


    ) {
        url += "+AND+";
    }

     firstParamAdded = false;
    for (const epc of establishedPharmClass) {
        if (firstParamAdded) {
            url += `+${epc}`;
        }
        if(firstParamAdded === false){
        url += `patient.drug.openfda.pharm_class_epc.exact:${epc}`;}
        firstParamAdded = true;
    }


    if (
        (receivedDate && chemicalStructureClass.length > 0) ||
        (genericDrugName.length > 0 && chemicalStructureClass.length > 0) ||
        (establishedPharmClass.length > 0 && chemicalStructureClass.length > 0)

    ) {
        url += "+AND+";
    }

    firstParamAdded = false;
    for (const cs of chemicalStructureClass) {
        if (firstParamAdded) {
            url += `+${cs}`;
        }
        if(firstParamAdded === false){
        url += `patient.drug.openfda.pharm_class_cs.exact:${cs}`;}
        firstParamAdded = true;
    }



    if (
        (receivedDate && reaction.length > 0) ||
        (genericDrugName.length > 0 && reaction.length > 0) ||
        (establishedPharmClass.length > 0 && reaction.length > 0) ||
        ( chemicalStructureClass.length > 0 && reaction.length > 0)

    ) {
        url += "+AND+";
    }

    firstParamAdded = false;
    for (const rxn of reaction) {
        if (firstParamAdded) {
            url += `+${rxn}`;
        }
        if(firstParamAdded === false){
        url += `patient.reaction.reactionmeddrapt.exact:${rxn}`;}
        firstParamAdded = true;
    }

    if (
        (receivedDate && country.length > 0)||
        ( genericDrugName.length > 0 && country.length > 0) ||
        (establishedPharmClass.length > 0 && country.length > 0) ||
        (chemicalStructureClass.length > 0 && country.length > 0)

    ) {
        url += "+AND+";
    }

    firstParamAdded = false;
    for (const cn of country) {
        if (firstParamAdded) {
            url += `+${cn}`;
        }
        if(firstParamAdded === false){
        url += `country.exact:${cn}`;}
        firstParamAdded = true;
    }



    if (byCount) {
        url += `&count=`;
        switch (byCount) {
            case "receivedDate":
                url += "receivedate";
                break;
            case "genericDrugName":
                url += "patient.drug.openfda.generic_name.exact";
                break;
            case "establishedPharmClass":
                url += "patient.drug.openfda.pharm_class_epc.exact";
                break;
            case "chemicalStructureClass":
                url += "patient.drug.openfda.pharm_class_cs.exact";
                break;
            case "reaction":
                url += "patient.reaction.reactionmeddrapt.exact";
                break;
            case "country":
                url += "country.exact";
                break;
            case "safetyReportId":
                url += "safetyreportid.exact";
                break;
            default:
                break;
        }
    }




    if (limit) {
        url += `&limit=${limit}`;
    }

     const showCodeDiv = document.getElementById('showCode');
     showCodeDiv.innerHTML = url;
/*    return `
       <div id="showCode">
       ${url}
        </div>
      `;*/

}


async function apiCall(parameter) {
    const url = `/.netlify/functions/token-hider`;
    try {
        const response = await fetch(url);
        const data = await response;
        return data;
    } catch (err) {
        console.log(err);
    }
}

// Function to process country data
function processCountryData(data) {
    return data.map((item) => ({
        name: item.term,
        count: item.count,
    }));
}

// Function to process drug reaction data
function processReactionData(data) {
    return data.map((item) => ({
        name: item.term,
        count: item.count,
    }));
}

function processEPCData(data) {
    return data.map((item) => ({
        name: item.term,
        count: item.count,
    }));
}

function processCSData(data) {
    return data.map((item) => ({
        name: item.term,
        count: item.count,
    }));
}

function processGenericNameData(data) {
    return data.map((item) => ({
        name: item.term,
        count: item.count,
    }));
}

// Function to toggle the display of the search results
function toggleResultsDisplay(container, searchValue) {
    const searchResults = container.querySelector('.search-results');
    searchResults.style.display = searchValue === "" ? "none" : "block";
}

// Function to display characters
const displayCharacters = (charactersList, characters) => {
    const htmlString = characters
        .map((character) => {
            return `
        <li class="character">
          <span class="clickable-result">${character.name}</span> <span class="count">(${character.count})</span>
        </li>
      `;
        })
        .join('');
    charactersList.innerHTML = htmlString;
};

const loadCharacters = async () => {
    const searchContainers = document.querySelectorAll('.search-container');
    for (const container of searchContainers) {
        const searchBar = container.querySelector('.search-bar');
        const initialApiUrl = searchBar.getAttribute('data-api-url'); // Get the initial URL

        if (!initialApiUrl) {
            console.error("API URL not found for this search container.");
            continue;
        }

        handleSearch(container, initialApiUrl); // Pass the initial URL
    }
};

loadCharacters();

async function fetchDataAndPlot(url, encodedApiKey) {
    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Basic ${encodedApiKey}`,
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
        }

        const data = await res.json();

        if (!data.results || !Array.isArray(data.results)) {
            throw new Error("Invalid data format from API. Expected 'results' array.");
        }

        const plotData = data.results.map(item => ({ x: item.term, y: item.count })); // Adapt to your data structure
        if (!plotData.every(item => typeof item.x === 'string' && typeof item.y === 'number')){
            throw new Error("Data must contain numeric x and y values for plotting")
        }


        const trace = {
            x: plotData.map(item => item.x),
            y: plotData.map(item => item.y),
            mode: 'lines',
            type: 'line',

        };

        const layout = {
            title: 'Open FDA Drug Adverse Event API',
            margin:{
                b:500,
            },
            height: 1200,
        };

        const config = {
            showLink: true,
            plotlyServerURL: "https://chart-studio.plotly.com",
            linkText: 'Modify graph in plotly'
        };

        Plotly.newPlot('showGraph', [trace], layout,config, {scrollZoom: true}, {editable: true}, {responsive: true});

    } catch (error) {
        console.error("Error fetching or processing data:", error);
        document.getElementById('showError').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`; // Display error on the page
    }
}