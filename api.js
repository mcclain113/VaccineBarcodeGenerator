
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
let indication = [];
let country = [];
let byCount = null;
let limit = null;
let safetyReportId = null;
let url = "https://api.fda.gov/drug/event.json?";
let isConstructingUrl = false;
let isSearchInProgress = false;
let sex = null;
let ageGroup = null;
let ageBegin = null;
let ageEnd = null;
let serious = null;
let reportBy = "";

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

function toDateInputValue(dateObject){
    const local = new Date(dateObject);
    local.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
    return local.toJSON().slice(0,10);
};

function handleSearch(container, initialApiUrl) { // Store initial URL
     apiKey =  apiCall();
    constructUrl();
    const searchBar = container.querySelector('.search-bar');
    const charactersList = container.querySelector('.characters-list');
    const searchResults = container.querySelector('.search-results');
    document.getElementById('endDate').value = toDateInputValue(new Date());

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
                 indication = [];
                 reaction = [];
                 country = [];
                 byCount = null;
                 limit = null;
                 safetyReportId = null;
                 ageEnd= null;
                 ageBegin = null;
                 ageGroup = null;
                 sex = null;
                 serious = null;
                 reportBy ="";
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
                    const showFinalCodeDiv = document.getElementById('showCode');

                document.getElementById('showError').innerHTML = `<p> </p>`;
                    document.getElementById('showGraph').innerHTML =`<p> </p>`;
                await fetchDataAndPlot(showFinalCodeDiv.innerText, encodedApiKey);}

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

                if(limit <1 || limit > 1000){
                    alert("Incorrect limit number");
                    limit = null;
                }
                    constructUrl();

            } else if (target.id === 'includeSex') {
            sex = getSelectedValueForSex();
            constructUrl();

        } else if (target.id === 'includeAgeGroup') {
            ageGroup = getSelectedValueForAgeGroup();
            constructUrl();
        }

        else if (target.classList.contains('byCount')) {
                byCount = target.name;
                constructUrl();

        } else if (target.id === 'includeIndication') {
            const selectedIndication = getSelectedValueForIndication();
            indication.push(selectedIndication);
            constructUrl();
        }
         else if (target.id === 'addAgeRange') {
                ageBegin = getSelectedValueForAgeBegin()
                ageEnd = getSelectedValueForAgeEnd()
                if ((ageBegin == null || ageEnd == null) || (ageBegin > ageEnd)) {
                    alert("Missing Correct Age Range");
                    ageBegin = "";
                    ageEnd = "";
                } else {
                    constructUrl();
                }
            }
            else if (target.id === 'includeSerious') {
                serious = getSelectedValueForSerious();
                constructUrl();
            }
            else if (target.id === 'includeReportBy') {
                reportBy = getSelectedValueForReportBy();
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
                }
                else if (apiUrl.includes('patient.drug.drugindication.exact')) {
                    results = processIndicationData(data.results);
                }
                else {
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

function getSelectedValueForSex(){
    const radioButtons = document.getElementsByName("sex");
    let selectedValue = null;

    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedValue = radioButton.value;
            break;
        }
    }

    return selectedValue;
}

function getSelectedValueForIndication(){
    const indicationInput = document.getElementById('indication');
    return indicationInput.value;
}

function getSelectedValueForAgeGroup(){
    const radioButtons = document.getElementsByName("ageGroup");
    let selectedValue = null;

    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedValue = radioButton.value;
            break;
        }
    }

    return selectedValue;
}

function getSelectedValueForAgeBegin() {
    const ageBeginInput = document.getElementById('ageBegin');
    return ageBeginInput.value;
}
function getSelectedValueForAgeEnd() {
    const ageEndInput = document.getElementById('ageEnd');
    return ageEndInput.value;
}
function getSelectedValueForSerious(){
    const radioButtons = document.getElementsByName("serious");
    let selectedValue = null;

    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedValue = radioButton.value;
            break;
        }
    }

    return selectedValue;
}

