const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { Users } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const bcrypt = require("bcrypt");
const saltRounds = 10

//회원가입 api
router.post("/signup", async (req, res) => {
    try {
        const { nickname, password, confirmPassword } = req.body;
        //중복되는 닉네임을 찾는다
        const duplicateNickname = await Users.findOne({ where: { nickname: nickname } }); //nickname이 같아 생략할 수 있다.

        if (duplicateNickname) {
            return res.status(400).json({ errorMessage: "이미 사용중인 닉네임입니다." });
        }
        // 정규 표현식을 사용해서 닉네임이 영어와 숫자로 이루어 졌는지 검사 합니다.
        if (!nickname.match(/^[a-zA-Z0-9]{3,50}$/)) {
            // 에러 메시지를 응답합니다.
            return res.status(400).json({
                error: '닉네임은 영어나 숫자로만 이루어지게 작성해 주세요.',
            });
        }
        // 패스워드 유효성 검사
        if (password.length < 4) {
            return res.status(400).json({
                // 에러 메시지를 응답합니다.
                error: '패스워드를 4글자 이상 작성해 주세요.',
            });
        }
        if (password.includes(nickname)) {
            return res.status(400).json({
                // 에러 메시지를 응답합니다.
                error: '닉네임이 패스워드에 포함될 수 없습니다.',
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                // 에러 메시지를 응답합니다.
                error: '패스워드와 전달된 패스워드 확인값이 일치하지 않습니다.',
            });
        }


        // 비밀번호 암호화
        const EncryptionPW = bcrypt.hashSync(password, saltRounds);

        // 닉네임, 패스워드를 DB에 저장합니다.
        await Users.create({
            password: EncryptionPW,
            nickname,
        });
        // 성공 메시지 출력
        res.status(202).json({ message: '회원가입에 성공했습니다.' });

    } catch (error) {
        res.status(500).json({ errorMessage: '회원가입에 실패했습니다.' });
    }
});


//로그인 api
router.post("/login", async (req, res) => {
    const { nickname, password } = req.body;
    const user = await Users.findOne({
        where: { nickname }
    });
    //암호화된 두가지 비교 compareSync (method)
    const same = bcrypt.compareSync(password, user.password);
    console.log(same); //true
    console.log(user.password); // 


    if (!user) {
        return res.status(401).json({ message: "해당하는 사용자가 존재하지 않습니다." });
    } else if (!same) { //복호화를 풀던지 or 암호화를 하던지?
        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }
    const token = jwt.sign( //토큰 암호화
        { userId: user.userId }, //user_id를 user의 user_id로 할당?
        "customized_secret_key"); //암호화 키

    // 쿠키 발급
    res.cookie("Authorization", `Bearer ${token}`); //유효한 토큰인지 유효성 검사
    // response 할당
    return res.status(200).json({ message: "로그인에 성공하였습니다." })
});

router.get("/login", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    console.log(userId);
    const user = await Users.findOne({
        where: { userId }
    });

    res.status(200).json({ data: user });
});

module.exports = router;
