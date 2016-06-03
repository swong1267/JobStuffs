/*jshint esversion: 6 */
(function() {

    var companyChart = $("#companyChart");
    var salaryChart = $("#salaryChart");

    var salaryChartData;
    var companyChartData;
    var myLineSalaryChart;
    var myBarChart;

    var stateMapData;
    var map;

    var federalTaxData;
    var stateTaxData;

    var federalTax;
    var salary;
    var selectedState;
    var selectedStateCLI;
    var comparedState;
    var comparedStateCLI;

    // Load and Initialize all Data

    // Load Company Pay Data
    d3.csv("data/company_pay.csv", function(data) {
        if(data) {
            companyChartData = data;
            var myChart = new Chart(companyChart, {
                        title: {text: "Top Company Salaries in Industry"},
                        type: 'bar',
                        data: {
                            labels: ["My Salary", data[1].Name, data[2].Name],
                            datasets: [
                                {
                                    label: 'My Salary',
                                    data: [0,0,0],
                                    backgroundColor: 'rgba(75, 144, 64, 0.37)', //Green
                                    borderColor: 'rgb(75, 144, 64)',
                                    borderWidth: 2
                                },
                                {
                                    label: 'Top Companies in Industry',
                                    data: [0,0,0],
                                    backgroundColor: 'rgba(247,149,52, 0.2)', //Orange
                                    borderColor: 'rgba(247,149,52,1)',
                                    borderWidth: 2
                                }
                            ]
                        },
                        options: {
                            scales: {
                                xAxes: [{
                                    stacked: true
                                }],
                                yAxes: [{
                                    display: true,
                                    ticks: {
                                        beginAtZero: true,
                                        suggestedMax: 100000
                                    }
                                }]
                            },
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
                        label: "Comparable Job",
                        backgroundColor: 'rgba(247,149,52, 0.37)',
                        borderColor: "rgba(247,149,52, 0.9)",
                        borderWidth: 2,
                        fill: false,
                        data: []
                    },
                    {
                        label: "My Job",
                        backgroundColor: 'rgba(75, 144, 64, 0.37)',
                        borderColor: "rgb(75, 144, 64)",
                        borderWidth: 2,
                        fill: false,
                        data: []
                    },
                    {
                        label: "Comparable Job",
                        backgroundColor: 'rgba(247,149,52, 0.37)',
                        borderColor: "rgba(247,149,52, 0.9)",
                        borderWidth: 2,
                        fill: false,
                        data: []
                    }
                ]
            };
            var myLineChart = new Chart(salaryChart, {
                type: 'line',
                data: chartData,
                options: {
                    scales: {
                        yAxes: [{
                            display: true,
                            ticks: {
                                beginAtZero: true,
                                suggestedMax: 100000
                            }
                        }]
                    }
                }
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
    selectedStates.clicked = "";

    d3.csv("data/cgi_states.csv", function(data) {
        if(data) {
            stateMapData = data;
            var mapData = {};
            for(var i = 0; i < data.length; i++) {
                mapData[data[i].State] = {
                    CLI: data[i].Index
                };
            }
            map = new Datamap({
                element: document.getElementById('costMap'),
                scope: 'usa',
                fills: {
                    Selected: "rgba(75, 144, 64, 1)",
                    Clicked: "rgba(247,149,52, 1)",
                    defaultFill: 'rgba(150, 150, 150, 0.72)'
                },
                data: mapData,
                geographyConfig: {
                    highlightOnHover: false,
                    popupTemplate: function(geo, data) {
                        return ['<div class="hoverinfo"><strong>',
                                geo.properties.name + ': ' + data.CLI,
                                '</strong></div>'].join('');
                    }
                },
                done: function(datamap) {
                    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                        var update = {};
                        var state = geography.id;
                        if(state !== selectedStates.curr && selectedStates.clicked === state) {
                            update[geography.id] = {fillKey: "defaultFill"};
                            selectedStates.clicked = "";
                            map.updateChoropleth(update);
                            $("#compared-state").text("");
                            $("#delta-state").text("");
                        } else if(state !== selectedStates.curr) {
                            update[state] = {fillKey: "Clicked"};
                            update[selectedStates.clicked] = {fillKey: "defaultFill"};
                            map.updateChoropleth(update);
                            selectedStates.clicked = state;
                            var stateNameList = stateMapData.filter(function(arr_val) {
                                return arr_val.State === state;
                            });
                            $("#compared-state").text(stateNameList[0].State_Name + " " + stateNameList[0].Index);
                            comparedStateCLI = stateNameIndex[0].Index;
                            if(selectedStateCLI) {
                                var delta = selectedStateCLI - stateNameList[0].Index;
                                $("#delta-state").text(delta.toFixed(2));
                            }
                        }
                    });
                }
            });
        } else {
            console.log("Cost of Living Data Loading Error");
        }
    });

    d3.csv("data/federal_tax.csv", function(data) {
        if(data) {
            federalTaxData = data;
        } else {
            console.log("Federal Tax Data Loading Error");
        }
    });

    d3.csv("data/state_tax.csv", function(data) {
        if(data) {
            stateTaxData = data;
        } else {
            console.log("State Tax Data Loading Error");
        }
    });

    // MARK: Dynamic Data Updating

    // Update charts according to jobType
    function updateJobType(value) {
        //Update Salary Chart
        var newJobType = salaryChartData.filter(function(arr_value) {
            return arr_value.Job === value;
        })[0];
        //Get Industry Companies
        var comparableJobs = salaryChartData.filter(function(arr_val) {
            return arr_val.Industry === newJobType.Industry;
        });
        var jobOne = comparableJobs[Math.floor(Math.random()*comparableJobs.length)];
        var jobTwo;
        while(!jobTwo || (jobTwo === jobOne)) {
            jobTwo = comparableJobs[Math.floor(Math.random()*comparableJobs.length)];
        }
        var currData = myLineSalaryChart.config.data.datasets;
        currData[0].label = jobOne.Job;
        currData[0].data = [jobOne["2011"], jobOne["2012"], jobOne["2013"], jobOne["2014"], jobOne["2015"]];
        currData[2].label = jobTwo.Job;
        currData[2].data = [jobTwo["2011"], jobTwo["2012"], jobTwo["2013"], jobTwo["2014"], jobTwo["2015"]];
        currData[1].label = newJobType.Job;
        currData[1].data = [newJobType["2011"], newJobType["2012"], newJobType["2013"], newJobType["2014"], newJobType["2015"]];
        myLineSalaryChart.update();

        //Update Bar Chart
        var barData = myBarChart.config.data.datasets;
        var newIndustryArr = companyChartData.filter(function(arr_value) {
            return arr_value.Industry === newJobType.Industry;
        });
        var companyOne = newIndustryArr[Math.floor(Math.random()*newIndustryArr.length)];
        var companyTwo, companyThree;
        while(!companyTwo || (companyTwo === companyOne)) {
            companyTwo = newIndustryArr[Math.floor(Math.random()*newIndustryArr.length)];
        }
        while(!companyThree || (companyThree === companyOne) || (companyThree === companyTwo)) {
            companyThree = newIndustryArr[Math.floor(Math.random()*newIndustryArr.length)];
        }
        myBarChart.config.data.labels[0] = companyOne.Name;
        myBarChart.config.data.labels[1] = companyTwo.Name;
        myBarChart.config.data.labels[2] = companyThree.Name;
        barData[0].data[0] = barData[0].data[1] = barData[0].data[2] = newJobType["2015"];
        barData[1].data[0] = companyOne.Pay;
        barData[1].data[1] = companyTwo.Pay;
        barData[1].data[2] = companyThree.Pay;
        myBarChart.update();

        //Update info section
        salary = parseInt(newJobType["2015"]);
        $('#my-job').text(newJobType.Job);
        $('#job-salary').text("$ " + addCommas(salary.toFixed(2)));
        var rate = 0;
        if(!salary) {salary = 0;}
        for(var i = 0; i < federalTaxData.length; i++) {
            if(federalTaxData[i].Max == -1) {
                if(salary >= federalTaxData[i].Min) {
                    rate = federalTaxData[i].Rate;
                    break;
                }
            } else {
                if(salary >= federalTaxData[i].Min && salary <= federalTaxData[i].Max) {
                    rate = federalTaxData[i].Rate;
                    break;
                }
            }
        }
        federalTax = rate*salary;
        federalTax = addCommas(federalTax.toFixed(2));
        $('#federal-tax').text("$ " + federalTax);
        if(selectedState) {
            setStateTax(selectedState);
        }
    }

    function updateState(value) {
        selectedState = value;
        var update = {};
        var lastState = selectedStates.curr;
        if(lastState) {
            update[lastState] = {fillKey: "defaultFill"};
        }
        update[value] = {fillKey: "Selected"};
        selectedStates.curr = value;
        map.updateChoropleth(update);
        if(stateMapData) {
            var stateVal = stateMapData.filter(function(arr_val) {
                return value === arr_val.State;
            });
            $('#cli-index').text(stateVal[0].Index);
        }
        setStateTax(value);
    }

    function addCommas(nStr)
    {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function setStateTax(value) {
        var stateNameList = stateMapData.filter(function(arr_val) {
            return arr_val.State === value;
        });
        $("#selected-state").text(stateNameList[0].State_Name + " " + stateNameList[0].Index);
        selectedStateCLI = stateNameList[0].Index;
        if(comparedStateCLI) {
            var delta = stateNameList[0].Index-comparedStateCLI;
            $("#delta-state").text(delta.toFixed(2));
        } else {
            $("#delta-state").text("");
        }
        //Get State Tax
        if(salary) {
            var stateTaxList = stateTaxData.filter(function(arr_val) {
                return arr_val.State === value;
            });
            var stateTax;
            if(stateTaxList[0].Fed_Ind === 1) {
                if(federalTax) {
                    stateTax = stateTaxList[0].Rate * federalTax;
                    $("#state-tax").text("$ " + addCommas(stateTax.toFixed(2)));
                }
            } else {
                var state_rate;
                for(var i = 0; i < stateTaxList.length; i++) {
                    if(stateTaxList[i].Max == -1) {
                        if(salary >= stateTaxList[i].Min) {
                            state_rate = stateTaxList[i].Rate;
                            stateTax = state_rate * salary;
                            $("#state-tax").text("$ " + addCommas(stateTax.toFixed(2)));
                            break;
                        }
                    } else {
                        if(salary >= stateTaxList[i].Min && salary <= stateTaxList[i].Max) {
                            state_rate = stateTaxList[i].Rate;
                            stateTax = state_rate * salary;
                            $("#state-tax").text("$ " + addCommas(stateTax.toFixed(2)));
                            break;
                        }
                    }
                }
            }
        }
    }

})();
