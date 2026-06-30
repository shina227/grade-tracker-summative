const bcrypt = require("bcryptjs");

const storedHash = "$2b$10$TYoQ7zqFEfYErBJeBoQnUeEDJdgjS3CuNkYulo9TMvM7rEh63QxPG";
const candidatePassword = "whatever you're typing into the login form";

bcrypt.compare(candidatePassword, storedHash).then((isMatch) => {
  console.log("Match:", isMatch);
});