function getSelectedValueForReportBy(){
    const radioButtons = document.getElementsByName("reportBy");
    let selectedValue = null;

    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedValue = radioButton.value;
            break;
        }
    }

    return selectedValue;
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
        sex != null ||
        ageGroup != null ||
        endDate ||
        genericDrugName.length > 0 ||
        establishedPharmClass.length > 0 ||
        chemicalStructureClass.length > 0 ||
        reaction.length > 0 ||
        country.length > 0 ||
        indication.length > 0 ||
        ageBegin != null ||
        ageEnd != null ||
        serious != null ||
        reportBy
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
    for (let i = 0; i < genericDrugName.length; i++) {
        const drugName = genericDrugName[i];
        if (firstParamAdded) {
            url += `+OR+"${drugName}"`;
        }
        if (firstParamAdded === false) {
            url += `patient.drug.openfda.generic_name.exact:("${drugName}"`;
        }
        firstParamAdded = true;
        if (i === genericDrugName.length - 1) { // Check if it's the last element
            url += ")";
        }
    }

    if (
        ( receivedDate && establishedPharmClass.length > 0)||

        (genericDrugName.length > 0 && establishedPharmClass.length > 0)


    ) {
        url += "+AND+";
    }


    firstParamAdded = false;
    for (let i = 0; i < establishedPharmClass.length; i++) {
        const epc = establishedPharmClass[i];
        if (firstParamAdded) {
            url += `+OR+"${epc}"`;
        }
        if (firstParamAdded === false) {
            url += `patient.drug.openfda.pharm_class_epc.exact:("${epc}"`;
        }
        firstParamAdded = true;
        if (i === establishedPharmClass.length - 1) { // Check if it's the last element
            url += ")";
        }
    }


    if (
        (receivedDate && chemicalStructureClass.length > 0) ||
        (genericDrugName.length > 0 && chemicalStructureClass.length > 0) ||
        (establishedPharmClass.length > 0 && chemicalStructureClass.length > 0)

    ) {
        url += "+AND+";
    }


    firstParamAdded = false;
    for (let i = 0; i < chemicalStructureClass.length; i++) {
        const cs = chemicalStructureClass[i];
        if (firstParamAdded) {
            url += `+OR+"${cs}"`;
        }
        if (firstParamAdded === false) {
            url += `patient.drug.openfda.pharm_class_cs.exact:("${cs}"`;
        }
        firstParamAdded = true;
        if (i === chemicalStructureClass.length - 1) { // Check if it's the last element
            url += ")";
        }
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
    for (let i = 0; i < reaction.length; i++) {
        const rxn = reaction[i];
        if (firstParamAdded) {
            url += `+OR+"${rxn}"`;
        }
        if (firstParamAdded === false) {
            url += `patient.reaction.reactionmeddrapt.exact:("${rxn}"`;
        }
        firstParamAdded = true;
        if (i === reaction.length - 1) { // Check if it's the last element
            url += ")";
        }
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
    for (let i = 0; i < country.length; i++) {
        const cn = country[i];
        if (firstParamAdded) {
            url += `+OR+"${cn}"`;
        }
        if (firstParamAdded === false) {
            url += `occurcountry.exact:("${cn}"`;
        }
        firstParamAdded = true;
        if (i === country.length - 1) { // Check if it's the last element
            url += ")";
        }
    }


    if (
        (receivedDate && sex != null)||
        ( genericDrugName.length > 0 && sex != null) ||
        (establishedPharmClass.length > 0 && sex != null) ||
        (chemicalStructureClass.length > 0 && sex != null) ||
        (chemicalStructureClass.length > 0 && sex != null) ||
        (country.length > 0 && sex != null)
    ) {
        url += "+AND+";
    }

    if (sex != null){url += `patient.patientsex:${sex}`;}

    if (
        (receivedDate && ageGroup != null)||
        ( genericDrugName.length > 0 && ageGroup != null) ||
        (establishedPharmClass.length > 0 && ageGroup != null) ||
        (chemicalStructureClass.length > 0 && ageGroup != null) ||
        (chemicalStructureClass.length > 0 && ageGroup != null) ||
        (country.length > 0 && ageGroup != null) ||
        (sex != null && ageGroup != null)
    ) {
        url += "+AND+";
    }

    if (ageGroup != null){url += `patient.patientagegroup:${ageGroup}`;}


    if (
        (receivedDate && indication.length > 0)||
        ( genericDrugName.length > 0 && indication.length > 0) ||
        (establishedPharmClass.length > 0 && indication.length > 0) ||
        (chemicalStructureClass.length > 0 && indication.length > 0) ||
        (chemicalStructureClass.length > 0 && indication.length > 0) ||
        (country.length > 0 && indication.length > 0) ||
        (sex != null && indication.length > 0) ||
        (ageGroup != null && indication.length > 0)

    ) {
        url += "+AND+";
    }


    firstParamAdded = false;
    for (let i = 0; i < indication.length; i++) {
        const id = indication[i];
        if (firstParamAdded) {
            url += `+OR+"${id}"`;
        }
        if (firstParamAdded === false) {
            url += `patient.drug.drugindication.exact:("${id}"`;
        }
        firstParamAdded = true;
        if (i === indication.length - 1) { // Check if it's the last element
            url += ")";
        }
    }


    if (
        (receivedDate && ageBegin != null)||
        ( genericDrugName.length > 0 && ageBegin != null) ||
        (establishedPharmClass.length > 0 && ageBegin != null) ||
        (chemicalStructureClass.length > 0 && ageBegin != null) ||
        (chemicalStructureClass.length > 0 && ageBegin != null) ||
        (country.length > 0 && ageBegin != null) ||
        (sex != null && ageBegin != null) ||
        (ageGroup != null && ageBegin != null) ||
        (indication.length > 0 && ageBegin != null)
    ) {
        url += "+AND+";
    }

    if (ageBegin != null && ageEnd != null) {url += `(patient.patientonsetage:[${ageBegin}+TO+${ageEnd}])`;}

    if (
        (receivedDate && serious != null)||
        ( genericDrugName.length > 0 && serious != null) ||
        (establishedPharmClass.length > 0 && serious != null) ||
        (chemicalStructureClass.length > 0 && serious != null) ||
        (chemicalStructureClass.length > 0 && serious != null) ||
        (country.length > 0 && serious != null) ||
        (sex != null && serious != null) ||
        (ageGroup != null && serious != null) ||
        (indication.length > 0 && serious != null) ||
        (ageBegin != null && serious != null)
    ) {
        url += "+AND+";
    }

    if (serious != null){url += `serious:${serious}`;}

    if (
        (receivedDate && reportBy)||
        ( genericDrugName.length > 0 && reportBy) ||
        (establishedPharmClass.length > 0 && reportBy) ||
        (chemicalStructureClass.length > 0 && reportBy) ||
        (chemicalStructureClass.length > 0 && reportBy) ||
        (country.length > 0 && reportBy) ||
        (sex != null && reportBy) ||
        (ageGroup != null && reportBy) ||
        (indication.length > 0 && reportBy) ||
        (ageBegin != null && reportBy) ||
        (serious != null && reportBy)
    ) {
        url += "+AND+";
    }

    if (reportBy != null){url += `${reportBy}`;}


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
                url += "occurcountry.exact";
                break;
            case "safetyReportId":
                url += "safetyreportid.exact";
                break;
            case "sex":
                url += "patient.patientsex";
                break;
            case "ageGroup":
                url += "patient.patientagegroup";
                break;
            case "indication":
                url += "patient.drug.drugindication.exact";
                break;

            case "ageRange":
                url += "patient.patientonsetage";
                break;
            case "serious":
                url += "serious";
                break;
            case "reportBy":
                url += "companynumb.exact";
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

function processIndicationData(data) {
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
    let plotData;
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

        let termNameMap = {};
        if (url.includes('&count=serious')) {
            termNameMap = {
                1: "The adverse event resulted in death, a life threatening condition, hospitalization, disability, congenital anomaly, or other serious condition",
                2: "The adverse event did not result in any of the above"
            };
        } else if (url.includes('&count=patient.patientagegroup')) {
            termNameMap = {
                1: "neonate",
                2: "infant",
                3: "child",
                4: "adolescent",
                5: "adult",
                6: "elderly"
            };
        } else if (url.includes('&count=patient.patientsex')) {
            termNameMap = {
                0: "other",
                1: "male",
                2: "female"
            };
        }

if(url.includes('&count=receivedate')){
    plotData = data.results.map(item => ({x: item.time.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3'), y: item.count})); // Adapt to your data structure

}
else {
    plotData = data.results.map(item => ({x: termNameMap[item.term] || String(item.term), y: item.count})); // Adapt to your data structure
    if (!plotData.every(item => typeof item.x === 'string' && typeof item.y === 'number')) {
        throw new Error("Data must contain string x and numeric y values for plotting")
    }
}

        if ((url.includes('&count=serious')) || (url.includes('&count=patient.patientsex')) || (url.includes('&count=patient.patientagegroup'))) {
            const trace = {
                labels: plotData.map(item => item.x),
                values: plotData.map(item => item.y),

                type: 'pie',

            };

            const layout = {
                title: 'Open FDA Drug Adverse Event API',
                margin: {
                    b: 500,
                },
                height: 1200,
            };

            const config = {
                showLink: true,
                plotlyServerURL: "https://chart-studio.plotly.com",
                linkText: 'Modify graph in plotly'
            };

            Plotly.newPlot('showGraph', [trace], layout, config, {scrollZoom: true}, {editable: true}, {responsive: true});
        } else if ((url.includes('&count=patient.patientonsetage')) || (url.includes('&count=receivedate'))) {
            const trace = {
                x: plotData.map(item => item.x),
                y: plotData.map(item => item.y),

                type: 'bar',

            };

            const layout = {
                title: 'Open FDA Drug Adverse Event API',
                margin: {
                    b: 500,
                },
                height: 1200,
            };

            const config = {
                showLink: true,
                plotlyServerURL: "https://chart-studio.plotly.com",
                linkText: 'Modify graph in plotly'
            };

            Plotly.newPlot('showGraph', [trace], layout, config, {scrollZoom: true}, {editable: true}, {responsive: true});
        }
        else if (url.includes('&count=safetyreportid.exact')) {
            document.getElementById('showGraph').innerHTML =
                "<p>" + "Count of Safety Report IDs Provided: " + plotData.length + "</p>";

            let output = "";

            for (let i = 0; i < plotData.length; i++) {
                let http = `https://api.fda.gov/drug/event.json?search=safetyreportid:${plotData[i].x}`; // Template literal for URL
                output += `<a class="label" target="_blank" href="${http}">ID Report: ${plotData[i].x} Count: ${plotData[i].y}</a>`; // Template literal for HTML
            }

            document.getElementById('showGraph').innerHTML += output;

        }
        else {
            const trace = {
                x: plotData.map(item => item.x),
                y: plotData.map(item => item.y),
                mode: 'lines',
                type: 'line',

            };

            const layout = {
                title: 'Open FDA Drug Adverse Event API',
                margin: {
                    b: 500,
                },
                height: 1200,
            };

            const config = {
                showLink: true,
                plotlyServerURL: "https://chart-studio.plotly.com",
                linkText: 'Modify graph in plotly'
            };

            Plotly.newPlot('showGraph', [trace], layout, config, {scrollZoom: true}, {editable: true}, {responsive: true});
        }

    } catch (error) {
        console.error("Error fetching or processing data:", error);
        document.getElementById('showError').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`; // Display error on the page
    }
}