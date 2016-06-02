/*jshint esversion: 6 */
(function() {

    var myJob = "";
    var mySalary = 0;
    var myState = "";

    var companyChart = $("#companyChart");
    var salaryChart = $("#salaryChart");

    var salaryChartData;
    var companyChartData;
    var myLineSalaryChart;
    var myBarChart;

    var map;

    // Load and Initialize all Data

    // Load Company Pay Data
    d3.csv("data/company_pay.csv", function(data) {
        if(data) {
            companyChartData = data;
            var myChart = new Chart(companyChart, {
                        type: 'bar',
                        data: {
                            labels: ["My Salary", data[1].Name, data[2].Name],
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
            myBarChart = myChart;
        } else {
            console.log("Company Data Loading Error");
        }
    });

    d3.csv("data/historical_salary.csv", function(data) {
        if(data) {
            salaryChartData = data;
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
                    }
                ]
            };
            var myLineChart = new Chart(salaryChart, {
                type: 'line',
                data: chartData
            });
            myLineSalaryChart = myLineChart;
            setUpInputs(data, myLineChart);
        } else {
            console.log("Historical Salary Data Loading Error");
        }
    });

    function setUpInputs(data, myLineChart) {
        var jobTypeOptions = [];
        for(var i = 0; i < data.length; i++) {
            var newJob = {
                text: data[i].Job,
                value: data[i].Job
            };
            jobTypeOptions.push(newJob);
        }
        $('#jobTypeSelector').selectize({
            options: jobTypeOptions,
            create: false,
            sortField: 'text',
            onChange: function(value) {
                updateJobType(value, myLineChart.config.data);
            }
        });
        var $select = $('#select-state').selectize({
    		onChange: function(value) {
                updateState(value);
            }
    	});
    }

    var selectedStates = {};
    selectedStates.curr = "";
    selectedStates.clicked = [];

    d3.csv("data/cgi_states.csv", function(data) {
        if(data) {
            var mapData = {};
            for(var i = 0; i < data.length; i++) {
                mapData[data[i].State] = {
                    CLI: data[i].Index
                };
            }
            console.log(mapData);
            map = new Datamap({
                element: document.getElementById('costMap'),
                scope: 'usa',
                fills: {
                    Selected: "blue",
                    Clicked: "green",
                    defaultFill: 'rgba(150, 150, 150, 0.72)'
                },
                data: mapData,
                geographyConfig: {
                    highlightOnHover: false,
                    popupTemplate: function(geo, data) {
                        return ['<div class="hoverinfo"><strong>',
                                'CLI: ' + data.CLI,
                                '</strong></div>'].join('');
                    }
                },
                done: function(datamap) {
                    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                        var update = {};
                        var state = geography.id;
                        if(state !== selectedStates.curr && selectedStates.clicked.indexOf(state) === -1) {
                            update[geography.id] = {fillKey: "Clicked"};
                            selectedStates.clicked.push(state);
                            map.updateChoropleth(update);
                        } else if(state !== selectedStates.curr) {
                            update[geography.id] = {fillKey: "defaultFill"};
                            selectedStates.clicked.splice(selectedStates.clicked.indexOf(state),1);
                            map.updateChoropleth(update);
                        }
                    });
                }
            });
        } else {
            console.log("Cost of Living Data Loading Error");
        }
    });

    // MARK: Dynamic Data Updating

    // Update charts according to jobType
    function updateJobType(value) {
        var newJobType = salaryChartData.filter(function(arr_value) {
            return arr_value.Job === value;
        })[0];
        var currData = myLineSalaryChart.config.data.datasets[0];
        currData.label = newJobType.Job;
        currData.data = [newJobType["2011"], newJobType["2012"], newJobType["2013"], newJobType["2014"], newJobType["2015"]];
        myLineSalaryChart.update();
        var barData = myBarChart.config.data.datasets[0];
        barData.data[0] = newJobType["2015"];
        myBarChart.update();
    }

    function updateState(value) {
        var update = {};
        update[value] = {fillKey: "Selected"};
        selectedStates.curr = value;
        map.updateChoropleth(update, {reset: true});
    }

})();
