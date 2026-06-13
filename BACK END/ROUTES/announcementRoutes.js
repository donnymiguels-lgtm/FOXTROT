const express =
require("express");

const router =
express.Router();

const {
createAnnouncement,
getMyAnnouncements,
getOrganizationAnnouncements,
deleteAnnouncement


}=require(
"../controllers/announcementController"
);

const {
verifyToken
}=require(
"../middleware/authMiddleware"
);

router.post(
"/",
verifyToken,
createAnnouncement
);

router.get(
"/my-orgs",
verifyToken,
getMyAnnouncements
);

router.get(

"/organization/:id",

verifyToken,

getOrganizationAnnouncements

);

router.delete(

"/:id",

verifyToken,

deleteAnnouncement

);

module.exports =
router;