const CHANGE_DAY_COLORS = {
    monday: "orange",
    tuesday: "green",
    wednesday: "yellow",
    thursday: "cyan",
    friday: "violet",
    saturday: "red",
    sunday: "pink",
};

const CHANGE_DAY_ABBREVIATIONS = {
    monday: "M",
    tuesday: "T",
    wednesday: "W",
    thursday: "Th",
    friday: "F",
    saturday: "Sa",
    sunday: "Su",
};

let changeLineDefaultsApplied = false;

$(document).ready(function () {
    $("#iv-label-form").submit(handleSubmit);
    $("#reset-label").on("click", clearSite);

    $("#include-change-line-label").on("change", function () {
        $("#change-line-section").prop("hidden", !this.checked);
        if (this.checked) applyChangeLineDefaults();
    });
    $("#change-line-form").submit(function (event) {
        event.preventDefault();
        generateChangeLineLabels();
    });
    $("#reset-change-line-label").on("click", resetChangeLineSection);

    // Delegated since labels (and their print buttons) are added dynamically.
    // Each label prints on its own, as its own page/job - there is no combined
    // "print everything" button anymore.
    $(document).on("click", ".print-single-label", function () {
        const labelEl = $(this).siblings(".iv-label")[0];
        printSingleLabel(labelEl);
    });
    $("#print-all-labels").on("click", printAllLabels);

    loadFromUrl();
});

