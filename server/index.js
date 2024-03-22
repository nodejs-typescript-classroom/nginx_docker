const express = require('express');

const app = express();
app.get("/", (req, res) => {
  console.log({ message: 'I am a endpoint '});
  res.send("I am a endpoint");
});

app.listen(7777, () => {
  console.log("listening on port 7777");
});