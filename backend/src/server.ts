import app from './app';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(
    `Server is alive and waiting for Aider to write code on port ${PORT}!`,
  );
});
