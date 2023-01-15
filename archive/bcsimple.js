i = 0;
$(document).ready(function(){
    $("html").keypress(addLetter);
    $("html").keypress(counterRestart);
    $("#start-over").on("click", clearSite);
})

let myArray =  [];
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

            $("#pResult1").append('<img src="../images/PIBC.png" alt="barcode present" />');
            $("#pResult1").append('<br>');
            $("#pResult2").append(myArray.join("").toString());
            while (myArray.length > 0) {
                myArray.pop();
            }
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