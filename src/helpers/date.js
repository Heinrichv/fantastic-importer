module.exports = {
    getMonth: function (date) {
        return dateF(date, "mmmm");
    },
    // Formats date object to yyyy ('2018').
    getYear: function (date) {
        return dateF(date, "yyyy");
    },
    // Formats date object to mmmm yyyy ('January 2018').
    getMonthYear: function (date) {
        return dateF(date, "mmmm yyyy");
    },
    // Formats date object to mmmm yyyy ('January 2018').
    getMonthBeginning: function (date) {
        return dateF(date, "yyyy-mm-01 00:00:00");
    }
 }