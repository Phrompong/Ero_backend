import { decompress } from "./common.controller";
import CryptoJS from "crypto-js";

const aes256 = require("aes256");

const password = "eNorLE8tKqkEAAlKAq0=";

export function encrypt(value: any) {
  const temp = CryptoJS.AES.encrypt(value.toString(), "qwerty");

  return temp.toString();
}

export function decrypt(value: any) {
  const temp = CryptoJS.AES.decrypt(value, "qwerty");

  return temp.toString(CryptoJS.enc.Utf8);
}
