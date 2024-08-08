import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", init);

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const mediaStreamConstraints = {
  video: true,
  audio: true,
};

let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");
let localStream = null;
let remoteStream = null;
let peerConnection = null;

const currentURL = window.location.href;
const urlParts = currentURL.split("/");
const roomId = urlParts[urlParts.length - 1];

async function init() {
  localStream = await navigator.mediaDevices.getUserMedia(
    mediaStreamConstraints
  );
  localVideo.srcObject = localStream;

  remoteStream = new MediaStream();

  const roomDoc = doc(db, "rooms", roomId);
  const checkRoomDocExist = (await getDoc(roomDoc)).exists();

  if (!checkRoomDocExist) {
    createOffer(roomDoc);
  } else {
    createAnswer(roomDoc);
  }
}

function createPeerConnection() {
  peerConnection = new RTCPeerConnection(servers);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  remoteVideo.srcObject = remoteStream;
}

async function createOffer(roomDoc) {
  createPeerConnection();
  const offerCandidates = collection(roomDoc, "offerCandidates");
  const answerCandidates = collection(roomDoc, "answerCandidates");

  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription);

  const offer = {
    offer: {
      type: offerDescription.type,
      sdp: offerDescription.sdp,
    },
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(offerCandidates, event.candidate.toJSON());
    }
  };

  await setDoc(roomDoc, offer);

  onSnapshot(roomDoc, (snapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      peerConnection.setRemoteDescription(answerDescription);
    }
  });

  collecICECandidates(answerCandidates);
}

async function createAnswer(roomDoc) {
  createPeerConnection();
  const offerCandidates = collection(roomDoc, "offerCandidates");
  const answerCandidates = collection(roomDoc, "answerCandidates");

  const offerDescription = (await getDoc(roomDoc)).data().offer;
  await peerConnection.setRemoteDescription(offerDescription);

  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);

  const answer = {
    answer: {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    },
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(answerCandidates, event.candidate.toJSON());
    }
  };

  await updateDoc(roomDoc, answer);

  collecICECandidates(offerCandidates);
}

function collecICECandidates(ICECandidates) {
  onSnapshot(ICECandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        peerConnection.addIceCandidate(candidate);
      }
    });
  });
}

document.getElementById("cameraBtn").addEventListener("click", function () {
  let videoTrack = localStream
    .getTracks()
    .find((track) => track.kind === "video");

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    document.getElementById("iconCamera").src = "/image/cameraOff.png";
    document.getElementById("cameraBtn").classList.add("red-background");
  } else {
    videoTrack.enabled = true;
    document.getElementById("iconCamera").src = "/image/cameraO.png";
    document.getElementById("cameraBtn").classList.remove("red-background");
  }
});
document.getElementById("microBtn").addEventListener("click", function () {
  let audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio");

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    document.getElementById("iconMic").src = "/image/mute-microphone.png";
    document.getElementById("microBtn").classList.add("red-background");
  } else {
    audioTrack.enabled = true;
    document.getElementById("iconMic").src =
      "/image/microphone-black-shape.png";
    document.getElementById("microBtn").classList.remove("red-background");
  }
});
