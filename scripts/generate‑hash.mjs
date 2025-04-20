import argon2 from 'argon2';

const [plaintext] = process.argv.slice(2);
if (!plaintext) {
  console.error('Usage: node scripts/hash.mjs <plaintext>');
  process.exit(1);
}

console.log(await argon2.hash(plaintext));
