var myVideoArea=document.querySelector("#myVideoTag");
		var theirVideoArea=document.querySelector("#theirVideoTag");
		
		var myName =document.querySelector("#myName");
		var myMessage = document.querySelector("#myMessage");
		var sendMessage = document.querySelector("#sendMessage");
		
		var chatArea =  document.querySelector("#chatArea");
		var signalingArea =  document.querySelector("#signalingArea");
		
		var ROOM = "chat";
		var SIGNAL_ROOM = "signal_room";
		var configuration = {
			'iceServers': [{
				'url': 'stun:stun.l.google.com:19302'
			}]
		};
		var rtcPeerConn;
		
		
		io = io.connect();
		io.emit('ready',{"chat_room": ROOM,"signal_room": SIGNAL_ROOM});
		//bogus code
		io.emit('signal',{"type":"user_here","message":"are you ready for a call?","room":SIGNAL_ROOM});
		
		
		
		
		
		io.on('signaling_message', function(data){
			displaySignalMessage("Signal Received: "+ data.type);
			//Setup the RTC Peer Connection object
		if(!rtcPeerConn)
			startSignaling();
			
			if(data.type != "user_here"){
				var message = JSON.parse(data.message);
				if(message.sdp){
					rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function(){
						//if we received and offerr , we need to answer
						if(rtcPeerConn.remoteDescription.type == 'offer'){
							rtcPeerConn.createAnswer(sendLocalDesc,logError);
						}
					},logError);
				}else{
					rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
				}
			}
			
		});
		
		function startSignaling(){
			displaySignalMessage("Signal Received: "+ data.type);
			
			rtcPeerConn = new webkitRTCPeerConnection(configuration); 
			
			// send any ice candidate to the other peer
			rtcPeerConn.onicecandidate = function(evt){
			if(evt,candidate)
			io.emit('signal',{"type":"ice candidate","message":JSON.stringify({
					'candidate':evt.candidate}),"room":SIGNAL_ROOM});
			displaySignalMessage("complete that ice candidate");
			};
			
			//let the 'negotiationnedd ' event trigger offer generation 
			rtcPeerConn.onnegotiationneeded =  function(){
				displaySignalMessage("on negotiationned  called");
				rtcPeerConn.createOffer(sendLocalDesc, logError);
			};
			
			//once remote stream arrives, show it in the  remote video element
			rtcPeerConn.onaddstream = function(evt){
				displaySignalMessage("going to add stream ..");
				theirVideoArea.src = URL.createObjectURL(evt.stream);
			};
			//get a local stream, show it in our video tag and add it to be sent
			
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			navigator.getUserMedia({
				'audio' : true,
				'video' : true
			}, function(stream){
				displaySignalMessage("going to display my strem ...");
				myVideoArea.src = URL.createObjectURL(stream);
				rtcPeerConn.addStream(stream);
			},logError);
			
		}
		
		function sendLocalDesc(desc){
			rtcPeerConn.setLocalDescription(desc, function(){
				displaySignalMessage("sending local description");
				io.emit('signal',{"type":"SDP","message":JSON.stringify({'sdp':rtcPeerConn.localDescription}), "room":SIGNAL_ROOM
				});
			}, logError);
		}
		
		function logError(error){
			displaySignalMessage(error.name + ': ' + error.message);
		}
		
		io.on('announce',function(data){
			displayMessage(data.message);
		});
		
		io.on('message',function(data){
			displayMessage(data.author + ": " + data.message);
		});
		
		sendMessage.addEventListener('click',function(ev){
			io.emit('send', {"author":myName.value, "message":myMessage.value, "room":ROOM
			});
			ev.preventDefault();
		},false);
		
		function displayMessage(message){
			chatArea.innerHTML = chatArea.innerHTML + "</br>" + message;
		}
		
		function displaySignalMessage(message){
			signalingArea.innerHTML = signalingArea.innerHTML + "</br>" + message;
		}
		
		/*function startStream(){
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		var constraints = {
		audio: false,
		video: {
				mandatory: {
					minWidth: 640,
					maxWidth: 640,
					minHeight: 360,
					maxHeight: 480
				}
			}
			};
			var videoArea =  document.querySelector("video");
		
		
			//navigator.getUserMedia(constraints,onSuccess,onError);
		}
		
		
		
		
		
		
		function onSuccess(stream){
			console.log("Success we have a stream ;");
			videoArea.src = window.URL.createObjectURL(stream);
			videoArea.play();
		}
		
		function onError(error){
			console.log("Error with getUSerrMedia : ",error);
		}*/