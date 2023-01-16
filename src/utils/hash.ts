import * as argon from 'argon2';

const hash = async (text: string | Buffer) => argon.hash(text);

const compareHash = async (hash: string, candidate: string | Buffer) =>
  argon.verify(hash, candidate);

export { hash, compareHash };
