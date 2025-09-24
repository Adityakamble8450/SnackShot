import foodModel from "../model/food.model.js"
import {likeModel} from "../model/likes.model.js"
import { saveModel } from "../model/save.model.js"
import { uploadFile } from "../services/storage.services.js"
import { v4 as uuidv4 } from "uuid"



export const createFood = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "videoFile is required" })
        }
        // Validate file type
        const mime = req.file.mimetype
        const allowed = ["video/mp4", "video/quicktime"]
        if (!allowed.includes(mime)) {
            return res.status(400).json({ message: "Invalid file format. Only MP4/MOV allowed" })
        }

        const description = (req.body.description || '').toString().trim()
        if (!description) {
            return res.status(400).json({ message: "description is required" })
        }
        if (description.length > 200) {
            return res.status(400).json({ message: "description exceeds 200 characters" })
        }

        const uploaded = await uploadFile(req.file.buffer, uuidv4())

        const foodItem = await foodModel.create({
            name: req.foodPartner.name,
            description,
            video: uploaded.url,
            foodPartner: req.foodPartner._id
        })

        return res.status(201).json({
            message: "Video uploaded successfully",
            data: {
                id: foodItem._id,
                videoUrl: foodItem.video,
                description: foodItem.description,
                food_partner_id: foodItem.foodPartner,
                uploaded_at: foodItem.createdAt
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getFoodItems = async (req , res) =>{
    try {
        const foodItems = await foodModel.find({}).populate('foodPartner', 'name email')
        res.status(200).json({
            message : "food items fetch successfully", 
            data: foodItems
        })
    } catch (error) {
        res.status(500).json({
            message: "Error fetching food items"
        })
    }
}

export const likes = async (req, res) => {
    try {
        const { foodId } = req.body;
        const subjectId = req.user?._id || req.foodPartner?._id;

        if (!foodId) {
            return res.status(400).json({ message: "foodId is required" });
        }

        // Check if the user has already liked this food item
        const isAlreadyLiked = await likeModel.findOne({
            user: subjectId,
            food: foodId
        });

        if (isAlreadyLiked) {
            // Unlike: remove like and decrement count
            await likeModel.deleteOne({
                user: subjectId,
                food: foodId
            });

            const updated = await foodModel.findByIdAndUpdate(
                foodId,
                { $inc: { count: -1 } },
                { new: true }
            );

            return res.status(200).json({ message: "Food unliked successfully", liked: false, count: updated?.count ?? 0 });
        }

        // Like: create like and increment count
        const like = await likeModel.create({
            user: subjectId,
            food: foodId
        });

        const updated = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { count: 1 } },
            { new: true }
        );

        return res.status(201).json({ message: "Food liked successfully", liked: true, count: updated?.count ?? 0, like });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const save = async (req , res) =>{
    try {
        const { foodId } = req.body;
        const subjectId = req.user?._id || req.foodPartner?._id;
        if (!foodId) {
            return res.status(400).json({ message: "foodId is required" });
        }

        const isAlreadySaved = await saveModel.findOne({
            user: subjectId,
            food: foodId
        })

        if (isAlreadySaved) {
            await saveModel.deleteOne({ user: subjectId, food: foodId })
            return res.status(200).json({ message: "Post unsaved successfully", saved: false })
        }

        await saveModel.create({ user: subjectId, food: foodId })
        return res.status(201).json({ message: "Saved successfully", saved: true })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const likeStatus = async (req, res) => {
    try {
        const { foodIds } = req.body;
        const subjectId = req.user?._id || req.foodPartner?._id;
        if (!Array.isArray(foodIds)) {
            return res.status(400).json({ message: "foodIds must be an array" })
        }
        const likes = await likeModel.find({ user: subjectId, food: { $in: foodIds } }).select('food')
        const status = {}
        for (const id of foodIds) status[id] = false
        likes.forEach(l => { status[l.food.toString()] = true })
        return res.status(200).json({ status })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const saveStatus = async (req, res) => {
    try {
        const { foodIds } = req.body;
        const subjectId = req.user?._id || req.foodPartner?._id;
        if (!Array.isArray(foodIds)) {
            return res.status(400).json({ message: "foodIds must be an array" })
        }
        const saves = await saveModel.find({ user: subjectId, food: { $in: foodIds } }).select('food')
        const status = {}
        for (const id of foodIds) status[id] = false
        saves.forEach(s => { status[s.food.toString()] = true })
        return res.status(200).json({ status })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getSavedReels = async (req, res) => {
    try {
        const subjectId = req.user?._id || req.foodPartner?._id;
        const saved = await saveModel.find({ user: subjectId }).populate('food')
        const reels = saved.map(s => s.food).filter(Boolean)
        return res.status(200).json({ data: reels })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' })
    }
}

