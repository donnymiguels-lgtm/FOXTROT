const express=require("express");

const router=express.Router();

const {

createOrganization,
approveOrganization,
joinOrganization,
approveMembership,
rejectMembership,
getOrganizations,
getMyOrganizations,
getOrganizationRequests,
getOfficerDashboard,
getMembershipRequests,
getOrganizationMembers,
updateMemberRole,
removeMember,
transferPresident,
getOrganizationDetails,
getMyMembershipRequests,
leaveOrganization,
rejectOrganization

}=require(
"../controllers/organizationController"
);

const {

verifyToken

}=require(
"../middleware/authMiddleware"
);

const {

allowRoles

}=require(
"../middleware/roleMiddleware"
);

router.post(

"/",

verifyToken,

createOrganization

);

router.get(

"/requests",

verifyToken,

allowRoles("admin"),

getOrganizationRequests

);

router.get(

"/my-organizations",

verifyToken,

getMyOrganizations

);

router.get(

"/:id/dashboard",

verifyToken,

getOfficerDashboard

);

router.get(

"/:id/membership-requests",

verifyToken,

getMembershipRequests

);

router.put(

"/membership/:id/approve",

verifyToken,

approveMembership

);

router.put(

"/membership/:id/reject",

verifyToken,

rejectMembership

);

router.put(

"/:id/approve",

verifyToken,

allowRoles("admin"),

approveOrganization

);

router.put(

"/:id/reject",

verifyToken,

allowRoles("admin"),

rejectOrganization

);

router.post(

"/:id/join",

verifyToken,

joinOrganization

);

router.get(

"/:id/members",

verifyToken,

getOrganizationMembers

);

router.put(

"/members/:id/role",

verifyToken,

updateMemberRole

);

router.put(

"/members/:id/transfer-president",

verifyToken,

transferPresident

);

router.delete(

"/members/:id",

verifyToken,

removeMember

);

router.delete(

"/:id/leave",

verifyToken,

leaveOrganization

);

router.get(

"/:id/details",

getOrganizationDetails

);

router.get(

"/my-membership-requests",

verifyToken,

getMyMembershipRequests

);

router.get(

"/",

getOrganizations

);

module.exports=router;