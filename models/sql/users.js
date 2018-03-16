module.exports = (database, DataTypes) => {
    return database.define("users", {
        username: DataTypes.STRING,
        password: DataTypes.STRING,
    })
};