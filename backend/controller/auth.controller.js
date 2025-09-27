import User from "../model/user.model.js";
import foodPartner from "../model/foodPartner.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import foodPartner from "../model/foodPartner.model.js";

export const register = async (req, res) => {
    try {
        const { name, email, password , phone } = req.body;
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({
                message: "User already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword , phone
        })

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // 🔥 important
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
          
        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                user: user,
                email: email
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Error creating user"
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Ensure password exists in DB
        if (!user.password) {
            return res.status(500).json({ message: "Password not set for this user" });
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password or email" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // 🔥 important
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
          

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error during login" });
    }
};
export const logout = async (req, res) => {
    res.cookie("token", "", { httpOnly: true, secure: true, maxAge: 0 })
    res.status(200).json({ message: "User logged out successfully" })
    res.redirect("/")
}
export const registerFoodPartner = async (req, res) => {
    try {
        const { name, email, password , phone , address , cuisineType } = req.body;

        // Check if food partner already exists
        const foodPartnerAlreadyexist = await foodPartner.findOne({ email });
        if (foodPartnerAlreadyexist) {
            return res.status(400).json({
                message: "Food partner already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newFoodPartner = await foodPartner.create({
            name,
            email,
            password: hashedPassword ,
            phone ,
            address ,
            cuisineType
        });

        const token = jwt.sign(
            { id: newFoodPartner._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure only in production for consistency
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        });
        res.status(201).json({
            message: "Food partner created successfully",
            _id: newFoodPartner._id,
            name: newFoodPartner.name,
            email: newFoodPartner.email
        });
    } catch (error) {
        res.status(500).json({ message: "Error during food partner registration" });
    }
};


export const loginFoodPartner = async (req, res) => {

    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({
                massage: "email or password is requared"
            })
        }

        const partner = await foodPartner.findOne({ email })
        if (!partner) {
            return res.status(400).json({ massage: "user not found" })
        }

        if (!partner.password) {
            return res.status(400).json({ massage: "password is not set for this" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, partner.password)
        if (!isPasswordCorrect) {
            res.status(400).json({ massge: "invalid password or email" })
        }

        const token = jwt.sign({
            id: partner._id
        }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // 🔥 important
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
          

        res.status(200).json({
            massage: "partern login succesfully",
            name: partner.name,
            email: partner.email
        })

    } catch (error) {
        res.status(500).json({
            massage: "Error during login"
        })
    }
}

export const logoutFoodPartner = async (req  , res) =>{
    res.cookie("token" , "" , {httpOnly : true , secure : true , maxAge : 0})
    res.status(200).json({
        massage : "foodPartner logout succesfully"
    })
    res.redirect("/")
}



export const me = async (req, res) => {
    try {
        const token = req.cookies.token
        if (!token) return res.status(401).json({ message: "Not authenticated" })
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('_id name email')
        if (user) {
            return res.status(200).json({ role: 'normal_user', user })
        }
        const partner = await foodPartner.findById(decoded.id).select('_id name email')
        if (partner) {
            return res.status(200).json({ role: 'food_partner', user: partner })
        }
        return res.status(401).json({ message: "Account not found" })
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" })
    }
}