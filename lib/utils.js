import { createHash } from 'crypto';
import { SESSIONS } from '../memory/memories';
import mainDB from './prisma';

export function hash(str) {
    const hash = createHash('sha256');
    hash.update(str);
    return hash.digest('hex');
}
export function passwordEnc(password) {
    return hash(password + '.ajudeRS.2024..' + password.substring(0, 2));
}
export function rand(min, max) {
    // Retorna um número aleatório entre min (incluído) e max (excluído)
    return Math.floor(Math.random() * (max - min) + min);
}
export function setToken(size) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    let result = '';
    while (result.length < size) {
        let rn = rand(0, chars.length);
        // console.log(rn);
        result += chars[rn];
    }
    // console.log(result);
    return result;
}
export function getTokenFromReq(req){
  if(req.headers){
    return req.headers.Authorization || null
  }else{
    return null;
  }
}
export async function checkToken(token) {
  if (SESSIONS[token]) {
      SESSIONS[token].activity = Date.now();
      return SESSIONS[token];
  }
  let session = await mainDB.sessions.findFirst({ where: { token } });
  if (session) {
      let user = await mainDB.users.findFirst({ where: { token: session.user_ref }, select: { id: true, username: true, token: true } });
      session.user = user;
      session.activity = Date.now();
      SESSIONS[token] = session;
      return session;
  } else {
      return false;
  }
}