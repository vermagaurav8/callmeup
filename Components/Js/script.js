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
