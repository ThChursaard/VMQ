const express = require("express");
const http = require("http");
//const socketIo = require("socket.io");
var cors = require("cors");
let scoreList = [];
let questionList = [];
// use it before all route definitions

const uniqueArray = (a) =>
  [...new Set(a.map((o) => JSON.stringify(o)))].map((s) => JSON.parse(s));

const port = process.env.PORT || 4001;
//const index = require("./routes/index");

const app = express();
// app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors());
app.options("*", cors());
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

const pushQuestionList = (socket) => {
  const response = questionList;
  socket.emit("QuestionList", response);
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

const pushQuestionInterval = (socket, question) => {
  const response = question;
  socket.emit("questionInterval", response);
};

const pushTrueAnswerInterval = (socket, trueAnswer) => {
  const response = trueAnswer;
  socket.emit("TrueAnswerInterval", response);
};

const pushTimeInterval = (socket, timeInterval) => {
  const response = timeInterval;
  socket.emit("TimeInterval", response);
};

const pushEnd = (socket, end) => {
  const response = end;
  socket.emit("end", response);
};

function intervalFunc(socket) {
  timeInterval = timeInterval + 1;
  indexInterval = parseInt(timeInterval / 45);
  if (indexInterval > questionList.length) pushEnd(socket, true);
  if (parseInt(timeInterval / 15) % 3 == 2) solutionInterval = true;
  else solutionInterval = false;
  questionInterval = questionList[indexInterval].question;
  if (timeInterval % 45 == 29) questionInterval = "";

  trueAnswerInterval = questionList[indexInterval].answer;

  pushIndexInterval(socket, indexInterval);
  pushSolutionInterval(socket, solutionInterval);
  pushQuestionInterval(socket, questionInterval);
  pushTrueAnswerInterval(socket, trueAnswerInterval);
  pushTimeInterval(socket, timeInterval);
  console.log(timeInterval);
  console.log(indexInterval);
  console.log(solutionInterval);
  console.log(questionInterval);
  console.log(trueAnswerInterval);
}
app.get("/start", (req, res) => {
  res.send({ response: "start" }).status(200);
  var socket = req.app.get("io");
  questionList = getRandomNFromArray(uniqueArray(questionList), 20);
  pushStart(socket);
  pushQuestionList(socket);
  timeInterval = 0;
  setInterval(function () {
    intervalFunc(socket);
  }, 1000);
  pushStart(socket);
});

const updateScore = (scoreList, username, newScore) => {
  return [
    ...scoreList.filter((c) => c.username != username),
    { username: username, score: newScore },
  ];
};

const updateQuestion = (questionList, question, answer) => {
  return [...questionList, { question: question, answer: answer }];
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

app.get("/addquestion", function (req, res) {
  const query = req.query; // query = {sex:"female"}

  const params = req.params; //params = {id:"000000"}
  const { question, answer } = query;
  questionList = updateQuestion(questionList, question, answer);
  console.log(questionList);
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
