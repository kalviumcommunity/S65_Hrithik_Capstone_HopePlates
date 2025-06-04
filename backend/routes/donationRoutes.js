const express = require("express")
const multer = require("multer")
const Donation = require("../models/Donation")
const {
    createDonation,
    getAllDonations,
    getDonationById,
    updateDonationStatus,
    deleteDonation,
    getDonationCountByUser
} = require("../Controllers/donationController")
const { protect } = require("../middlewares/authMiddleware")

const router = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/donation_images/")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})
const upload = multer({ storage })

router.get("/history", protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const donations = await Donation.find({
            status: "claimed",
            $or: [
                { donor: userId },
                { claimedBy: userId }
            ]
        })
        .populate("donor", "name")
        .populate("claimedBy", "name");
        res.json(donations);
    } catch (err) {
        console.error("Donation history error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/", protect, upload.array("images", 5), createDonation)
router.get("/", protect, getAllDonations)
router.get("/count/:userId", getDonationCountByUser)
router.get("/:id", protect, getDonationById)
router.put("/:id/status", protect, updateDonationStatus)
router.delete("/:id", protect, deleteDonation)

module.exports = router