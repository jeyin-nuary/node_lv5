const CommentRepository = require('../repositories/comments.repository');

class CommentService {
    commentRepository = new CommentRepository();

    findAllComment = async () => {
        const allComment = await this.commentRepository.findAllComment();

        allComment.sort((a, b) => {
            return b.createdAt - a.createdAt;

        });

        return allComment.map((comment) => {
            return {

            };
        });
    };

    findCommentById = async (commentId) => {
        const findLike = await this.likeRepository.findLikeById(likeId);

        return {

        };
    };




}

