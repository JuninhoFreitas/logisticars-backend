import { createHash } from 'crypto';

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