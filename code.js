
$(document).ready(function () {
    $("#filter").submit(genBarcode);
    $("#start-over").on("click", clearSite);
    $("#print").on("click", printDiv);

})

function genBarcode(event) {
    event.preventDefault();


    let ndc = $("input#ndc").val();
    let month = $("input#month").val();
    let day = $("input#day").val();
    let year = $("input#year").val();
    let lot = $("input#lot").val();
    let drug = $("input#drug").val();
    let facility = $("input#facility").val();

    let input = '103'+ ndc;

    let checkDigit = checkdigit(input);



    $("p#barcodeDiv").after(`<div id="bcprint"><div class ="label" style='float: left; padding: 5px;'>
<!-- insert your custom barcode setting your data in the GET parameter "data" -->
        <img alt='Barcode Generator TEC-IT'
        id = 'theBarcode'
        src='https://barcode.tec-it.com/barcode.ashx?data=01${input}${checkDigit}17${year}${month}${day}10${lot}&code=DataMatrix&unit=Min&dmsize=Default'/>
        <div class="label" style='float: left; padding: 15px;'>
        <p class="contents" style='left: -15px;top: -25px;position: relative; font-size: 0.75em;'>NDC: ${ndc}, Exp: ${month}/${day}/${year}, Lot: ${lot} <br>
        ${drug} <br>
        ${facility}</p></div>
        </div></div>`);

}
function printDiv() {
    var divContents = document.getElementById("printSpace").innerHTML;
    var a = window.open('', '', 'height=300, width=300', );
    a.document.write('<html>');
    a.document.write('<body >');
    a.document.write(divContents);
    a.document.write('</body></html>');
    a.document.close();
    a.print();
}

function checkdigit(input) {

    let array = input.split('').reverse();

    let total = 0;
    let i = 1;
    array.forEach(number => {
        number = parseInt(number);
        if (i % 2 === 0) {
            total = total + number;
        }
        else
        {
            total = total + (number * 3);
        }
        i++;
    });

    return (Math.ceil(total / 10) * 10) - total;

}

function clearSite(){
    location.reload();
}

