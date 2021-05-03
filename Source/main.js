var currStock = {};
var stockSign = [];
var stockValue = [];
var newStockValue = [];
var graph;
var currentPrice = 'c';
var highPrice = 'h';
var lowPrice = 'l';
var openPrice = 'o';
var prevClosePrice = 'pc';
var success = false;
var currentPriceValue = 0;
var currstockSign = "";
var timelyUpdate = ""
var tryAgain = ""
var l = 0;

// initial on ready call
$(document).ready(function () {
    $("#stockSign").focus();
    $("#stockSign").keyup(function (event) {
        if (event.keyCode === 13) {            //On Press ENTER Key call the click function
            $("#addStock").click();            
        }
    })    

    // Add stock on click button
    $("#addStock").on("click", function () {
        currstockSign = document.getElementById('stockSign').value.toUpperCase();        
        // MakeURL for new Stock and manage AJAX Call        
        if (currstockSign.length >= 1 && !(currstockSign in currStock)){ //check for duplicates and if so, do not add the stock
            var url = makeURL(currstockSign);
            manageCalls(url);
            document.getElementById("Error").innerHTML = "Processing...";
            document.getElementById("Error").style.color = "black";       
        }
        else{
            document.getElementById("Error").innerHTML = "Duplicate Entry! Stock already exists in the list.";
            document.getElementById("Error").style.color = "red";
            $('#stockSign').val("");
            
        }
    });        


});

// Create a URL to link to FinnHub to check the price of the chart in real time
function makeURL(ticker){    
    return "https://finnhub.io/api/v1/quote?symbol="+ticker+"&token=c1p1e2iad3ic1jon4h1g"
}

// Create Card to display the list of the stock signs that are added to the picture
function createCard(val)
{
 var cards ='<li><div class="card" style="width: 100%;"><div class="card-body"><h5 class="card-title">'+val+'</h5></div></div></li>';
 return cards;
}

// Create the main chart to display prices
function createChart()
{
    var ctx = document.getElementById('graph');
    graph = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: stockSign,
            datasets: [{
                label: 'Stock Price',
                data: stockValue,
                hoverBackgroundColor:[
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(201, 203, 207, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(201, 203, 207, 0.8)'
                  ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.4)',
                    'rgba(255, 159, 64, 0.4)',
                    'rgba(255, 205, 86, 0.4)',
                    'rgba(75, 192, 192, 0.4)',
                    'rgba(54, 162, 235, 0.4)',
                    'rgba(153, 102, 255, 0.4)',
                    'rgba(201, 203, 207, 0.4)',
                    'rgba(255, 99, 132, 0.4)',
                    'rgba(255, 159, 64, 0.4)',
                    'rgba(255, 205, 86, 0.4)',
                    'rgba(75, 192, 192, 0.4)',
                    'rgba(54, 162, 235, 0.4)',
                    'rgba(153, 102, 255, 0.4)',
                    'rgba(201, 203, 207, 0.4)'
                  ],
                  borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)',
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                  ],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,                        
                        callback: function (value, index, values) {return '$' + value;}    //Add monetary sign to the axis                    
                    },
                    gridLines: {drawOnChartArea: false }
                }],
                yAxes: [{barPercentage: 1}]
            },
            legend: {
                labels: {fontColor: 'black',}
            },
            "animation": {
                "duration": 3,
                "onComplete": function () {
                    var chartInstance = this.chart,
                    ctx = chartInstance.ctx;                   
                    ctx.font = Chart.helpers.fontString(Chart.defaults.defaultFontFamily, "bold", Chart.defaults.global.defaultFontFamily);                    
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    this.data.datasets.forEach(function (dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function (bar, index) {
                            var data = dataset.data[index];                            
                            ctx.fillText(data, bar._model.x, bar._model.y - 5);
                        });
                    });
                }
            }  
        }
    });
}

//AJAX Calls for updation
function sendAjaxRequestToUpdate(url, stockSign) {
    $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
            newStockValue.push(response[currentPrice]);
            stockValue[currStock[stockSign]] = response[currentPrice];
            if (newStockValue.length == l) {         
                console.log(stockValue);       
                graph.data.datasets[0].data = stockValue;                                
                graph.update();
            }
        },
        statusCode: {},
        error: function () {
            document.getElementById("Error").innerHTML = "Unable to process your request.";
            document.getElementById("Error").style.color = "red";
            console.log("Unable to process your request.");
            clearInterval(timelyUpdate);
            tryAgain = true;
        }
    });
}


//AJAX calls initialization
function sendAjaxRequest(url, successcallbackfunction) {
    $.ajax({
        type: "GET",
        url: url,
        success: successcallbackfunction,
        statusCode: {},
        error: function () {
            document.getElementById("Error").innerHTML = "Unable to process your request.";
            document.getElementById("Error").style.color = "red";
            console.log("Unable to process your request.");
            clearInterval(timelyUpdate);
            tryAgain = true;            
        }
    });
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

//Response Decision function
function manageCalls(url){
    success = false;
    sendAjaxRequest(url, function(response) {
        console.log(response);
        if (response[currentPrice]==0){
            //On Error
            success=false;
            document.getElementById("Error").innerHTML = "Invalid Entry! Please enter the correct stock sign.";
            document.getElementById("Error").style.color = "red";
            $('#stockSign').val("");
        }
        else if (isEmpty(response)) {
            //On Error
            success = false;
            document.getElementById("Error").innerHTML = "Invalid Entry! Please enter the correct stock sign.";
            document.getElementById("Error").style.color = "red";
            $('#stockSign').val("");
        }
        else{
            //On Success
            success = true;
            document.getElementById("Error").innerHTML = "Success";
            document.getElementById("Error").style.color = "green";
            currentPriceValue = response[currentPrice];
        }
        
        if (success == true) {            
            //On Success
            document.getElementById("Error").innerHTML = "Success";
            document.getElementById("Error").style.color = "green";
            stockSign.push(currstockSign);
            stockValue.push(currentPriceValue); 
            currStock[currstockSign] = stockSign.length - 1;           

            //Update chart condition
            if (stockSign.length == 1) {
                document.getElementById("stockList").style.display = "block";
                createChart();
                //Start the timer for updating it to every 5000 milliseconds or 5 minutes
                timelyUpdate = setInterval(chartUpdate, 5000);         
            }
            else {
                //If Error Occurs
                if (tryAgain==true){
                    //Start the timer for updating it to every 5000 milliseconds or 5 minutes
                    timelyUpdate = setInterval(chartUpdate, 5000);
                    tryAgain = false;
                }
                graph.update()                
            }

            //Show the list for the stock signs in cards
            var x = createCard(currstockSign);
            $("#stockList ol").append(x);

            //clear the input box
            $('#stockSign').val("");
        }
    });    
}


// Update Chart
function chartUpdate() {

    console.log("Updating");
    
    var iURL = ""

    newStockValue = [];
    l = stockSign.length

    for(var i in stockSign){        
        iURL = makeURL(stockSign[i]);        
        sendAjaxRequestToUpdate(iURL, stockSign[i]);        
    }
}