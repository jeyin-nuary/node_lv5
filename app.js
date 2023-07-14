const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

// index.router에 옮겨두어서
const indexRouter = require("./routes/index");


app.use(express.json());
app.use(cookieParser());
// cookieParser 다음에: 쿠키,데이터 파싱 후
app.use("/api", indexRouter);


app.listen(port, () => {
    console.log(port, "포트로 서버가 열렸습니다.");
});