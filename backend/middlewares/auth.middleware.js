import foodPartner from "../model/foodPartner.model.js";
import userModel from "../model/user.model.js"
import jwt from "jsonwebtoken";


export const foodAuthmiddleware = async (req, res, next) => {
    // Check if token exists in cookies
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Please log in first" }); // 401 Unauthorized for missing token
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the food partner by ID from the token payload
        const partner = await foodPartner.findById(decoded.id);

        if (!partner) {
            // If not a partner, check if it's a normal user and forbid
            const user = await userModel.findById(decoded.id);
            if (user) {
                return res.status(403).json({ message: "Only food partners can perform this action" });
            }
            // Neither partner nor user — token valid but subject not found
            return res.status(401).json({ message: "Food partner not found" });
        }

        // Attach the food partner object to the request
        req.foodPartner = partner;
        next(); // Proceed to the next middleware/route handler

    } catch (error) {
        // Handle token verification errors (e.g., invalid token, expired token)
        
        return res.status(401).json({
            message: "Invalid or expired token. Please log in again." // More specific error message
        });
    }
};

export const userAuthMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        
        return res.status(401).json({
            message: "Invalid or expired token. Please log in again."
        });
    }
}

export const anyUserAuthMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try to find user first
        const user = await userModel.findById(decoded.id);
        if (user) {
            req.user = user;
            req.userType = 'normal_user';
            return next();
        }

        // If not a user, try food partner
        const partner = await foodPartner.findById(decoded.id);
        if (partner) {
            req.foodPartner = partner;
            req.userType = 'food_partner';
            return next();
        }

        return res.status(401).json({ message: "Account not found" });
    } catch (error) {
        
        return res.status(401).json({
            message: "Invalid or expired token. Please log in again."
        });
    }
}
