const webSocket = new WebSocket("ws://localhost:3000");

webSocket.onmessage = event => {
    handleSignallingData(JSON.parse(event.data));
};

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer);
            break;
        case "candidate":
            peerConn.addIceCandidate(data.candidate);
    }
}
function uuidv4() {
    return "asdfghjkl";
}
let username;
let uuid;
function sendUsername() {
    uuid = uuidv4();
    username = document.getElementById("username-input").value;
    let url = `http://localhost:3000/receiver.html?u=${username}`;
    document.getElementById("msg").innerHTML = `<h3>Call Link :</h3><a href="${url}">${url}</a><br><br>`;
    // alert("UUID is : http://127.0.0.1:5500/receiver/receiver.html?u=" + username);

    sendData({
        type: "store_user",
    });
}

function sendData(data) {
    data.username = username;
    // data.uuid = uuid;
    webSocket.send(JSON.stringify(data));
}

let localStream;
let peerConn;
function startCall() {
    document.getElementById("video-call-div").style.display = "block";

    navigator.getUserMedia(
        {
            video: {
                frameRate: 24,
                width: {
                    min: 480,
                    ideal: 720,
                    max: 1280,
                },
                aspectRatio: 1.33333,
            },
            audio: true,
        },
        stream => {
            localStream = stream;
            document.getElementById("local-video").srcObject = localStream;

            let configuration = {
                iceServers: [
                    {
                        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
                    },
                ],
            };

            peerConn = new RTCPeerConnection(configuration);
            peerConn.addStream(localStream);

            peerConn.onaddstream = e => {
                document.getElementById("remote-video").srcObject = e.stream;
            };

            peerConn.onicecandidate = e => {
                if (e.candidate == null) return;
                sendData({
                    type: "store_candidate",
                    candidate: e.candidate,
                });
            };

            createAndSendOffer();
        },
        error => {
            console.log(error);
        }
    );
}

function createAndSendOffer() {
    peerConn.createOffer(
        offer => {
            sendData({
                type: "store_offer",
                offer: offer,
            });

            peerConn.setLocalDescription(offer);
        },
        error => {
            console.log(error);
        }
    );
}

let isAudio = true;
function muteAudio() {
    isAudio = !isAudio;
    localStream.getAudioTracks()[0].enabled = isAudio;
}

let isVideo = true;
function muteVideo() {
    isVideo = !isVideo;
    localStream.getVideoTracks()[0].enabled = isVideo;
}
