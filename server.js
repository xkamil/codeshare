const express = require('express');
const app = express();

const port = process.env.PORT || 80;

app.get('/.well-known/acme-challenge/:file', (req, res) => {
  const fileName = req.params.file;
  const file = `${__dirname}/public/${fileName}`;
  res.download(file);
})

app.use(express.static('public'));

app.listen(port, () => console.log('listening on ' + port));
