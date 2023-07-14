const LikeRepository = require('../repositories/likes.repository');

class LikeService {
    likeRepository = new LikeRepository();

    findAllLike = async () => {
        const allLike = await this.likeRepository.findAllLike();

        allLike.sort((a, b) => {
            return b.createdAt - a.createdAt;
        });

        return allLike.map((like) => {
            return {

            };
        });
    };

    findLikeById = async (likeId) => {
        const findLike = await this.likeRepository.findLikeById(likeId);

        return {

        };
    };





}
