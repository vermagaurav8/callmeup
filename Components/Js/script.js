// variable declaration
let peer;
let roomId;
let streamSetting = {
  video: {
    frameRate: { ideal: 10, max: 15 },
    width: 720,
    height: 480,
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
};
let localStream;
let selfStream;
let remoteStreamTest;
let currentPeer;
let dataConnection;
// Promise for using Media devices
var getUserMedia =
  navigator.mediaDevices.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

// @@@@@@@@@@@@@@
// onClick functionality for Create Room Button
document.getElementById("create-room").addEventListener("click", function () {
  if (!getUserMedia) {
    alert("Your browser is not supported! Please update browsers.");
    return;
  }

  document
    .getElementById("create-room")
    .children[1].classList.add("fas", "fa-circle-notch", "fa-spin");
  roomId = randomId(3) + "-" + randomId(3);

  // create peer with id
  peer = new Peer(roomId);
  // Open event
  peer.on("open", function (id) {
    if (getUserMedia) {
      console.log("In peer open event");
      getUserMedia(streamSetting)
        .then(function (stream) {
          localStream = stream;
          localVideo();
          document.getElementById("meeting-id").value = roomId;
          createCanvas();
          document
            .getElementById("create-room")
            .children[1].classList.remove("fas", "fa-circle-notch", "fa-spin");
        })
        .catch(function (error) {
          alert("Failed to create room");
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        });
    } else {
      alert("Your browser is not supported! Please update browsers.");
      return;
    }

    console.log("Out of open event");
  });

  // Call event
  peer.on("call", function (data) {
    document.getElementById("show-msg").style.display = "none";
    data.answer(localStream);
    data.on("stream", function (remoteStream) {
      var video = document.querySelector("#remote-video");
      remoteStreamTest = remoteStream;
      currentPeer = data.peerConnection;
      video.srcObject = remoteStream;
      video.play();
    });
  });

  // Connection event
  peer.on("connection", function (data) {
    console.log("Connected with Host");
    dataConnection = data;

    data.on("data", function (data) {
      console.log("server: " + data);
      let message = '<p class="remote-msg"> <span>' + data + "</span></p>";
      document.getElementById("chat").innerHTML += message;
      scrollBottom();
    });
  });

  // on disconnect
  peer.on("disconnected", function () {
    window.location.reload();
  });
});

/*
@@@@@@@@@@@@@@
 Function to join with roomId
*/

document.getElementById("join-room").addEventListener("click", function () {
  var roomId = document.getElementById("room-id").value;
  if (roomId == "" || roomId == " ") {
    alert("please enter room no");
    return;
  }
  roomId = roomId.toLowerCase();
  if (!getUserMedia) {
    alert("Your browser is not supported ! Please use updated browsers.");
    return;
  }

  document
    .getElementById("join-room")
    .children[0].classList.add("fas", "fa-circle-notch", "fa-spin");

  peer = new Peer();

  // open event
  peer.on("open", function (id) {
    dataConnection = peer.connect(roomId);
    dataConnection.on("data", function (data) {
      let message = '<p class="remote-msg"><span>' + data + "</span></p>";
      document.getElementById("chat").innerHTML += message;
      scrollBottom();
    });

    if (getUserMedia) {
      //getUserMedia function call
      getUserMedia(streamSetting)
        .then(function (stream) {
          localStream = stream;
          localVideo();
          document.getElementById("show-msg").innerHTML = "Connecting ....";
          createCanvas();
          document
            .getElementById("join-room")
            .children[0].classList.remove("fas", "fa-circle-notch", "fa-spin");

          let call = peer.call(roomId, localStream);
          call.on("stream", function (stream) {
            document.getElementById("show-msg").innerHTML = "";
            currentPeer = call.peerConnection;
            var video = document.querySelector("#remote-video");
            video.srcObject = stream;
            video.play();
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      console.log("getUserMedia not supported ! Please use updated browsers.");
    }
  });

  // disconnected event
  peer.on("disconnected", function () {
    peer.destroy();
  });

  // close event
  peer.on("close", function () {
    window.location.reload();
  });
});

/*
  SCREEN SHARE OPTION
*/

let screenShare = false;
let videoOnScreen;

document.getElementById("share-screen").addEventListener("click", function () {
  if (!screenShare) {
    screenShare = true;
    document
      .getElementById("share-screen")
      .children[0].classList.remove("fas", "fa-desktop");
    document
      .getElementById("share-screen")
      .children[0].classList.add("fas", "fa-times");

    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: true,
      })
      .then((stream) => {
        videoOnScreen = stream.getVideoTracks()[0];
        videoOnScreen.onended = function () {
          stopScreenShare();
        };
        let host = currentPeer.getSenders().find((e) => {
          return e.track.kind == videoOnScreen.kind;
        });
        host.replaceTrack(videoOnScreen);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    screenShare = false;
    stopScreenShare();
    document
      .getElementById("share-screen")
      .children[0].classList.remove("fas", "fa-times");
    document
      .getElementById("share-screen")
      .children[0].classList.add("fas", "fa-desktop");
  }
});

/*
  Chat box functions
*/

// enabling/disabling chat container
document.getElementById("chat-container").style.display = "none";
document.getElementById("open-chat").addEventListener("click", (e) => {
  let element = document.getElementById("chat-container");
  if (element.style.display == "none") {
    element.style.display = "block";
    document
      .getElementById("open-chat")
      .children[0].classList.remove("fas", "fa-comment-alt");
    document
      .getElementById("open-chat")
      .children[0].classList.add("fas", "fa-times");
  } else {
    element.style.display = "none";
    document
      .getElementById("open-chat")
      .children[0].classList.remove("fas", "fa-times");
    document
      .getElementById("open-chat")
      .children[0].classList.add("fas", "fa-comment-alt");
  }
});

/* 
    UTILITY FUNCTIONS
    ###
    ####
    #####
    ######
*/

// To set localVideo
function localVideo() {
  if (getUserMedia) {
    // console.log("In local video");
    getUserMedia({
      video: {
        width: 720,
        height: 480,
      },
      audio: false,
    })
      .then(function (stream) {
        selfStream = stream;
        var video = document.querySelector(`#self-video`);
        video.srcObject = selfStream;
        video.onloadedmetadata = function (e) {
          video.play();
        };
      })
      .catch(function (error) {
        alert("Failed to set Video");
        setTimeout(function () {
          window.location.reload();
        }, 2000);
      });
  } else {
    alert("Your browser is not supported! Please update browsers.");
    return;
  }
}

// Random Id creater
function randomId(length) {
  var result = [];
  var chars = "abcdefghijklmnopqrstuvwxy";
  var charsLength = chars.length;

  for (let i = 0; i < length; i++) {
    result.push(chars.charAt(Math.floor(Math.random() * charsLength)));
  }

  return result.join("");
}

// Canvas Creation & Deletion
function createCanvas() {
  document.getElementById("home").style.display = "none";
  document.getElementById("meeting").style.display = "block";
}

function destroyCanvas() {
  document.getElementById("meeting").style.display = "none";
  document.getElementById("home").style.display = "block";
}

// Chat scroll function
function scrollBottom() {
  let element = document.getElementById("chat");
  if (element.scrollTop + element.clientHeight != element.scrollHeight) {
    element.scrollTop = element.scrollHeight;
  }
}

/*
    ACTION BUTTONS FUNCTIONALITY
*/

// CopyToClipboard
document
  .querySelector(".copy-meeting-id")
  .children[1].addEventListener("click", function () {
    let text = document.getElementById("meeting-id");
    text.select();
    text.setSelectionRange(0, 999999);
    document.execCommand("copy");
    document.getElementById("coppied-msg").innerText = "Meeting id coppied";
    setTimeout(function () {
      document.getElementById("coppied-msg").innerText = "";
    }, 3000);
  });

// Mute audio
document.getElementById("mute-audio").addEventListener("click", function () {
  if (localStream.getAudioTracks()[0]["enabled"]) {
    localStream.getAudioTracks()[0]["enabled"] = false;
    let element = document.getElementById("mute-audio").children[0];
    element.classList.remove("fa-microphone");
    element.classList.add("fa-microphone-slash");
  } else {
    let element = document.getElementById("mute-audio").children[0];
    localStream.getAudioTracks()[0]["enabled"] = true;
    element.classList.remove("fa-microphone-slash");
    element.classList.add("fa-microphone");
  }
});

// Mute video
document.getElementById("mute-video").addEventListener("click", function () {
  if (localStream.getVideoTracks()[0]["enabled"]) {
    localStream.getVideoTracks()[0]["enabled"] = false;
    let element = document.getElementById("mute-video").children[0];
    element.classList.remove("fa-video");
    element.classList.add("fa-video-slash");
  } else {
    localStream.getVideoTracks()[0]["enabled"] = true;
    let element = document.getElementById("mute-video").children[0];
    element.classList.remove("fa-video-slash");
    element.classList.add("fa-video");
  }
  selfStream.getVideoTracks()[0]["enabled"] =
    !selfStream.getVideoTracks()[0]["enabled"];
});

// End Call
document.getElementById("call-end").addEventListener("click", function () {
  if (confirm("Are you sure to end the meet?")) {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
    selfStream.getTracks().forEach((track) => {
      track.stop();
    });
    peer.disconnect();
    peer.close();
    destroyCanvas();
  }
});

// STOP SCREEN SHARE
function stopScreenShare() {
  let videoTrack = localStream.getVideoTracks()[0];
  let host = currentPeer.getSenders().find((e) => {
    return e.track.kind == videoTrack.kind;
  });
  host.replaceTrack(videoTrack);
}
