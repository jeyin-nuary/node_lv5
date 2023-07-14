const express = require("express");
// Op: sequelize 안의 op라는 모듈을 가져다 쓰려고 함
const { Op } = require("sequelize");
const { Posts, Users, Likes } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();


// 좋아요 등록, 취소 API
router.put('/posts/:postId/like', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const likes = await Likes.findOne({ // 사용자가 좋아요를 눌렀었는지 확인
        where: {
            //[Op.and]: [{a: 5}, {b: 6}]  (a = 5) AND (b = 6)
            // [Op.or]: [{a: 5}, {a: 6}]  (a = 5 OR a = 6)
            [Op.and]: [{ UserId: userId }, { PostId: postId }],
        },
    });
    try {
        if (!likes) {
            Likes.create({
                UserId: userId,
                PostId: postId
            })
            return res
                .status(200)
                .json({ errorMessage: '좋아요 등록에 성공했습니다.' });
        }

    } catch (error) {
        res.status(500).json({ errorMessage: '좋아요 등록에 실패했습니다.' });
    }

    try {
        if (likes) {
            Likes.destroy({
                where: {
                    [Op.and]: [{ PostId: postId }, { UserId: userId }],
                },
            })
            return res
                .status(200)
                .json({ errorMessage: '좋아요 취소에 성공했습니다.' });
        }
    } catch (error) {
        res.status(500).json({ errorMessage: '좋아요 취소에 실패했습니다.' });
    }
})

// 좋아요를 등록한 게시글 목록 조회 api
router.get('/likes', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const likes = await Likes.findAll({
            where: { UserId: userId }, // 유저테이블 포스트테이블 
            include: [
                {
                    model: Users,
                    attributes: ['nickname'], // Users의 닉네임을 가져옴
                },
                {
                    model: Posts,
                    // Posts에서 'title', 'content', 'createdAt', 'updatedAt'을 가져옴
                    attributes: ['title', 'content', 'createdAt', 'updatedAt'],
                },
            ],
            order: [['createdAt', 'desc']],
        });
        if (!likes.length) {
            return res
                .status(404)
                .json({ errorMessage: '좋아요를 등록한 게시글이 존재하지 않습니다.' });
        }
        const editLikes = await Promise.all(
            likes.map(async (like) => {
                const postId = like.PostId;
                const postLikes = await Likes.count({ where: { PostId: postId } });
                return {
                    postId,
                    likeUserId: like.UserId,
                    likeNickname: like.User.nickname,
                    title: like.Post.title,
                    createdAt: like.Post.createdAt,
                    updatedAt: like.Post.updatedAt,
                    likes: postLikes
                };
            })
        );
        const sortedLikes = editLikes.sort((a, b) => b.postLikes - a.postLikes);
        res.status(200).json({ data: sortedLikes });
    } catch (error) {
        res.status(500).json({ errorMessage: '좋아요 조회에 실패했습니다.' });
    }
});
























module.exports = router;