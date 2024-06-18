import SearchModel from "../models/search-model";
import { idValidator } from "../validators/shared-validators";
import { maximumNumberOfSavedSearchForAnUser } from "../constants/search-constants";
import { FastifyReply, FastifyRequest } from "fastify";

export const getSearchs = async (request: FastifyRequest<{ Params: { searchId: string } }>, reply: FastifyReply) => {
  const loggedInUserId = request.session.userId;

  const searchs = await SearchModel.find({ searcherId: loggedInUserId })
    .select(["id", "searchedUserId"])
    .populate({
      path: "searchedUser",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .limit(maximumNumberOfSavedSearchForAnUser)
    .sort({ createdAt: "desc" });

  reply.send({ searchs });
};

//
//
//
//

export const saveSearch = async (
  request: FastifyRequest<{ Body: { searchedUserId: string } }>,
  reply: FastifyReply
) => {
  const searchedUserId = await idValidator.validate(request.body.searchedUserId);
  const loggedInUserId = request.session.userId;

  await SearchModel.deleteOne({ searchedUserId, searcherId: loggedInUserId });

  const newSearch = await SearchModel.create({ searchedUserId, searcherId: loggedInUserId });

  const searchToSend = await SearchModel.findOne({ _id: newSearch.id })
    .select(["id", "searchedUserId"])
    .populate({
      path: "searchedUser",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    });

  const searchsCount = await SearchModel.countDocuments({ searcherId: loggedInUserId });

  if (searchsCount >= maximumNumberOfSavedSearchForAnUser) {
    await SearchModel.deleteMany({ searcherId: loggedInUserId })
      .skip(maximumNumberOfSavedSearchForAnUser)
      .sort({ createdAt: "desc" });
  }

  reply.send({ search: searchToSend });
};

//
//
//
//
//

export const deleteSearch = async (request: FastifyRequest<{ Params: { searchId: string } }>, reply: FastifyReply) => {
  const searchId = await idValidator.validate(request.params.searchId);
  const loggedInUserId = request.session.userId;
  await SearchModel.deleteOne({ _id: searchId, searcherId: loggedInUserId });
  reply.send({ message: "Success" });
};

//
//
//
//
//

export const deleteSearchs = async (request: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) => {
  const loggedInUserId = request.session.userId;
  await SearchModel.deleteMany({ searcherId: loggedInUserId });
  reply.send({ message: "Success" });
};
