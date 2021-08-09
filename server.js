const express = require("express");
const http = require("http");
//const socketIo = require("socket.io");
var cors = require("cors");
let scoreList = [];
let songList = [];
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
let timeInterval = 0;
let indexInterval = 0;
let solutionInterval = false;
let trueAnswerInterval = "N";
let urlInterval = "PWbi8J1_X5Q";
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

const pushSongList = (socket) => {
  const response = songList;
  socket.emit("SongList", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/", (req, res) => {
  res.send({ response: "re" }).status(200);
  var socket = req.app.get("io");
  getApiAndEmit(socket);
});

const pushIndexInterval = (socket, index) => {
  const response = index;
  socket.emit("IndexInterval", response);
};

const pushSolutionInterval = (socket, solution) => {
  const response = solution;
  socket.emit("SolutionInterval", response);
};

const pushUrlInterval = (socket, url) => {
  const response = url;
  socket.emit("urlInterval", response);
};

const pushTrueAnswerInterval = (socket, trueAnswer) => {
  const response = trueAnswer;
  socket.emit("TrueAnswerInterval", response);
};

const pushTimeInterval = (socket, timeInterval) => {
  const response = timeInterval;
  socket.emit("TimeInterval", response);
};

function intervalFunc(socket) {
  timeInterval = timeInterval + 1;
  indexInterval = parseInt(timeInterval / 45);
  if (parseInt(timeInterval / 15) % 3 == 2) solutionInterval = true;
  else solutionInterval = false;
  urlInterval = songList[indexInterval].url;
  if (timeInterval % 45 == 29) urlInterval = "";

  trueAnswerInterval = songList[indexInterval].title;

  pushIndexInterval(socket, indexInterval);
  pushSolutionInterval(socket, solutionInterval);
  pushUrlInterval(socket, urlInterval);
  pushTrueAnswerInterval(socket, trueAnswerInterval);
  pushTimeInterval(socket, timeInterval);
  // console.log(timeInterval);
  // console.log(indexInterval);
  // console.log(solutionInterval);
}
app.get("/start", (req, res) => {
  res.send({ response: "start" }).status(200);
  var socket = req.app.get("io");
  songList = getRandomNFromArray(songList, 40);
  pushStart(socket);
  pushSongList(socket);
  timeInterval = 0;
  setInterval(function () {
    intervalFunc(socket);
  }, 1000);
});

const updateScore = (scoreList, username, newScore) => {
  return [
    ...scoreList.filter((c) => c.username != username),
    { username: username, score: newScore },
  ];
};

const updateSong = (songList, title, url) => {
  return [...songList, { title: title, url: url }];
};

app.get("/update", function (req, res) {
  const query = req.query; // query = {sex:"female"}

  const params = req.params; //params = {id:"000000"}

  const { score, username } = query;
  scoreList = updateScore(scoreList, username, score);
  console.log(scoreList);
  var socket = req.app.get("io");
  getAllScore(socket);
  res.send({ response: "re" }).status(200);
});

app.get("/addsong", function (req, res) {
  const query = req.query; // query = {sex:"female"}

  const params = req.params; //params = {id:"000000"}
  const { title, url } = query;
  songList = updateSong(songList, title, url);
  console.log(songList);
  res.send({ response: "re" }).status(200);
});

function shuffle(array) {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const getRandomNFromArray = (array, n) => shuffle(array).slice(0, n);
