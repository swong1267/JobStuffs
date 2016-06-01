/*jshint esversion: 6 */
(function() {
    d3.csv("data/company_pay.csv", function(data) {
        if(data) {
            console.log(data[0]);
        }
    });
})();
