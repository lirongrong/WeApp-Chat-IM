var ws = require("nodejs-websocket")

// Scream server example: "hi" -> "HI!!!"
//创建一个server
var server = ws.createServer(function (conn) {
	console.log("New connection")
	conn.on("text", function (str) { 
		// console.log("Received "+str)
		// conn.sendText(str.toUpperCase()+"!!!")
		//链接成功之后，发送欢迎语
		console.log("连接成功")
		//欢迎语
		if(str == 'null'){
			conn.sendText("有什么能帮到您？");
		}
		//输入文字
		else if(str != 'null' && str){
			conn.sendText("文字")
		}
		//输入多媒体
		else{
			conn.sendText("多媒体文本")
		}
		console.log(str);
	})
	conn.on("close", function (code, reason) {
		console.log("Connection closed")
	})
}).listen(8001)