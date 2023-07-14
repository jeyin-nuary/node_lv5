const UsersService = require("../services/users.service");

class UsersController {
    // 보내줄 친구
    usersService = new UsersService();
    // 정보 교환, 에러
    signupUser = async (req, res) => {
        try {
            const { nickname, password, confirmPassword } = req.body;
            const user = await this.usersService.signup(nickname, password, confirmPassword);

            res.json(user);
        } catch (error) {
            console.error(error);

        }
    }
}





module.exports = UsersController;