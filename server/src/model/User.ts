import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  firstName: string;
  lastName: string;
  // add more fields as needed
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: {type: String, required: true, unique: true},
    email: {type: String, required: true},
    displayName: {type: String},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  },
  {timestamps: true}
);

export default mongoose.model<IUser>("User", UserSchema);
