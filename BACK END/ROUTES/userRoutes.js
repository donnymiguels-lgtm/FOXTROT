const express =
require("express");

const router =
express.Router();

const {
verifyToken
} =
require("../middleware/authMiddleware");

const {
allowRoles
} =
require("../middleware/roleMiddleware");

const {
getUsers,
updateUserRole
} =
require("../controllers/userController");

router.get(
"/",
verifyToken,
allowRoles("admin"),
getUsers
);

router.put(
"/:id/role",
verifyToken,
allowRoles("admin"),
updateUserRole
);

module.exports =
router;