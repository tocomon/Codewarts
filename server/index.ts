import dotenv from 'dotenv';
//환경변수 이용(코드 최상단에 위치시킬 것)
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import http from 'http'; // Load in http module
import pkg from 'body-parser';
import mongoose from 'mongoose';
import { Socket, Server } from 'socket.io'; // Load in socket.io
import editorServer from './servers/editorServer';
import basicRouter from './routes/basicRouter';
import { table } from 'console';
import voiceServer from './servers/voiceServer';
import dbServer from './servers/dbServer';
import { PlayerType, TableType, CharInfoType } from './types/Game';

import cookieParser from 'cookie-parser';

const port = process.env.PORT || 8080;
const mongoPassword = process.env.MONGO_PW;
const { json } = pkg;

const app: Express = express();
app.use(json());
app.use(cors());
app.use(cookieParser());

/*********배포 시 설정들********* */
//빌드하고 나서 주석 해제
app.use(express.static('../client/build'));
app.get('/', function (req, res) {
  res.sendFile('../client/build/index.html');
});

//db connect
const db = `mongodb+srv://juncheol:${mongoPassword}@cluster0.v0izvl3.mongodb.net/?retryWrites=true&w=majority`;
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

//merge phaser 230209
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
  },
}); // initialize socket instance (passing ioServer)

app.use('/', basicRouter);

let players: PlayerType[] = []; // 모든 '접속 중' 유저들을 저장하는 리스트
let tables: TableType[] = []; // 모든 '사용 중' 테이블 데이터를 저장하는 리스트
let charInfo: CharInfoType = {};

