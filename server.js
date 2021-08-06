const express = require("express");
const http = require("http");
//const socketIo = require("socket.io");
var cors = require("cors");
let scoreList = [];
// use it before all route definitions

const port = process.env.PORT || 4001;
//const index = require("./routes/index");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

//const io = socketIo(server);

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  //interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = (socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

const getAllScore = (socket) => {
  const response = scoreList;
  socket.emit("AllScore", response);
};

const pushStart = (socket) => {
  const response = true;
  socket.emit("Start", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/", (req, res) => {
  res.send({ response: "re" }).status(200);
  var socket = req.app.get("io");
  getApiAndEmit(socket);
});

app.get("/start", (req, res) => {
  res.send({ response: "start" }).status(200);
  var socket = req.app.get("io");
  pushStart(socket);
});

const updateScore = (scoreList, username, newScore) => {
  return [
    ...scoreList.filter((c) => c.username != username),
    { username: username, score: newScore },
  ];
};

app.get("/update", function (req, res) {
  const query = req.query; // query = {sex:"female"}

  const params = req.params; //params = {id:"000000"}
  console.log(query);
  const { score, username } = query;
  scoreList = updateScore(scoreList, username, score);
  console.log(scoreList);
  var socket = req.app.get("io");
  getAllScore(socket);
  res.send({ response: "re" }).status(200);
});
