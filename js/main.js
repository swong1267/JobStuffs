/*jshint esversion: 6 */
(function() {

    var myJob = "Software Engineer";
    var mySalary = 90000;

    var companyChart = $("#companyChart");
    var salaryChart = $("#salaryChart");

    // Load Company Pay Data
    d3.csv("data/company_pay.csv", function(data) {
        if(data) {
            var myChart = new Chart(companyChart, {
                        type: 'bar',
                        data: {
                            labels: [myJob, data[1].Name, data[2].Name],
                            datasets: [{
                                label: 'Median Salary',
                                data: [mySalary, data[1].Pay, data[2].Pay],
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                borderColor: 'rgba(255,99,132,1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            responsiveAnimationDuration: 0,
                            maintainAspectRatio: true
                        }
            });
        } else {
            console.log("Company Data Loading Error");
        }
    });

    d3.csv("data/historical_salary.csv", function(data) {
        if(data) {
            var chartData = {
                labels: ["2011", "2012", "2013", "2014", "2015"],
                datasets: [
                    {
                        label: data[0].Job,
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: [data[0]["2011"]*100, data[0]["2012"]*100, data[0]["2013"]*100, data[0]["2014"]*100, data[0]["2015"]*100],
                    },
                    {
                        label: data[1].Job,
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: [data[1]["2011"]*100, data[1]["2012"]*100, data[1]["2013"]*100, data[1]["2014"]*100, data[1]["2015"]*100],
                    }
                ]
            };
            var myLineChart = new Chart(salaryChart, {
                type: 'line',
                data: chartData
            });
            setUpJobTypeInput(data);
        } else {
            console.log("Historical Salary Data Loading Error");
        }
    });

    function setUpJobTypeInput(data) {
        var jobTypeOptions = [];
        for(var i = 0; i < data.length; i++) {
            var newJob = {
                text: data[i].Job,
                value: i
            };
            jobTypeOptions.push(newJob);
        }
        $('#jobTypeSelector').selectize({
            options: jobTypeOptions,
            create: false,
            sortField: 'text'
        });
        $("#select-state").selectize();
    }

    var map = new Datamap({
        element: document.getElementById('costMap'),
        scope: 'usa'
    });


})();