io.on('connection', (socket: Socket) => {
  // socket이 연결됩니다~ 이 안에서 서버는 연결된 클라이언트와 소통할 준비가 됨
  console.log('a user connected'); // 유저와 소켓 연결 성공
  // console.log(players.length); // '현재 접속을 시도한 유저'를 제외한 접속인원 수 ( 이하 '나' 라고 지칭하겠습니다. )
  // const charKey = `char${Math.floor(Math.random() * 27)}`; // 랜덤으로 캐릭터 값을 지정해준다. 이후 캐릭터 선택하는 화면이 생기면, 그때 선택한 캐릭터 값을 charKey에 넣어주면 됨!
  // const userName = `원숭이${Math.floor(Math.random() * 2000)}`; // 유저 이름. 유저 위에 떠야한다.
  let playerInfo: PlayerType = {
    // '나'의 데이터 값. soket 인스턴스, soket ID값, 캐릭터 값은 변하지 않는다.
    socket: socket,
    socketId: socket.id,
    charKey: '',
    userName: '',
    state: 'resume',
    x: 0, // 좌표는 phaser에서 초기화되기 때문에 의미없는 0 값을 넣어뒀다.
    y: 0, // 왜 phaser에서 초기화 되는가? -> phaser의 맵 사이즈에 따라 좌표가 결정되기 때문에. ( 어차피 고정된 값이기 때문에 해당 좌표를 직접 찍어봐서 여기서 입력해도 문제는 없을것 같다. )
  };

  // Send back the payload to the client and set its initial position
  socket.emit('start', {
    socketId: socket.id,
  }); // 연결된 유저에게 고유 데이터를 전달한다.

  socket.on(
    'savePlayer',
    ({ charKey, userName }: { charKey: string; userName: string }) => {
      playerInfo.charKey = charKey;
      playerInfo.userName = userName;
      charInfo[userName] = charKey;
    }
  );

  // Send back the payload to the client and set its initial position
  socket.on('loadNewPlayer', (payLoad) => {
    // 위 playerInfo에서 초기화되지 않은 좌표값을 받아온 후 이미 접속중인 유저들에게 '나'의 데이터를 전달한다.
    playerInfo.x = payLoad.x;
    playerInfo.y = payLoad.y;
    players.forEach((player) => {
      const payLoad = {
        // 다른 유저들에게 보낼 '나'의 데이터
        socketId: socket.id,
        state: playerInfo.state,
        charKey: playerInfo.charKey,
        x: playerInfo.x,
        y: playerInfo.y,
        userName: playerInfo.userName,
      };
      // 기존의 유저들에게 '나'의 데이터를 보낸다.
      player.socket.emit('newPlayer', payLoad);
    });
    players.push(playerInfo);
  });

  // TODO: 만약 에디터 켠 상대로 나가면 에디터 꺼야됨
  socket.on('disconnect', () => {
    // socket이 연결 해제됩니다~
    console.log('user disconnected!!!');
    // tables에 '내' 에디터가 있는지 검사하고, 있다면 삭제
    // FIXME: removeEditor를 클라이언트에 쏴주면 클라에서 나오게?
    // 그러면 '내가 누구 꺼 보는지'를 알아야겠다.
    console.log('removeEditor');
    tables.forEach((table) => {
      if (table[2] === playerInfo.userName) {
        socket.broadcast.emit('removeEditor', table);
        socket.emit('removeEditor', table);
      }
    });
    tables = tables.filter((table) => {
      table[2] !== playerInfo.userName;
    });
    console.log(tables);
    // '내'가 나가면 다른 유저들에게 '내' 정보를 지우기 위한 통신을 한다.
    players.forEach((player) => {
      if (player.socketId !== socket.id) {
        player.socket.emit('playerDisconnect', socket.id);
      }
    });
    players = players.filter((player) => player.socketId !== socket.id);
  });
  // 나의 창에 접속중인 유저들을 그려준다.
  socket.on('currentPlayers', () => {
    players.forEach((player) => {
      if (player.socketId !== socket.id) {
        const payLoad = {
          socketId: player.socketId,
          state: player.state,
          charKey: player.charKey,
          x: player.x,
          y: player.y,
          userName: player.userName,
        };
        // socket.emit은 "나"에게 통신하는 것
        socket.emit('currentPlayers', payLoad);
      }
    });
  });

  socket.on('movement', (xy: { x: number; y: number; motion: string }) => {
    // 유저가 움직일 때마다 데이터를 받아서 나를 제외한 다른 유저들에게 내 좌표값을 보낸다.
    const payLoad = {
      socketId: socket.id,
      x: xy.x,
      y: xy.y,
      motion: xy.motion,
    };
    socket.broadcast.emit('updateLocation', payLoad);
    playerInfo.x = xy.x;
    playerInfo.y = xy.y;
  });

  socket.on('connect_error', () => {
    console.log('error happened..');
  });

  socket.on('pauseCharacter', () => {
    // '내'가 탭을 내리면 캐릭터가 고정된다.
    playerInfo.state = 'paused';
    players.forEach((player) => {
      player.socket.emit('pauseCharacter', socket.id);
    });
  });

  socket.on('resumeCharacter', () => {
    // '내'가 다시 탭을 띄우면 캐릭터가 활성화된다.
    playerInfo.state = 'resume';
    players.forEach((player) => {
      player.socket.emit('resumeCharacter', socket.id);
    });
  });

  socket.on('addEditor', (payLoad) => {
    console.log('addEditor');
    // 누군가 editor에 들어가면 해당 table ID값과 자리(인덱스)값을 업데이트 한다.
    //FIXME:
    tables.push([
      payLoad.id,
      payLoad.idx,
      playerInfo.userName,
      payLoad.socketId,
    ]);
    // console.log(tables);
    let payLoad2 = {
      id: payLoad.id,
      idx: payLoad.idx,
      userName: playerInfo.userName,
      //FIXME:
      socketId: payLoad.socketId,
    };
    socket.broadcast.emit('updateEditor', payLoad2);
  });

  socket.on('currentEditors', () => {
    console.log('currentEditors');
    // 이미 사용중인 테이블 데이터를 업데이트한다.
    tables.forEach((table: TableType) => {
      let payLoad = {
        id: table[0],
        idx: table[1],
        userName: table[2],
        //FIXME:
        socketId: playerInfo.socketId,
      };
      socket.emit('updateEditor', payLoad);
    });
  });

  socket.on('removeEditor', () => {
    console.log('removeEditor');
    tables.forEach((table: TableType) => {
      if (table[2] === playerInfo.userName) {
        socket.broadcast.emit('removeEditor', table);
        socket.emit('removeEditor', table);
      }
    });
    tables = tables.filter((table: TableType) => {
      // 조건식에 return 붙여야한다.
      return table[2] !== playerInfo.userName;
    });
    console.log(tables);
  });
});

//8080 서버 연결
httpServer.listen(port, () => {
  console.log(`Game Server running on ${port}`);
});
/* 에디터 서버 포트: 3001 */
editorServer.listen(3001, () => {
  console.log('Editor Server listening on *:3001');
});
/* 보이스챗 서버 포트: 3002 */
voiceServer.listen(3002, () => {
  console.log('Voice Server listening on *:3002');
});
/* DB 로직 서버 포트 : 3003 */
dbServer.listen(3003, () => {
  console.log(`server running on port 3003`);
});
