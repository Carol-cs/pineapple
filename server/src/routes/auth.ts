import {Router, Request, Response} from "express";
import admin from "../config/firebase";
import User, {IUser} from "../model/User";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

// POST /api/auth
router.post("/", async (req: Request, res: Response) => {
  const {uid, firstname, lastname} = req.body;

  if (!uid || !firstname || !lastname) {
    return res.status(400).json({message: "UID, first name, and last name are required"});
  }

  try {
    // // Verify Firebase ID token
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // const {uid, email, name} = decodedToken;

    const firebaseUser = await admin.auth().getUser(uid);
    const {uid: firebaseUid, email, displayName: name} = firebaseUser;

    // Check if user exists in MongoDB, else create one
    let user: IUser | null = await User.findOne({firebaseUid: firebaseUid});
    console.log("User:", user);
    if (!user) {
      user = new User({
        firebaseUid: firebaseUid,
        email: email,
        firstName: firstname,
        lastName: lastname,
        displayName: name || ""
      });
      await user.save();
    }

    res.status(200).json({message: "Authentication successful", user});
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({message: "Invalid token", error});
  }
});

export default router;
