module.exports = {
    errSQL: function (err, functionName) {
        if (err) {
            throw new Error(`ZMaisonEDT ${functionName} SQL : \n${err}`);
        }
    }
}