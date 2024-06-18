import { FastifyReply, FastifyRequest } from "fastify";
import { BlockModel } from "../models/block-model";
import { paginationQueryParamsValidator } from "../validators/shared-validators";

export const getBlocks = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = await paginationQueryParamsValidator.validate(request.query);

  const userId = request.session.userId;
  const page = query.page || 1;
  const limit = query.limit || 10;

  const startIndex = (page - 1) * limit;

  const blocks = await BlockModel.find({
    blockerId: userId,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select(["id", "blockedId"])
    .populate({
      path: "blocked",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .skip(startIndex)
    .sort({ createdAt: "desc" })
    .limit(limit + 1);

  const nextPage = blocks.length > limit ? page + 1 : undefined;

  if (nextPage) {
    blocks.pop();
  }

  reply.send({ blocks });
};
