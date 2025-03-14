// src/routes/team.ts
import {Router, Request, Response} from "express";
import Team from "../model/Team";
import admin from "../config/firebase";
import User, {IUser} from "../model/User";
import {Schema} from "mongoose";

const router = Router();

// Create a new team
// POST /api/teams
router.post("/", async (req: Request, res: Response) => {
  try {
    const {name, adminUid} = req.body;
    if (!name || !adminUid) {
      return res.status(400).json({message: "Name and admin are required."});
    }

    // find admin._id based on adminUid
    const adminUser = await User.findOne({firebaseUid: adminUid});
    if (!adminUser) return res.status(404).json({message: "Admin not found"});

    // Create the team and add the admin as the first member
    const team = new Team({
      name,
      adminId: adminUser._id,
      memberIds: [adminUser._id]
    });
    await team.save();

    // The join token is the team's _id (auto-generated)
    res.status(201).json({team, joinToken: team._id});
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({message: "Error creating team"});
  }
});

// Update a team name (only allowed for authorized users, e.g. admin)
// PUT /api/teams/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const {uid} = req.body;
    if (!uid) return res.status(400).json({message: "User ID is required"});
    const firebaseUser = await admin.auth().getUser(uid);
    const {uid: firebaseUid} = firebaseUser;

    // Get user from MongoDB to check if they are the admin
    let user: IUser | null = await User.findOne({firebaseUid: firebaseUid});
    if (!user) return res.status(404).json({message: "User not found"});

    // Check if user is the admin of the team
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({message: "Team not found"});
    if (team.adminId.toString() !== uid.toString()) {
      return res.status(403).json({message: "Unauthorized"});
    }

    await team.save();
    res.json({team});
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({message: "Error updating team"});
  }
});

// Delete a team (only allowed for authorized users, e.g. admin)
// DELETE /api/teams/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({message: "Team not found"});
    res.json({message: "Team deleted successfully"});
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({message: "Error deleting team"});
  }
});

// Join a team using the join token
// POST /api/teams/join
router.post("/join", async (req: Request, res: Response) => {
  try {
    const {joinToken, uid} = req.body;
    if (!joinToken || !uid) {
      return res.status(400).json({message: "joinToken and uid are required"});
    }

    // Find the team by its id (join token)
    const team = await Team.findById(joinToken);
    if (!team) return res.status(404).json({message: "Team not found"});

    // Find the user by their firebaseUid
    const user: IUser | null = await User.findOne({firebaseUid: uid});
    if (!user) return res.status(404).json({message: "User not found"});

    const userId = user._id as Schema.Types.ObjectId;

    // Check if user is already a member (compare string values)
    if (!team.memberIds.some((memberId) => memberId.toString() == userId.toString())) {
      team.memberIds.push(userId);
      await team.save();
    } else {
      return res.status(400).json({message: "User is already a member"});
    }

    res.json({team});
  } catch (error) {
    console.error("Error joining team:", error);
    res.status(500).json({message: "Error joining team"});
  }
});

// get all users in a team
// GET /api/teams/:id/users
router.get("/:id/users", async (req: Request, res: Response) => {
  try {
    // TODO: protect this route with authentication

    const team = await Team.findById(req.params.id).populate("memberIds");
    if (!team) return res.status(404).json({message: "Team not found"});
    res.json({users: team.memberIds});
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({message: "Error getting users"});
  }
});

export default router;
