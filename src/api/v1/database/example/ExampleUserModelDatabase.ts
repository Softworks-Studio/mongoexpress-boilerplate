import mongoose, { Document, Schema, Model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  password: string;
  email: string;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserModel extends Model<IUser> {
  paginate: any;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long'],
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

UserSchema.plugin(paginate);

const User = mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User; 