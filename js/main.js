/*jshint esversion: 6 */
(function() {

    // Store Global Data Arrays
    var salaryChartData;
    var companyChartData;
    var stateMapCLIData;
    var federalTaxData;
    var stateTaxData;

    // Data Visualizations on Screen
    var myLineSalaryChart;
    var myBarChart;
    var myMap;
    var myDifferentialChart;
    var myCLIBarChart;

    // Calculated Values
    var rankedSalaryDifferential = [];

    // Current User Information
    var myInfo = {};
    myInfo.jobTypeObj = null;
    myInfo.salary = null;
    myInfo.federalTax = null;
    myInfo.stateTax = null;
    myInfo.selectedState = null;

    var selectedStates = {};
    selectedStates.curr = null;
    selectedStates.clicked = null;

    // Colors
    var colorScheme = {};
    colorScheme.primaryBackgroundColor = 'rgba(247,149,52, 0.37)';
    colorScheme.primaryColor = 'rgb(247,149,52)';
    colorScheme.companyChartSecondaryBackgroundColor = 'rgba(101, 215, 251, 0.2)';
    colorScheme.companyChartSecondaryColor = 'rgba(101, 215, 251,1)';
    colorScheme.salaryHistorySecondaryBackgroundColor = 'rgba(241, 75, 124, 0.3)';
    colorScheme.salaryHistorySecondaryColor = 'rgb(241, 75, 124)';
    colorScheme.salaryHistoryThirdBackgroundColor = 'rgba(241, 229, 75, 0.3)';
    colorScheme.salaryHistoryThirdColor = 'rgb(241, 229, 75)';
    colorScheme.mapDefaultFill = 'rgb(200, 200, 200)';
    colorScheme.mapGradient = ['rgb(75, 144, 64)','rgb(139, 192, 70)','rgb(226, 226, 226)', 'rgb(224, 154, 154)', 'rgb(227, 92, 92)'];
    colorScheme.differentialBarOneBackground = 'rgba(247,149,52, 0.3)';
    colorScheme.differentialBarOne = 'rgb(247,149,52)';
    colorScheme.differentialBarTwoBackground = 'rgba(172, 78, 190, 0.3)';
    colorScheme.differentialBarTwo = 'rgb(172,78,190)';

    // MARK: Load and Initialize all Data

    // Federal Tax Data
    d3.csv("data/federal_tax.csv", function(data) {
        if(data) {
            federalTaxData = data;
        } else {
            console.log("Federal Tax Data Loading Error");
        }
    });

    // State Tax Data
    d3.csv("data/state_tax.csv", function(data) {
        if(data) {
            stateTaxData = data;
        } else {
            console.log("State Tax Data Loading Error");
        }
    });

    // Fortune 500 Company Pay Data
    d3.csv("data/company_pay.csv", function(data) {
        if(data) {
            companyChartData = data;
            loadCompanyPay(data);
        } else {
            console.log("Company Data Loading Error");
        }
    });

    // Historical Salary Data
    d3.csv("data/historical_salary.csv", function(data) {
        if(data) {
            salaryChartData = data;
            loadHistoricalSalaryData(data);
        } else {
            console.log("Historical Salary Data Loading Error");
        }
    });

    // States Cost of Living Data
    d3.csv("data/cgi_states.csv", function(data) {
        if(data) {
            stateMapCLIData = data;
            setUpMap();
        } else {
            console.log("Cost of Living Data Loading Error");
        }
    });

    // MARK: Data Set Up

    // Load Company Bar Chart
    function loadCompanyPay(data) {
        var myChart = new Chart(companyChart, {
                    type: 'bar',
                    data: {
                        labels: ["Company 1", "Company 2", "Company 3"],
                        datasets: [
                            {
                                type: 'line',
                                label: 'My Average 2015 Salary',
                                data: [0,0,0],
                                fill: false,
                                backgroundColor: colorScheme.primaryBackgroundColor,
                                borderColor: colorScheme.primaryColor,
                                borderWidth: 1,
                                borderDash: [5,15]
                            },
                            {
                                type: 'bar',
                                label: 'Top Companies in Industry',
                                data: [0,0,0],
                                backgroundColor: colorScheme.companyChartSecondaryBackgroundColor,
                                borderColor: colorScheme.companyChartSecondaryColor,
                                borderWidth: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Median Salary Comparison with Fortune 500 Companies in Job Industry'
                        },
                        scales: {
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
    }

    // Set up historical line chart data
    function loadHistoricalSalaryData(data) {
        var chartData = {
            labels: ["2011", "2012", "2013", "2014", "2015"],
            datasets: [
                {
                    label: "My Job",
                    backgroundColor: colorScheme.primaryBackgroundColor,
                    borderColor: colorScheme.primaryColor,
                    borderWidth: 2,
                    fill: false,
                    data: []
                },
                {
                    label: "Comparable Job",
                    backgroundColor: colorScheme.salaryHistorySecondaryBackgroundColor,
                    borderColor: colorScheme.salaryHistorySecondaryColor,
                    borderWidth: 2,
                    fill: false,
                    data: []
                },
                {
                    label: "Comparable Job",
                    backgroundColor: colorScheme.salaryHistoryThirdBackgroundColor,
                    borderColor: colorScheme.salaryHistoryThirdColor,
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
                responsive: true,
                title: {
                    display: true,
                    text: 'Average Salary from 2011-2015'
                },
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
    }

    // Set Up Input Options
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

    // Initial Empty Map
    function setUpMap() {
        myMap = new Datamap({
            element: document.getElementById('costMap'),
            scope: 'usa',
            fills: {
                Selected: colorScheme.primaryColor,
                Clicked: colorScheme.mapClicked,
                GradientOne: colorScheme.mapGradient[0],
                GradientTwo: colorScheme.mapGradient[1],
                GradientThree: colorScheme.mapGradient[2],
                GradientFour: colorScheme.mapGradient[3],
                GradientFive: colorScheme.mapGradient[4],
                defaultFill: colorScheme.mapDefaultFill
            },
            data: {},
            geographyConfig: {
                highlightOnHover: false,
                popupTemplate: function(geo, data) {
                    return ['<div class="hoverinfo"><strong>',
                            geo.properties.name +
                            '</strong></div>'].join('');
                }
            },
        });

        myDifferentialChart = new Chart(salaryDifferentialChart, {

                    type: 'bar',
                    data: {
                        labels: ["Selected State", "Comparison State"],
                        datasets: [
                            {
                                type: 'bar',
                                label: 'Salary minus Taxes',
                                data: [0,0],
                                backgroundColor: [colorScheme.differentialBarOneBackground,colorScheme.differentialBarTwoBackground],
                                borderColor: [colorScheme.differentialBarOne,colorScheme.differentialBarTwo],
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Comparing Post Tax Salary per State'
                        },
                        scales: {
                            yAxes: [{
                                display: true,
                                ticks: {
                                    suggestedMin: 20000,
                                    suggestedMax: 60000
                                }
                            }]
                        },
                    }
        });

        myCLIBarChart = new Chart(cliBarChart, {
                    type: 'bar',
                    data: {
                        labels: ["Selected State", "Comparison State"],
                        datasets: [
                            {
                                type: 'bar',
                                label: 'Cost of Living Index',
                                data: [0,0],
                                backgroundColor: [colorScheme.differentialBarOneBackground,colorScheme.differentialBarTwoBackground],
                                borderColor: [colorScheme.differentialBarOne,colorScheme.differentialBarTwo],
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Comparing Cost of Living per State (Indexed to 100)'
                        },
                        scales: {
                            yAxes: [{
                                display: true,
                                ticks: {
                                    suggestedMin: 50,
                                    suggestedMax: 150
                                }
                            }]
                        },
                    }
        });
    }

    // MARK: Dynamic Data Updating

    // Update charts according to jobType
    function updateJobType(value) {
        updateSalaryChartByJob(value);
        updateBarChartByJob(value);
        updateInfoSectionByJob(value);
        updateMapSalaryDifferential();
    }

    function updateMapSalaryDifferential() {
        $("#costMap").parent().append('<div id="costMap" style="width: 100%; height: 400px;"></div>');
        $("#costMap").remove();
        var fedTax = getFederalTax();
        var quantileArr = [];
        rankedSalaryDifferential = [];
        for(var i = 0; i < stateMapCLIData.length; i++) {
            var state = stateMapCLIData[i].State;
            var state_name = stateMapCLIData[i].State_Name;
            var stateobj = {};
            stateobj.State = state;
            stateobj.State_Name = state_name;
            stateobj.Scaled_Pay = myInfo.salary - fedTax - getStateTax(state);
            quantileArr.push(stateobj.Scaled_Pay);
            rankedSalaryDifferential.push(stateobj);
        }
        var quintileScaledPay = jStat.quantiles(quantileArr,[0.2, 0.4, 0.6, 0.8]);
        var datamap = {};
        for(var j = 0; j < rankedSalaryDifferential.length; j++) {
            var scaled_pay = rankedSalaryDifferential[j].Scaled_Pay;
            var stateCode = rankedSalaryDifferential[j].State;
            if(scaled_pay >= quintileScaledPay[3]) {
                datamap[stateCode] = { fillKey: "GradientOne" };
            } else if(scaled_pay >= quintileScaledPay[2]) {
                datamap[stateCode] = { fillKey: "GradientTwo" };
            } else if(scaled_pay >= quintileScaledPay[1]) {
                datamap[stateCode] = { fillKey: "GradientThree" };
            } else if(scaled_pay >= quintileScaledPay[0]) {
                datamap[stateCode] = { fillKey: "GradientFour" };
            } else {
                datamap[stateCode] = { fillKey: "GradientFive" };
            }
            datamap[stateCode].PayDifferential = scaled_pay;
        }
        myMap = new Datamap({
            element: document.getElementById('costMap'),
            scope: 'usa',
            fills: {
                GradientOne: colorScheme.mapGradient[0],
                GradientTwo: colorScheme.mapGradient[1],
                GradientThree: colorScheme.mapGradient[2],
                GradientFour: colorScheme.mapGradient[3],
                GradientFive: colorScheme.mapGradient[4],
                defaultFill: colorScheme.mapDefaultFill
            },
            data: datamap,
            geographyConfig: {
                highlightOnHover: true,
                highlightFillColor: 'rgb(172,78,190)',
                highlightBorderColor: 'rgb(99, 24, 113)',
                popupTemplate: function(geo, data) {
                    return ['<div class="hoverinfo"><strong>',
                            geo.properties.name + ': $ ' + addCommas(data.PayDifferential.toFixed(2)),
                            '</strong></div>'].join('');
                }
            },
            done: function(datamap) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                    var state = geography.id;
                    if(state !== selectedStates.curr) {
                        var state_cli = stateMapCLIData.filter(function(arr_val) {
                            return arr_val.State === state;
                        })[0];
                        myDifferentialChart.config.data.labels[1] = state_cli.State_Name;
                        myCLIBarChart.config.data.labels[1] = state_cli.State_Name;
                        myCLIBarChart.config.data.datasets[0].data[1] = state_cli.Index;
                        if(myInfo.salary) {
                            var state_differential = rankedSalaryDifferential.filter(function(arr_value) {
                                return arr_value.State === state;
                            })[0];
                            myDifferentialChart.config.data.datasets[0].data[1] = state_differential.Scaled_Pay;
                        }
                        myDifferentialChart.update();
                        myCLIBarChart.update();
                    }
                });
            }
        });
        var state_differential = rankedSalaryDifferential.filter(function(arr_value) {
            return arr_value.State === selectedStates.curr;
        })[0];
        console.log(state_differential);
        if(state_differential) {
            myDifferentialChart.config.data.datasets[0].data[0] = state_differential.Scaled_Pay;
            myDifferentialChart.update();
        }
    }

    function updateSalaryChartByJob(value) {
        //Update Salary Chart
        var newJobType = salaryChartData.filter(function(arr_value) {
            return arr_value.Job === value;
        })[0];
        myInfo.newJobType = newJobType;
        var comparableJobs = salaryChartData.filter(function(arr_val) {
            return arr_val.Industry === newJobType.Industry;
        });
        var jobOne = comparableJobs[Math.floor(Math.random()*comparableJobs.length)];
        var jobTwo;
        while(!jobTwo || (jobTwo === jobOne)) {
            jobTwo = comparableJobs[Math.floor(Math.random()*comparableJobs.length)];
        }
        var currData = myLineSalaryChart.config.data.datasets;
        currData[0].label = newJobType.Job;
        currData[0].data = [newJobType["2011"], newJobType["2012"], newJobType["2013"], newJobType["2014"], newJobType["2015"]];
        currData[1].label = jobOne.Job;
        currData[1].data = [jobOne["2011"], jobOne["2012"], jobOne["2013"], jobOne["2014"], jobOne["2015"]];
        currData[2].label = jobTwo.Job;
        currData[2].data = [jobTwo["2011"], jobTwo["2012"], jobTwo["2013"], jobTwo["2014"], jobTwo["2015"]];
        myLineSalaryChart.update();
    }

    function updateBarChartByJob(value) {
        //Update Bar Chart
        var barData = myBarChart.config.data.datasets;
        var newIndustryArr = companyChartData.filter(function(arr_value) {
            return arr_value.Industry === myInfo.newJobType.Industry;
        });
        var companyOne = newIndustryArr[Math.floor(Math.random()*newIndustryArr.length)];
        var companyTwo, companyThree;
        while(!companyTwo || (companyTwo === companyOne)) {
            companyTwo = newIndustryArr[Math.floor(Math.random()*newIndustryArr.length)];
        }
        while(!companyThree || (companyThree === companyOne) || (companyThree === companyTwo)) {
            companyThree = newIndustryArr[Math.floor(Math.random()*newIndustryArr.length)];
        }
        myBarChart.config.data.datasets[0].label = myInfo.newJobType.Job + " Average Salary (2015)";
        myBarChart.config.data.labels[0] = companyOne.Name;
        myBarChart.config.data.labels[1] = companyTwo.Name;
        myBarChart.config.data.labels[2] = companyThree.Name;
        barData[0].data[0] = barData[0].data[1] = barData[0].data[2] = myInfo.newJobType["2015"];
        barData[1].data[0] = companyOne.Pay;
        barData[1].data[1] = companyTwo.Pay;
        barData[1].data[2] = companyThree.Pay;
        myBarChart.update();
    }

    function updateInfoSectionByJob(value) {
        //Update info section
        myInfo.salary = parseInt(myInfo.newJobType["2015"]);
        $('#my-job').text(myInfo.newJobType.Job);
        $('#job-salary').text("$ " + addCommas(myInfo.salary.toFixed(2)));
        myInfo.federalTax = getFederalTax();
        myInfo.federalTax = addCommas(myInfo.federalTax.toFixed(2));
        $('#federal-tax').text("$ " + myInfo.federalTax);
        if(selectedStates.curr) {
            setStateTax(selectedStates.curr);
        }
        //Misc Label Updating
        $('#mapJobTypeVal').text(myInfo.newJobType.Job);
    }

    function getFederalTax() {
        var rate = 0;
        if(!myInfo.salary) {myInfo.salary = 0;}
        for(var i = 0; i < federalTaxData.length; i++) {
            if(federalTaxData[i].Max == -1) {
                if(myInfo.salary >= federalTaxData[i].Min) {
                    rate = federalTaxData[i].Rate;
                    break;
                }
            } else {
                if(myInfo.salary >= federalTaxData[i].Min && myInfo.salary <= federalTaxData[i].Max) {
                    rate = federalTaxData[i].Rate;
                    break;
                }
            }
        }
        return rate*myInfo.salary;
    }

    function updateState(value) {
        selectedStates.curr = value;
        var state_cli = stateMapCLIData.filter(function(arr_val) {
            return arr_val.State === value;
        })[0];
        myDifferentialChart.config.data.labels[0] = state_cli.State_Name;
        myCLIBarChart.config.data.labels[0] = state_cli.State_Name;
        myCLIBarChart.config.data.datasets[0].data[0] = state_cli.Index;
        if(myInfo.salary) {
            setStateTax(value);
            var state_differential = rankedSalaryDifferential.filter(function(arr_value) {
                return arr_value.State === value;
            })[0];
            myDifferentialChart.config.data.datasets[0].data[0] = state_differential.Scaled_Pay;
        }
        myDifferentialChart.update();
        myCLIBarChart.update();
    }

    function setStateTax(value) {
        var stateNameList = stateMapCLIData.filter(function(arr_val) {
            return arr_val.State === value;
        });
        myInfo.stateTax = getStateTax(value);
        if(!myInfo.stateTax) {
            myInfo.stateTax = 0;
        }
        $("#state-tax").text("$ " + addCommas(myInfo.stateTax.toFixed(2)) + " ("+ value +")");
    }

    function getStateTax(state) {
        //Get State Tax
        if(myInfo.salary) {
            var stateTaxList = stateTaxData.filter(function(arr_val) {
                return arr_val.State === state;
            });
            if(stateTaxList[0].Fed_Ind === 1) {
                if(myInfo.federalTax) {
                    return stateTaxList[0].Rate * myInfo.federalTax;
                }
            } else {
                var state_rate;
                for(var i = 0; i < stateTaxList.length; i++) {
                    if(stateTaxList[i].Max == -1) {
                        if(myInfo.salary >= stateTaxList[i].Min) {
                            state_rate = stateTaxList[i].Rate;
                            return state_rate * myInfo.salary;
                        }
                    } else {
                        if(myInfo.salary >= stateTaxList[i].Min && myInfo.salary <= stateTaxList[i].Max) {
                            state_rate = stateTaxList[i].Rate;
                            return state_rate * myInfo.salary;
                        }
                    }
                }
            }
        }
    }

    // MARK: Utility Functions
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

})();
