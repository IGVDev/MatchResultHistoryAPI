const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const _ = require("underscore");
const app = express();

const register = require("./Controllers/register");
const signIn = require("./Controllers/signin");
const matchLoad = require("./Controllers/matchload");
const profile = require("./Controllers/profile");
const standings = require("./Controllers/standings");

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
});

// app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json("IT'S ALIVE");
});

app.post("/standings", (req, res) => {
  standings.handleStandingsGet(req, res, db);
});

app.post("/loadusers", (req, res) => {
  let database = req.body.database;
  db.select("hteam", "ateam")
    .from(database)
    .then((data) => {
      let arr = [];
      for (match of data) {
        if (!arr.includes(match.hteam)) {
          arr.push(match.hteam);
        } else if (!arr.includes(match.ateam)) {
          arr.push(match.ateam);
        }
      }
      return arr;
    })
    .then((arr) => {
      res.status(200).json(arr);
    })
    .catch((err) => res.json(err), res.status(400));
});

app.get("/profile/:id", (req, res) => {
  profile.handleProfileGet(req, res, db);
});
app.post("/signin", (req, res) => {
  signIn.handleSignin(req, res, db, bcrypt);
});
app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});
app.post("/matchload", (req, res) => {
  matchLoad.handleMatchLoad(req, res, db);
});
app.post("/admin", (req, res) => {
  if (bcrypt.compareSync(process.env.ADMIN_PASSWORD, req.body.password)) {
    res.status(200);
    res.json("Go right ahead");
  } else {
    res.status(403);
    res.json("F");
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("It is alive!");
});

/*

/profile/:userId --> GET = user

*/
