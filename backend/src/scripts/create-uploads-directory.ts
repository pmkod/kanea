import fs from "fs";
import {
  baseFilesDestination,
  discussionFileDestination,
  messageFilesDestination,
  publicFileDestination,
} from "../constants/file-constants";

if (!fs.existsSync(baseFilesDestination)) {
  fs.mkdirSync(baseFilesDestination);
}
if (!fs.existsSync(publicFileDestination)) {
  fs.mkdirSync(publicFileDestination);
}
if (!fs.existsSync(discussionFileDestination)) {
  fs.mkdirSync(discussionFileDestination);
}
if (!fs.existsSync(messageFilesDestination)) {
  fs.mkdirSync(messageFilesDestination);
}
process.exit(0);
