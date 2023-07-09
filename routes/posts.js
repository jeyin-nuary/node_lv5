const express = require("express");
// Op: sequelize 안의 op라는 모듈을 가져다 쓰려고 함
const { Op } = require("sequelize");
const { Posts, Users } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

//게시글 작성 api - 로그인 한 사용자만 작성할 수 있게 authMiddleware 사용
router.post("/posts", authMiddleware, async (req, res) => {
    //게시글을 생성하는 사용자의 정보를 가지고 올 것
    try {
        const { userId } = res.locals.user;
        const { title, content } = req.body;

        // body로 가져온 데이터가 존재하지 않을 경우
        if (!title || !content) {
            return res
                .status(400)
                .json({ errorMessage: '제목이나 본문을 입력해주세요.' });
        }
        // 새로운 게시물을 생성합니다.
        await Posts.create({
            UserId: userId,
            title,
            content
        });
        // 확인 메시지를 응답합니다.
        return res.status(201).json({ message: '게시물을 생성하였습니다.' });
    } catch (error) {
        // 에러 메시지를 응답합니다.
        console.error(error)
        res.status(500).json({ errorMessage: '게시물 작성에 실패했습니다.' });
    }
});

//전체 게시글 조회
router.get('/posts', async (req, res) => {
    try {
        const posts = await Posts.findAll({
            order: [['createdAt', 'desc']], //작성날짜 기준으로 내림차순 정렬
        });

        //게시물의 존재 여부를 확인합니다.
        if (!posts) {
            res.status(404).json({ errorMessage: '존재하는 게시물이 없습니다.' });
            return;
        }
        //조회한 게시물들을 응답합니다.
        res.json({ data: posts });
    } catch (error) {
        //오류가 발생한 경우 오류 메시지를 응답합니다.
        res.status(500).json({ errorMessage: '게시물 조회에 실패했습니다.' });
    }
});

// 게시글 상세조회 api
router.get('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Posts.findOne({ where: { postId } });

        if (!post) {
            //게시물이 존재하지 않을 경우
            return res
                .status(404)
                .json({ errorMessage: '해당 게시물이 존재하지 않습니다.' });
        }
        res.status(200).json({ data: post });
    } catch (error) {
        //오류가 발생한 경우 오류 메시지를 응답합니다.
        res.status(500).json({ errorMessage: '게시물 상세조회에 실패했습니다.' });
    }
});

// 게시글 수정 api - 로그인 한 사용자가 본인 게시글만 수정할 수 있게 구현했습니다. patch:부분수정
router.patch('/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const { postId } = req.params;
        const { userId } = res.locals.user;

        const post = await Posts.findOne({ where: { postId } });

        // 본인이 작성한 게시글인지 확인합니다.
        if (post.UserId !== userId) {
            return res
                .status(403)
                .json({ errorMessage: '본인이 작성한 게시글만 수정할 수 있습니다.' });
        }
        //수정사항을 업데이트합니다.
        if (title) post.update({ title });
        if (content) post.update({ content });
        // 확인 메시지를 응답합니다.
        return res.status(202).json({ message: '게시물 수정에 성공했습니다.' });
    } catch (error) {
        //에러 메시지를 응답합니다.
        res.status(500).json({ errorMessage: '게시물 수정에 실패했습니다.' });
    }
});

// 게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = res.locals.user;

        const post = await Posts.findOne({ where: { postId } });
        // 해당 게시글이 존재하지 않을 경우
        if (!post) {
            return res
                .status(404)
                .json({ errorMessage: '해당 게시글이 존재하지 않습니다.' });
        }
        // 본인이 작성한 게시글인지 확인합니다.
        if (post.UserId !== userId) {
            return res
                .status(403)
                .json({ errorMessage: '본인이 작성한 게시글만 삭제할 수 있어!' });
        }
        post.destroy({
            [Op.and]: [{ postId: post.postId }, { UserId: post.UserId }]  // Op.and 두 개를 비교한다?
        })

        // 삭제 메시지를 응답합니다.
        return res.status(202).json({ message: '이 게시물은 너굴맨이 처리했다구 > <!' });
    } catch (error) {
        //에러 메시지를 응답합니다.
        res.status(500).json({ errorMessage: '게시물 삭제 실패했어><!.' });
    }
});

module.exports = router;