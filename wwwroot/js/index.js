import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

console.log(db);

const createRoomBtn = document.getElementById("createRoomBtn");
const roomIdInput = document.getElementById("roomIdInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
function createRoom() {
  const roomDoc = doc(collection(db, "rooms"));
  roomIdInput.value = roomDoc.id;
}

function joinRoom() {
    const roomId = roomIdInput.value;
    if (!roomId) return
    else window.location.href = "/Room/" + roomId;
}

createRoomBtn.addEventListener("click", createRoom);
joinRoomBtn.addEventListener("click", joinRoom);
