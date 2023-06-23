module.exports = {
    NowDateSQL: function () {
        return new Date().toISOString().substring(0, 10);
    }
}