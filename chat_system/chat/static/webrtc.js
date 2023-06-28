const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'; //used previously
const wsPath = wsProtocol + window.location.host + '/ws/chat/' + roomName + '/'; // used previously

const socket = new WebSocket(wsPath);   // used previously

// chatSocket.onmessage = function (e) {
//     const data = JSON.parse(e.data);
//     if (data.message) {
//         // Handle incoming chat messages
//         displayMessage(data.message);
//     } else if (data.offer) {
//         // Handle incoming offer for WebRTC connection
//         handleOffer(data.offer);
//     } else if (data.answer) {
//         // Handle incoming answer for WebRTC connection
//         handleAnswer(data.answer);
//     } else if (data.candidate) {
//         // Handle incoming ICE candidate for WebRTC connection
//         handleCandidate(data.candidate);
//     }
// };

// function displayMessage(message) {
//     // Display chat message in the UI
//     const messagesDiv = document.getElementById('messages');
//     messagesDiv.innerHTML += `<p>${message}</p>`;
// }

// function sendChatMessage(message) {
//     // Send chat message to the server
//     chatSocket.send(JSON.stringify({ 'message': message }));
// }

// // Functions for WebRTC connection establishment and handling
// // (Offer, Answer, ICE candidates, etc.)
// // ... code for WebRTC connection handling ...

// // Function to capture user's media streams
// function getLocalMediaStream() {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//         .then(function (stream) {
//             const localVideo = document.getElementById('localVideo');
//             localVideo.srcObject = stream;
//         })
//         .catch(function (error) {
//             console.error('Error accessing media devices:', error);
//         });
// }

// // Call the function to capture user's media streams
// getLocalMediaStream();





// next web socket using webrtc

// Establish WebSocket connection
// const socket = new WebSocket('ws://localhost:8000/ws/chat/room_name/'); ---->> commented

socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.message) {
    // Handle incoming chat message
    displayMessage(data.message);
  }
};

function sendMessage(message) {
  // Send chat message to the server
  socket.send(JSON.stringify({ 'message': message }));
}

function displayMessage(message) {
  // Display chat message in the UI
  const messageContainer = document.getElementById('message-container');
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageContainer.appendChild(messageElement);
}

// Function to capture user's media streams
function getUserMedia() {
  navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(function(stream) {
      // Handle the user's media stream
      const localVideo = document.getElementById('local-video');
      localVideo.srcObject = stream;

      // Establish WebRTC connection using the stream
      const pc = new RTCPeerConnection();

      // Add the user's stream to the connection
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Handle incoming ice candidates and create an offer
      pc.onicecandidate = function(event) {
        if (event.candidate) {
          socket.send(JSON.stringify({ 'candidate': event.candidate }));
        }
      };

      pc.createOffer()
        .then(function(offer) {
          return pc.setLocalDescription(offer);
        })
        .then(function() {
          socket.send(JSON.stringify({ 'offer': pc.localDescription }));
        });

      // Handle incoming offer from other peer
      socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.offer) {
          pc.setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(function() {
              return pc.createAnswer();
            })
            .then(function(answer) {
              return pc.setLocalDescription(answer);
            })
            .then(function() {
              socket.send(JSON.stringify({ 'answer': pc.localDescription }));
            });
        } else if (data.answer) {
          pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.candidate) {
          pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      };

      // Handle incoming streams from other peer
      pc.ontrack = function(event) {
        const remoteVideo = document.getElementById('remote-video');
        if (!remoteVideo.srcObject) {
          remoteVideo.srcObject = event.streams[0];
        }
      };
    })
    .catch(function(error) {
      console.error('Error accessing media devices:', error);
    });
}

// Call the function to capture user's media streams
getUserMedia();
