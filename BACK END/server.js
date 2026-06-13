//middleware



const {
verifyToken
}=require(
"./middleware/authMiddleware"
);

const {
allowRoles
}=require(
"./middleware/roleMiddleware"
);

const express = require("express");
const cors = require('cors'); //ADDED FROM CONSOLE ACCESS HELP TAB IN CHATGPT
const db = require("./db");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

//connect routes to server.js

const authRoutes =
require("./routes/authRoutes");

const eventRoutes=
require(
"./routes/eventRoutes"
);

const organizationRoutes =
require("./routes/organizationRoutes");

const announcementRoutes =
require("./routes/announcementRoutes");

const userRoutes =
require("./routes/userRoutes");

app.use(
"/api/auth",
authRoutes
);

app.use(
"/api/organizations",
organizationRoutes
);

app.use(
"/api/announcements",
announcementRoutes
);

app.use(
"/api/users",
userRoutes
);

app.use(

"/api/events",





eventRoutes

);

console.log("PORT VALUE =", process.env.PORT);

// TEST ROUTE
app.get("/whoami", (req, res) => {
  res.json({ server: "BACKEND-5000-ORGHUB" });
});

// TEST API
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working" });
});

// DB TEST
app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS test");

    res.json({
      message: "Database Connected",
      result: rows
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Database Failed" });
  }
});


app.get(

"/student-area",

verifyToken,

(req,res)=>{

res.json({

message:
"Student Access"

});

}

);


app.get(

"/admin-area",

verifyToken,

allowRoles("admin"),

(req,res)=>{

res.json({

message:
"Admin Access"

});

}

);


app.get(

"/create-event",

verifyToken,

allowRoles(
"officer",
"admin"
),

(req,res)=>{

res.json({

message:
"Can Create Event"

});

}

);




// SERVER
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// DASHBOARD

app.get(
"/api/admin/organization-categories",

verifyToken,

allowRoles("admin"),

async(req,res)=>{

try{

const [rows] =
await db.query(
`
SELECT
category,
COUNT(*) AS total
FROM organizations
GROUP BY category
ORDER BY total DESC
`
);

res.json(rows);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed loading organization categories"
});

}

}
);

app.get(

"/api/dashboard",

async(req,res)=>{

try{

const [[orgs]]=
await db.query(

"SELECT COUNT(*) AS total FROM organizations"

);

const [[events]]=
await db.query(

"SELECT COUNT(*) AS total FROM events"

);

res.json({

organizations:
orgs.total,

events:
events.total

});

}

catch(error){

res.status(500).json({

error:"Dashboard failed"

});

}

}

);