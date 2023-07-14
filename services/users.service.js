const UsersRepository = require("../repositories/users.repository");

class UsersService {
    usersRepository = new UsersRepository();
    signup = async (nickname, password, confirmPassword) => {

        // 레포지로 넘겨줌
        const user = await this.usersRepository.createOne(nickname, password);
        // this : 스코프 내에 있는 걸 가져올 때
        //숫자는 그대로 보내면 오류남. 객체형태로 ({}) 보내줌
        // 유효성 검사

        return user
    }
}







module.exports = UsersService;


