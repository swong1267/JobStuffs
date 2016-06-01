/*jshint esversion: 6 */
(function() {

    var myJob = "Software Engineer";
    var mySalary = 90000;

    var ctx = $("#companyChart");

    // Load Company Pay Data
    d3.csv("data/company_pay.csv", function(data) {
        if(data) {
            var myChart = new Chart(ctx, {
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
})();
