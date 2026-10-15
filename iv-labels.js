$(document).ready(function () {
    $("#iv-label-form").submit(handleSubmit);
    $("#print-label").on("click", printDiv);
    $("#reset-label").on("click", clearSite);

    loadFromUrl();
});

// Reads /iv-labels/<site>/<drug>/<rxcui>/<#color>/<WxL>/ from the address bar.
// A "#" anywhere in that path starts the URL fragment, so pathname and hash
// are stitched back together before splitting on "/" to recover all 5 slots.
function parseUrlSegments() {
    const marker = "/iv-labels";
    const combined = window.location.pathname + window.location.hash;
    const markerIndex = combined.toLowerCase().indexOf(marker);
    if (markerIndex === -1) {
        return [];
    }

    let rest = combined.slice(markerIndex + marker.length);
    rest = rest.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!rest) {
        return [];
    }

    return rest.split("/").map(segment => decodeURIComponent(segment));
}

function loadFromUrl() {
    const [site, drug, rxnorm, color, dims] = parseUrlSegments();

    if (site) $("input#site").val(site);
    if (drug) $("input#drug").val(drug);
    if (rxnorm) $("input#rxnorm").val(rxnorm);
    if (color) $("input#color").val(normalizeHex(color));

    if (dims) {
        const [width, length] = dims.split(/x/i);
        if (width) $("input#width").val(width);
        if (length) $("input#length").val(length);
    }

    if (site || drug || rxnorm || color || dims) {
        generateLabel();
    }
}

function handleSubmit(event) {
    event.preventDefault();
    generateLabel();
}

async function generateLabel() {
    let drug = $("input#drug").val().trim();
    const rxnorm = $("input#rxnorm").val().trim();

    // Drug name takes precedence; fall back to the RxNorm API lookup by RXCUI.
    if (!drug && rxnorm) {
        const lookedUpName = await lookupDrugNameByRxcui(rxnorm);
        if (lookedUpName) {
            drug = lookedUpName;
            $("input#drug").val(drug);
        }
    }

    const color = normalizeHex($("input#color").val().trim()) || "#FFFFFF";
    const width = parseFloat($("input#width").val()) || 3;
    const length = parseFloat($("input#length").val()) || 1;
    const site = $("input#site").val().trim();

    renderLabel({drug, rxnorm, color, width, length, site});
}

async function lookupDrugNameByRxcui(rxcui) {
    try {
        const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${encodeURIComponent(rxcui)}/historystatus.json`);
        if (!response.ok) return null;

        const data = await response.json();
        const history = data?.rxcuiStatusHistory;
        if (!history || history.metaData?.status === "UNKNOWN") return null;

        return history.attributes?.name || null;
    } catch (error) {
        console.error("RxNorm lookup failed", error);
        return null;
    }
}

function normalizeHex(color) {
    if (!color) return "";
    return color.startsWith("#") ? color : `#${color}`;
}

function renderLabel({drug, rxnorm, color, width, length, site}) {
    $("p#labelDiv").after(`<div style="float: left; padding: 5px;">
        <div class="iv-label" style="width:${width}in; height:${length}in; background-color:${color};">
            <p class="drug-name">${drug || ""}</p>
            <p class="label-line">${rxnorm ? `RXNORM: ${rxnorm}` : ""}</p>
            <p class="label-line">${site ? `Site: ${site}` : ""}</p>
        </div>
    </div>`);
}

function printDiv() {
    const divContents = document.getElementById("printSpace").innerHTML;
    const printWindow = window.open('', '', 'height=400, width=400');
    printWindow.document.write('<html><body>');
    printWindow.document.write(divContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function clearSite() {
    location.href = "/iv-labels";
}
