const { Users } = require("../models");

class UsersRepository {
    // 받아옴 서비스에서
    createOne = async (nickname, password) => {
        return await Users.create({ nickname, password });
    }
}
module.exports = UsersRepository; 