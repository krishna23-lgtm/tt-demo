export function generateRoomCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let code = "";
  for (let index = 0; index < 4; index++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  for (let index = 0; index < 4; index++) {
    code += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return code;
}
