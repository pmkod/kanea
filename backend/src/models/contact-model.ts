import * as mongoose from "mongoose";
import { contactModelName } from "./model-names";

const mongodbTypes = mongoose.Schema.Types;

export interface Contact {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const contactSchema = new mongoose.Schema<Contact>({
  name: {
    type: mongodbTypes.String,
  },
  email: {
    type: mongodbTypes.String,
  },
  message: {
    type: mongodbTypes.String,
  },
  createdAt: {
    type: mongodbTypes.Date,
    default: Date.now,
  },
});

contactSchema.set("toObject", { virtuals: true });
contactSchema.set("toJSON", { virtuals: true });

const ContactModel = mongoose.model<Contact>(contactModelName, contactSchema);

export default ContactModel;