// Reads <page>/<site>/<drug>/<rxcui>/<#color>/<WxL>/ from the address bar.
// A "#" anywhere in that path starts the URL fragment, so pathname and hash
// are stitched back together before splitting on "/" to recover all 5 slots.
// The first path segment is whatever this page is named/served at - it's
// stripped generically so renaming the page doesn't require touching this.
function parseUrlSegments() {
    const combined = window.location.pathname + window.location.hash;
    const afterPageName = combined.replace(/^\/[^/#]*/, "");

    const rest = afterPageName.replace(/^\/+/, "").replace(/\/+$/, "");
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
        const details = document.getElementById("iv-label-details");
        if (details) details.open = false;

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
    // Built detached and inserted as a captured reference (not re-queried via
    // $(".iv-label").last()) - .after() always inserts the newest label right
    // next to the anchor, so ".last()" in DOM order actually means "oldest",
    // which was causing every label after the first to skip the font-fit step.
    const $wrapper = $(`<div class="label-wrapper" style="float: left; padding: 5px;">
        <div class="iv-label" style="width:${width}in; height:${length}in; background-color:${color};">
            <div class="iv-label-half left"><p class="drug-name">${drug || ""}</p></div>
            <div class="iv-label-fold-line"></div>
            <div class="iv-label-half right"><p class="drug-name">${drug || ""}</p></div>
        </div>
        <button type="button" class="print-single-label">Print This Label Only</button>
    </div>`);

    $("p#labelDiv").after($wrapper);
    fitDrugNameText($wrapper.find(".drug-name"));
}

// Shrinks an element's font size until it fits inside its parent's rendered
// box, so wrapped text shrinks instead of overflowing a fixed physical label size.
function shrinkFontToFit(el, {maxFontPx = 16, minFontPx = 6, stepPx = 0.5} = {}) {
    const container = el.parentElement;
    let fontSize = maxFontPx;
    el.style.fontSize = `${fontSize}px`;

    while (fontSize > minFontPx && (el.scrollHeight > container.clientHeight || el.scrollWidth > container.clientWidth)) {
        fontSize -= stepPx;
        el.style.fontSize = `${fontSize}px`;
    }
}

function fitDrugNameText(drugNameElements) {
    drugNameElements.each(function () {
        shrinkFontToFit(this, {maxFontPx: 16, minFontPx: 6, stepPx: 0.5});
    });
}

function todayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowTimeString() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Applies once per page visit (first time the section is revealed) so toggling
// the checkbox afterward doesn't clobber values the user has already edited.
function applyChangeLineDefaults() {
    if (changeLineDefaultsApplied) return;
    changeLineDefaultsApplied = true;

    const todayName = new Date().toLocaleDateString("en-US", {weekday: "long"});
    $(`#change-line-form input[name="change-day"][value="${todayName}"]`).prop("checked", true);

    if (!$("input#change-date").val()) $("input#change-date").val(todayDateString());
    if (!$("input#change-time").val()) $("input#change-time").val(nowTimeString());
}

function generateChangeLineLabels() {
    const selectedDay = $('#change-line-form input[name="change-day"]:checked').val();
    if (!selectedDay) return;

    const date = $("input#change-date").val();
    const time = $("input#change-time").val();
    const initials = $("input#change-initials").val().trim().slice(0, 3);
    const width = parseFloat($("input#change-width").val()) || 3;
    const length = parseFloat($("input#change-length").val()) || 1;

    const colorByDay = $("input#change-color-by-day").is(":checked");
    const color = colorByDay ? (CHANGE_DAY_COLORS[selectedDay.toLowerCase()] || "#FFFFFF") : "#FFFFFF";

    renderChangeLineLabel({day: selectedDay, date, time, initials, color, width, length});
}

function changeLineBlockHtml(day, date, time, initials) {
    const abbreviation = CHANGE_DAY_ABBREVIATIONS[day.toLowerCase()] || "";
    return `<div class="change-line-block">
        <div class="change-line-top">
            <div class="change-line-heading">
                <p>CHANGE</p>
                <p>${day.toUpperCase()}</p>
            </div>
            <div class="change-line-day-letter">${abbreviation}</div>
        </div>
        <p>Date: ${date || ""}</p>
        <p>Time: ${time || ""}</p>
        <p>Initials: ${initials || ""}</p>
    </div>`;
}

function renderChangeLineLabel({day, date, time, initials, color, width, length}) {
    const $wrapper = $(`<div class="label-wrapper" style="float: left; padding: 5px;">
        <div class="iv-label" style="width:${width}in; height:${length}in; background-color:${color};">
            <div class="iv-label-half left">${changeLineBlockHtml(day, date, time, initials)}</div>
            <div class="iv-label-fold-line"></div>
            <div class="iv-label-half right">${changeLineBlockHtml(day, date, time, initials)}</div>
        </div>
        <button type="button" class="print-single-label">Print This Label</button>
    </div>`);

    $("p#changeLineLabelDiv").after($wrapper);

    $wrapper.find(".change-line-block").each(function () {
        shrinkFontToFit(this, {maxFontPx: 12, minFontPx: 5, stepPx: 0.25});
    });
}

function resetChangeLineSection() {
    document.getElementById("change-line-form").reset();
    $("#changeLinePrintSpace").children().not("#changeLineLabelDiv").remove();

    changeLineDefaultsApplied = false;
    applyChangeLineDefaults();
}

// The print window starts blank, so the label's layout CSS (flex halves,
// fold line, text alignment) has to be copied in explicitly - otherwise
// only the inline styles (width/height/color/font-size) survive and the
// printout falls back to default block layout instead of matching the preview.
function openPrintWindow(bodyHtml, extraHeadHtml = "") {
    const labelStyles = Array.from(document.querySelectorAll("head style"))
        .map(styleEl => styleEl.outerHTML)
        .join("\n");

    const printWindow = window.open('', '', 'height=400, width=400');
    printWindow.document.write(`<html><head>${labelStyles}${extraHeadHtml}</head><body>${bodyHtml}</body></html>`);
    printWindow.document.close();
    printWindow.print();
}

// Only the single label element is written in (not its wrapper/print button),
// so each label prints as its own standalone job/page rather than being
// combined with every other label generated in the same session.
function printSingleLabel(labelEl) {
    openPrintWindow(labelEl.outerHTML);
}

// Pulls every generated label from both sections (drug labels and change
// line labels) into one print job, with a forced page break after each one
// so they each land on their own printed page/sheet.
function printAllLabels() {
    const labelEls = document.querySelectorAll("#printSpace .iv-label, #changeLinePrintSpace .iv-label");
    if (labelEls.length === 0) return;

    const pageBreakCss = `<style>
        .iv-label { page-break-after: always; break-after: page; page-break-inside: avoid; break-inside: avoid; }
        .iv-label:last-child { page-break-after: auto; break-after: auto; }
    </style>`;
    const bodyHtml = Array.from(labelEls).map(el => el.outerHTML).join("\n");

    openPrintWindow(bodyHtml, pageBreakCss);
}

function clearSite() {
    location.href = "/iv-line-labels";
}
