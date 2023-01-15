i = 0;
$(document).ready(function(){
    $("html").keypress(addLetter);
    $("html").keypress(counterRestart);
    $("#start-over").on("click", clearSite);
})

let myArray =  [];
let tableArray = [];
function addLetter(e){

    let code = e.which;
    let codeC = String.fromCharCode(code);
    if(code === 13 && myArray.length === 0){}
    else {
        $("#pResult1").empty();
        $("#pResult2").empty();
        if (myArray.length === 0) {
            timerStart();
        }

        myArray.push(codeC);
        if (code === 13) {

            $("#pResult1").append('<img src="images/PIBC.png" alt="barcode present" />');
            $("#pResult1").append('<br>');
            $("#pResult2").append(myArray.join("").toString());

            var scan = myArray.join("").toString();
            const myObject = {
                Scan_Value_History: scan
            };
            while (myArray.length > 0) {
                myArray.pop();}

                tableArray.push(myObject);

                JSONToHTMLTable(tableArray, "tblExample");


        }
    }
}


var perc = 2 //seconds
var count = 2;
function counterRestart(e) {
    // RESET TIMER
    let code = e.which;
    if(code === 13 && myArray.length === 0){}
    else{ count = perc;}
}



function timerStart() {
    //COUNTDOWN
    var counter = setInterval(timer, 1000);
    function timer() {
        count = count - 1;
        if (count <= -1) {
            clearInterval(counter);
            $('html').focus().trigger({ type : 'keypress', which : 13 });
            return;
        }

        var seconds = count % 60;


        seconds %= 60;


        document.getElementById("seconds").innerHTML = seconds;


    }

}



function clearSite(){
    location.reload();
}


    function JSONToHTMLTable(jsonData, elementToBind) {

        //This Code gets all columns for header   and stored in array col
        var col = [];
        for (var i = 0; i < jsonData.length; i++) {
            for (var key in jsonData[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        //This Code creates HTML table
        var table = document.createElement("table");

        //This Code getsrows for header creader above.
        var tr = table.insertRow(-1);

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        //This Code adds data to table as rows
        for (var i = 0; i < jsonData.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = jsonData[i][col[j]];
            }
        }

        //This Code gets the all columns for header
        var divContainer = document.getElementById(elementToBind);
        divContainer.innerHTML = "";
        divContainer.appendChild(table);


}

//why does excel export quotes with symbols: https://community.jaspersoft.com/wiki/csv-report-right-single-quotation-mark-displays-garbage-characters-when-opening-excel#:~:text=When%20opening%20the%20CSV%20file,per%20the%20Windows%2D1252%20characterset.
function exportTableToCSV(filename) {
    var csv = [];
    var rows = document.querySelectorAll("table tr");

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");
        for (var j = 0; j < cols.length; j++)
            row.push('"' + cols[j].innerText + '"');
        csv.push(row.join(","));
    }
    // Download CSV file
    downloadCSV(csv.join("\n"), filename);
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;
    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});
    // Download link
    downloadLink = document.createElement("a");
    // File name
    downloadLink.download = filename;
    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);
    // Hide download link
    downloadLink.style.display = "none";
    // Add the link to DOM
    document.body.appendChild(downloadLink);
    // Click download link
    downloadLink.click();
}