var express = require('express');

var app = express();

app.use(express.static('public'));

app.listen(3010, () => {
    console.log('[Server] Cliente iniciou o servidor!!!')
}
)