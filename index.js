
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 8082;

app.get('/', function (req, res) {
    res.send('<h1>Welcome Realtime Ming Server</h1>');
});

var roomNum = 0;
//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

const DrawEvents = {
    DrawStart: 'draw.event.start',
    DrawMove: 'draw.event.move',
    DrawEnd: 'draw.event.end',
    DrawClear: 'draw.event.clear'
};

io.on('connection', function (socket) {
    console.log('a user connected');

    

    // socket.join(roomNum, function() {
    //     console.log('join room:', roomNum);
    // });

    // socket.on('join', function(obj) {
    //     console.log('join', obj);
    //     if (obj.roomId) {
    //         socket.join(obj.roomId, function() {
                
    //         });
    //     }
    // });

    //监听新用户加入
    socket.on('login', function (obj) {                                                             
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.userid;

        //检查在线列表，如果不在里面就加入
        if (!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = obj.username;
            //在线人数+1
            onlineCount++;
        }

        //向所有客户端广播用户加入
        io.emit('login', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj });
        console.log(obj.username + '加入了聊天室');
    });

    //监听用户退出
    socket.on('disconnect', function () {
        //将退出的用户从在线列表中删除
        if (onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = { userid: socket.name, username: onlineUsers[socket.name] };

            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;

            //向所有客户端广播用户退出
            io.emit('logout', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj });
            console.log(obj.username + '退出了聊天室');
        }
    });

    socket.on(DrawEvents.DrawStart, function(obj) {
        console.log('demo draw start:', obj);
        io.emit(DrawEvents.DrawStart, obj);
    });

    socket.on(DrawEvents.DrawMove, function(obj) {
        console.log('demo draw move:', obj);
        io.emit(DrawEvents.DrawMove, obj);
    });
    
    socket.on(DrawEvents.DrawEnd, function(obj) {
        console.log('demo draw end:', obj);
        io.emit(DrawEvents.DrawEnd, obj);
    });

    socket.on(DrawEvents.DrawClear, function(obj) {
        console.log('demo draw clear:', obj);
        io.emit(DrawEvents.DrawClear, obj);
    });

    socket.on('message', function(obj) {
        console.log('receive msg:', obj.msg);
    })

    //监听用户发布聊天内容
    socket.on('message', function (obj) {
        //向所有客户端广播发布的消息
        io.emit('message', obj);
        console.log(obj.username + '说：' + obj.content);
    });
});


http.listen(port, function () {
    console.log('listening on *:', port);
});



