export const createOffer = async (connection, localStream, userToCall, doOffer, database, username) => {
  try {
    connection.addStream(localStream)

    const offer = await connection.createOffer()
    await connection.setLocalDescription(offer)

    doOffer(userToCall, offer, database, username)
  } catch (exception) {
    console.error(exception)
  }
}

export const initiateLocalStream = async () => {
  try {
    const stream = navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    return stream
  } catch (exception) {
    console.error(exception)
  }
}
export const initiateConnection = async () => {
  try {
    // use free google stun servers
    var configuration = {
      iceServers: [{   urls: [ "stun:bn-turn1.xirsys.com" ]}, {   username: "VIaYSbGh8KcZAmADzTyjs5MppKMurumtpJ7RRWbkbA-qwDYGBMu9MPxn5pY9jl9XAAAAAGBrFCt2ZXJtYXJpdHU=",   credential: "00f7bcc6-9615-11eb-8c43-0242ac140004",   urls: [       "turn:bn-turn1.xirsys.com:80?transport=udp",       "turn:bn-turn1.xirsys.com:3478?transport=udp",       "turn:bn-turn1.xirsys.com:80?transport=tcp",       "turn:bn-turn1.xirsys.com:3478?transport=tcp",       "turns:bn-turn1.xirsys.com:443?transport=tcp",       "turns:bn-turn1.xirsys.com:5349?transport=tcp"   ]}]
    }
    const conn = new RTCPeerConnection(configuration)
    return conn
  } catch (exception) {
    console.error(exception)
  }
}

export const listenToConnectionEvents = (conn, username, remoteUsername, database, remoteVideoRef, doCandidate) => {
  conn.onicecandidate = function (event) {
    if (event.candidate) {
      doCandidate(remoteUsername, event.candidate, database, username)
    }
  }

  // when a remote user adds stream to the peer connection, we display it
  conn.ontrack = function (e) {
    if (remoteVideoRef.srcObject !== e.streams[0]) {
      remoteVideoRef.srcObject = e.streams[0]
    }
  }
}

export const sendAnswer = async (conn, localStream, notif, doAnswer, database, username) => {
  try {
    // add the localstream to the connection
    conn.addStream(localStream)
    // set the remote and local descriptions and create an answer
    const offer = JSON.parse(notif.offer)
    conn.setRemoteDescription(offer)
    // create an answer to an offer
    const answer = await conn.createAnswer()
    conn.setLocalDescription(answer)

    doAnswer(notif.from, answer, database, username)
    // send answer to the other peer
  } catch (exception) {
    console.error(exception)
  }
}

export const startCall = (conn, notif) => {
  // it should be called when we
  // received an answer from other peer to start the call
  // and set remote the description
  const answer = JSON.parse(notif.answer)
  conn.setRemoteDescription(answer)
}

export const addCandidate = (conn, notif) => {
  // apply the new received candidate to the connection
  const candidate = JSON.parse(notif.candidate)
  conn.addIceCandidate(new RTCIceCandidate(candidate))
}
