import foodPartnerModel from "../model/foodPartner.model.js";

export const getFoodpartnerId = async (req, res) => {
    try {
        const { id } = req.params;
        const foodPartner = await foodPartnerModel.findById(id);

        if (!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        res.status(200).json({ data: foodPartner });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


