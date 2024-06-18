import { Schema } from "mongoose";
import { mongoDbTypes } from "./mongodb-types";
import { searchModelName, userModelName } from "./model-names";
import { model } from "mongoose";

const searchSchema = new Schema({
  searchedUserId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
  },
  searcherId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

searchSchema.virtual("searcher", {
  ref: userModelName,
  localField: "searcherId",
  foreignField: "_id",
  justOne: true,
});

searchSchema.virtual("searchedUser", {
  ref: userModelName,
  localField: "searchedUserId",
  foreignField: "_id",
  justOne: true,
});

searchSchema.set("toJSON", {
  virtuals: true,
});

searchSchema.set("toObject", {
  virtuals: true,
});

const SearchModel = model(searchModelName, searchSchema);

export default SearchModel;
