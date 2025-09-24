import foodPartnerModel from "../model/foodPartner.model.js";
import foodModel from "../model/food.model.js";

export const getFoodPartnerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get food partner details
        const foodPartner = await foodPartnerModel.findById(id);
        
        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        // Get all videos/food items for this food partner
        const videos = await foodModel.find({ foodPartner: id })
            .populate('foodPartner', 'name email address cuisineType')
            .sort({ createdAt: -1 }); // Sort by newest first

        // Calculate total meals served (assuming each video represents meals served)
        const totalMealsServed = videos.length * 50; // Assuming 50 meals per video on average

        // Transform videos data to match frontend expectations
        const transformedVideos = videos.map((video, index) => ({
            id: video._id,
            thumbnail: video.video, // Using video URL as thumbnail for now
            views: Math.floor(Math.random() * 20000) + 1000, // Mock views count
            likes: Math.floor(Math.random() * 2000) + 100, // Mock likes count
            title: video.name,
            description: video.description,
            createdAt: video.createdAt
        }));

        // Prepare response data
        const profileData = {
            name: foodPartner.name,
            address: foodPartner.address,
            email: foodPartner.email,
            phone: foodPartner.phone,
            cuisineType: foodPartner.cuisineType,
            totalMealsServed: totalMealsServed,
            profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(foodPartner.name)}&background=ff6b35&color=fff&size=150`,
            videos: transformedVideos,
            totalVideos: videos.length
        };

        res.status(200).json({ 
            message: "Food partner profile fetched successfully",
            data: profileData 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
