import { Request, Response } from 'express';
// const bcrypt = require('bcrypt');
import jwt from 'jsonwebtoken';
const AUTH_ERROR = { message: '사용자 인증 오류' };
import { Token } from '../controllers/userTypes';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { IUserInfo } from './userTypes';
import CharInfo from '../services/CharInfo';

// async function hashPassword(user: IUserInfo) {
//   const password = user.userPw;
//   // const saltRounds = config.bcrypt.saltRounds;

//   const hashedPassword = await new Promise((resolve, reject) => {
//     bcrypt.hash(password, saltRounds, function (err: any, hash: any) {
//       if (err) reject(err);
//       resolve(hash);
//     });
//   });

//   return hashedPassword;
// }

const userIdRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
const userNicknameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/; //hanguel, number, alphbet,  not allows special char and white space

interface CurUser {
  [userNickname: string]: number;
}

export const validate = async (req: Request, res: Response) => {
  try {
    const { item, value } = req.body;
    switch (item) {
      case 'userId':
        if (!value) {
          return res.status(200).json({
            message: '아이디를 입력해 주세요.',
          });
        }
        const foundUserById = await User.findOne({ userId: value });
        if (foundUserById) {
          return res.status(200).json({
            message: '이미 존재하는 아이디입니다.',
          });
        }
        if (!userIdRegex.test(value)) {
          return res.status(200).json({
            message: '아이디는 영문과 숫자만 포함할 수 있습니다.',
          });
        }
        break;
      case 'userNickName':
        if (!value) {
          return res.status(200).json({
            message: '닉네임을 입력해 주세요.',
          });
        }
        const foundUserByNick = await User.findOne({
          userNickname: value,
        });
        if (foundUserByNick) {
          return res.status(200).json({
            message: '이미 존재하는 닉네임입니다.',
          });
        }
        if (!userNicknameRegex.test(value)) {
          return res.status(200).json({
            message: '닉네임은 한글, 영문, 숫자만 포함할 수 있습니다.',
          });
        }
        break;
    }
    return res.status(200).json({
      message: '',
    });
  } catch (err) {
    console.log(err);
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const user = req.body;

    const foundUserById = await User.findOne({ userId: user.userId });
    if (foundUserById) {
      return res.status(409).json({
        status: 409,
        message: '이미 존재하는 아이디입니다.',
      });
    }
    const foundUserByNick = await User.findOne({
      userNickname: user.userNickname,
    });
    if (foundUserByNick) {
      return res.status(410).json({
        status: 410,
        message: '이미 존재하는 닉네임입니다.',
      });
    }

    //validation check
    if (
      userIdRegex.test(user.userId) &&
      userNicknameRegex.test(user.userNickname)
    ) {
      // user.userPw = await hashPassword(user);
      const result = await User.collection.insertOne({
        userId: user.userId,
        userPw: user.userPw,
        userNickname: user.userNickname,
        userBojId: user.userBojId,
        userLeetId: user.userLeetId,
      });
      if (!result) {
        return res.json({ success: false, message: '회원가입 실패' });
      }
      return res.status(200).json({
        status: 200,
        payload: {
          userId: user.userId,
        },
      });
    } else {
      return res.status(420).json({
        status: 420,
        message: '양식에 맞지 않는 입력입니다',
      });
    }
  } catch (e) {
    console.log(e);
  }
};

let curUser: CurUser = {};

export const removeCurUser = (userNickname: string) => {
  if (userNickname in curUser) {
    console.log(delete curUser[userNickname]);
  }
};

export const addCurUser = (userNickname: string) => {
  curUser[userNickname] = 1;
};

export const isInCurUser = (userNickname: string) => {
  if (userNickname in curUser) {
    return true;
  } else {
    return false;
  }
};

export const login = async (req: Request, res: Response) => {
  // * Validate user input
  if (!req.body.userId) {
    return res.status(400).json({
      status: 400,
      message: '아이디를 입력해주세요.',
    });
  }
  if (!req.body.userPw) {
    return res.status(400).json({
      status: 400,
      message: '비밀번호를 입력해주세요.',
    });
  }
  const { userId, userPw } = req.body;

  const foundUser = await User.findOne({ userId: userId });
  if (!foundUser) {
    console.log('nofound');
    return res.status(400).json({
      status: 400,
      message: '아이디를 확인해주세요.',
    });
  }

  const isPasswordCorrect = await User.findOne({
    userId: userId,
    userPw: userPw,
  });

  if (isInCurUser(foundUser.userNickname)) {
    console.log('double');
    return res.status(420).json({
      status: 420,
      message: '이미 접속한 유저입니다.',
    });
  }

  if (isPasswordCorrect) {
    res.status(200).json({
      status: 200,
      payload: {
        userId: foundUser.userId,
        userNickname: foundUser.userNickname,
        userBojId: foundUser.userBojId,
        userLeetId: foundUser.userLeetId,
      },
    });
    // curUser[isPasswordCorrect.userNickname] = 1;
  } else {
    return res.status(400).json({
      status: 400,
      message: '비밀번호가 올바르지 않습니다.',
    });
  }
};

export const getChar = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;

    if (!CharInfo.get(username)) {
      //CharInfo에 username이 없음 => 오픈비두 서버에는 있는 username이지만, 현재 서버에는 없는 유저임.
      //에러 처리하지 않고, 그냥 빈칸 처리
      return res.send('');
    }
    res.send(CharInfo.get(username));
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

// const isPasswordCorrect = await bcrypt.compare(userPw, foundUser.userPw);
// if (isPasswordCorrect) {
//   const accessToken = jwt.sign(
//     {
//       userId: foundUser.userId,
//       username: foundUser.userNickname,
//       uuid: uuidv4(),
//     },
//     config.jwt.secretKey,
//     {
//       expiresIn: '1h',
//     }
//   );

//   const refreshToken = jwt.sign(
//     {
//       userId: foundUser.userId,
//       username: foundUser.userNickname,
//       uuid1: uuidv4(),
//       uuid2: uuidv4(),
//     },
//     config.jwt.secretKey
//   );

//   await User.collection.updateOne(
//     { userId: foundUser.userId },
//     {
//       $set: {
//         refreshToken: refreshToken,
//         lastUpdated: new Date(),
//       },
//     }
//   );

//   res.cookie('refreshToken', refreshToken, { path: '/', secure: true }); // 60초 * 60분 * 1시간
//   res.status(200).json({
//     status: 200,
//     payload: {
//       userId: foundUser.userId,
//       accessToken: accessToken,
//     },
//   });
// } else {
//   return res.status(400).json({
//     status: 400,
//     message: '비밀번호가 올바르지 않습니다.',
//   });
// }
