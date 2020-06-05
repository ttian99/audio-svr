const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);

/** 用来测试的 */
app.get('/', (req, res) => {
    res.send(`
      <h2>With <code>"express"</code> npm package</h2>
      <form action="/api/upload" enctype="multipart/form-data" method="post">
        <div>Text field title: <input type="text" name="title" /></div>
        <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
        <input type="submit" value="Upload" />
      </form>
    `);
});

/**  */
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(path.join(__dirname, 'tmp'))
        cb(null, path.join(__dirname, 'tmp'))
    },
    filename: function (req, file, cb) {
        console.log(file);
        const extName = file.mimetype.replace('audio/', '.');
        cb(null, file.fieldname + '-' + Date.now() + extName)
    }
})
var upload = multer({ storage: storage });


/** 上传接口 */
app.post('/api/upload', upload.any(), (req, res, next) => {
    // console.log(req.body);
    // console.log(req.files);
    res.json({ code: 200, msg: 'ok', data: req.files });
});

/** 静态路径 */
app.use(express.static('tmp'));



/** 设定主页 */
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/** socket.io实现 */
// const io = require('socket.io')(http)
// io.on('connection', (socket) => {
//     console.log('a user connected');

//     socket.join('test', (err) =>{
//         console.log('user join the room' + 'test');
//     })
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });

//     socket.on('chat message', (msg) => {
//         console.log('message: ' + msg);
//         io.emit('chat message', msg);
//     });

// });

/** webSocket */
const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 8080
});

// 连接池
const connectList = [];
// 链接数量
let connectNum = 0;

wss.on('connection', function connection(ws) {
    console.log('one connected!');
    ++ connectNum;
    connectList.push(ws);

    ws.on('message', function incoming(message) {
        console.log('received message!');
        // console.log('received: %s', message);
        console.log('typeof(message) = ' + typeof(message));
        // const arr = new Uint8Array(message.buffer);

        let bd = Buffer.from(message);
        var uid = bd.readFloatLE(0);
        console.log('uid  = ' + uid);
        var roomid = bd.readFloatLE(1);
        console.log('roomid = ' + roomid);

        
        // wss.emit('message', '哈哈哈哈');
        connectList.forEach(one => {
            // if (one !== ws) {
            //     one.send(message);
            // }
            one.send(message);
        });
    });

    ws.on('close', function(message) {
        // 连接关闭时，将其移出连接池
        // connectList = connectList.filter(function(one){
        //     return one !== ws
        // })
    });
});

wss.on('error', function error(ws) {
    console.error('wss error');
    // console.error(ws);
});


http.listen(3000, () => {
    console.log('Server listening on http://localhost:3000 ...');
});
