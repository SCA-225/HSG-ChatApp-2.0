var express = require('express');
var app = express();
var port = 3000;

app.set('port', port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const chatHistory = [];
const nicknames = [];

// Add headers
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );

  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// --- helper ----------------------------------------------------
function getNicknameEntryByName(name) {
  return nicknames.find((n) => n.nickname === name);
}

// root
app.get('/', function (req, res, next) {
  res.json({ message: 'hsg chat-app api works...' });
});

// history
app.get('/history', function (req, res, next) {
  res.send(chatHistory);
});

app.post('/history', function (req, res, next) {
  const chatMessage = req.body?.message?.toString();
  const nickname = req.body?.nickname?.toString();

  if (!chatMessage) {
    res.status(400).send('Message is missing.');
    return;
  }

  if (!nickname) {
    res.status(400).send('Nickname is wrong or missing.');
    return;
  }

  // Avatar IMMER serverseitig aus /nicknames ziehen
  const entry = getNicknameEntryByName(nickname);
  const avatar = entry?.avatar ?? 'avatar1.png'; // fallback, falls Alt-Daten

  const date = new Date();
  const message = {
    id: chatHistory.length + 1,
    message: chatMessage,
    nickname: nickname,
    avatar: avatar,
    createdAt: date,
  };

  chatHistory.push(message);

  res.json(message);
});

// nicknames
app.get('/nicknames', function (req, res, next) {
  res.send(nicknames);
});

app.get('/nicknames/:id', function (req, res, next) {
  const id = +req.params.id;
  const nickname = nicknames.find((e) => e.id === id);

  if (!nickname) {
    res.status(404).send('Nickname not found.');
    return;
  }

  res.send(nickname);
});

app.post('/nicknames', function (req, res, next) {
  const userName = req.body?.nickname?.toString();
  const avatar = req.body?.avatar?.toString(); // << NEU

  if (!userName) {
    res.status(400).send('Nickname is missing.');
    return;
  }

  if (!avatar) {
    res.status(400).send('Avatar is missing.');
    return;
  }

  if (!isNicknameUnique(userName)) {
    res.status(409).send(`Nickname ${userName} already exists.`);
    return;
  }

  const date = new Date();
  const nickname = {
    id: nicknames.length + 1,
    nickname: userName,
    avatar: avatar, // << NEU
    createdAt: date,
  };

  nicknames.push(nickname);

  res.json(nickname);
});

app.delete('/nicknames/:id', function (req, res, next) {
  const id = +req.params.id;
  const index = nicknames.findIndex((e) => e.id === id);

  if (index < 0) {
    res.status(404).send('Nickname id not found.');
    return;
  }

  nicknames.splice(index, 1);

  res.send('Nickname deleted.');
});

function isNicknameUnique(nickname) {
  return !nicknames?.some((e) => e.nickname === nickname);
}

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
