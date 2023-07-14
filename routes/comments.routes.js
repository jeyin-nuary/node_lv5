const express = require("express");
// Op: sequelize 안의 op라는 모듈을 가져다 쓰려고 함
const { Op } = require("sequelize");
const { Posts, Users, Comments } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();


// 댓글 생성 api
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;
        const { userId } = res.locals.user;
        const post = await Posts.findOne({ where: { postId } }); // params로 받아온 postId를 기준으로 게시물의 존재 여부를 확인
        if (!content) {
            return res.status(400).json({ errorMessage: '댓글을 입력해주세요.' });
        }

        if (!post) {
            return res.status(404).json({ errorMessage: '어라? 게시물이 없네요?' });
        }
        await Comments.create({
            UserId: userId,
            PostId: postId,
            content
        })
        res.status(200).json({ message: '얍! 댓글이 생성되었어요!' });

    } catch (error) {
        res.status(500).json({ errorMessage: '댓글 생성에 실패했습니다.' });
    }
})

// 댓글 목록 조회 api
router.get("/posts/:postId/comments", authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Posts.findOne({ where: { postId } });
        const comments = await Comments.findAll({
            where: { postId },
            include: { model: Users, attributes: ["nickname"] },
            attributes: ["commentId", "content", "createdAt", "updatedAt"],
            order: [["createdAt", "desc"]]
        })

        // 게시글의 존재 여부를 확인합니다.
        if (!post) {
            return res
                .status(404)
                .json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        // 댓글의 존재 여부를 확인합니다.
        if (!comments.length) {
            return res
                .status(404)
                .json({ errorMessage: '댓글이 존재하지 않습니다.' });
        }
        // 데이터 형식 수정..
        const editComments = comments.map((comment) => ({
            commentId: comment.commentId,
            nickname: comment.User.nickname,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        }));
        res.status(200).json({ data: editComments });
    } catch (error) {
        res.status(500).json({ errorMessage: '댓글 조회에 실패했습니다.' });
    }
})

// 댓글 수정 api
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId, commentId } = req.params;
        const { content } = req.body;
        const post = await Posts.findOne({ where: { postId } });
        if (!post) {
            return res
                .status(404)
                .json({ errorMessage: '게시글을 찾을 수 없습니다.' });
        }
        const comment = await Comments.findOne({ where: { commentId } });
        if (!comment) {
            return res
                .status(404)
                .json({ errorMessage: '코멘트를 찾을 수 없습니다.' });
        }
        if (userId !== comment.UserId) {
            return res
                .status(400)
                .json({ errorMessage: '본인이 작성한 댓글만 수정할 수 있습니다.' });
        }
        if (!content) {
            return res.status(404).json({ errorMessage: '코멘트를 입력해주세요.' });
        }
        await comment.update({ content });
        res.status(200).json({ message: '댓글을 수정하였습니다.' });

    } catch (error) {
        res.status(500).json({ errorMessage: '댓글 수정에 실패했습니다.' });


    }
})

// 댓글 삭제 api
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId, commentId } = req.params;
        const post = await Posts.findOne({ where: { postId } });
        if (!post) {
            return res
                .status(404)
                .json({ errorMessage: '게시글을 찾을 수 없습니다.' });
        }
        const comment = await Comments.findOne({ where: { commentId } });
        if (!comment) {
            return res
                .status(404)
                .json({ errorMessage: '코멘트를 찾을 수 없습니다.' });
        }
        if (userId !== comment.UserId) {
            return res
                .status(400)
                .json({ errorMessage: '본인이 작성한 댓글만 삭제할 수 있습니다.' });
        }

        await Comments.destroy({
            where: {
                [Op.and]: [
                    { commentId },
                    { UserId: userId },
                ],
            },
        });
        res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
        res.status(500).json({ errorMessage: '댓글 삭제에 실패했습니다.' });
    }
})







































module.exports = router;