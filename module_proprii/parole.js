/**
 * Sir alfanumeric generat din intervalele de coduri ASCII specificate.
 * @type {string}
 */
let sirAlphaNum = "";

/**
 * Intervale de coduri ASCII pentru cifre si litere (majuscule si minuscule).
 * @type {number[][]}
 */
const v_intervale = [[48, 57], [65, 90], [97, 122]];

// Construirea sirului alfanumeric bazat pe intervalele specificate
for (let interval of v_intervale) {
    for (let i = interval[0]; i <= interval[1]; i++) {
        sirAlphaNum += String.fromCharCode(i);
    }
}

console.log(sirAlphaNum);

/**
 * Genereaza un token alfanumeric de lungime specificata.
 *
 * @param {number} n - Lungimea tokenului de generat.
 * @returns {string} Tokenul generat.
 */
function genereazaToken(n) {
    let token = "";
    for (let i = 0; i < n; i++) {
        token += sirAlphaNum[Math.floor(Math.random() * sirAlphaNum.length)];
    }
    return token;
}

module.exports.genereazaToken = genereazaToken;
