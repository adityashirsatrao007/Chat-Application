const socket = io();
let currentRoom = null;
let username = null;

// Clerk authentication
window.Clerk.load({ publishableKey: window.CLERK_PUBLISHABLE_KEY });
window.Clerk.mountSignIn("#auth-section");
window.Clerk.addListener("signedIn", async (user) => {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("chat-section").style.display = "block";
  username = prompt("Choose a unique display name:");
  // TODO: Validate uniqueness via backend
  loadRooms();
});

async function loadRooms() {
  const res = await fetch("/api/rooms");
  const rooms = await res.json();
  const roomList = document.getElementById("room-list");
  roomList.innerHTML = "";
  rooms.forEach((room) => {
    const btn = document.createElement("button");
    btn.textContent = room.name;
    btn.onclick = () => joinRoom(room._id, room.name);
    roomList.appendChild(btn);
  });
}

document.getElementById("create-room").onclick = async () => {
  const name = document.getElementById("new-room-name").value.trim();
  if (!name) return;
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (res.ok) loadRooms();
};

function joinRoom(roomId, roomName) {
  currentRoom = roomId;
  document.getElementById("chat-room").style.display = "block";
  document.getElementById("messages").innerHTML = "";
  socket.emit("joinRoom", { roomId, username });
}

document.getElementById("message-form").onsubmit = (e) => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text) return;
  socket.emit("sendMessage", { roomId: currentRoom, username, text });
  input.value = "";
};

socket.on("newMessage", (msg) => {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<span class="username">${
    msg.username
  }</span> <span class="timestamp">${new Date(
    msg.timestamp
  ).toLocaleTimeString()}</span>: ${formatText(msg.text)}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("notification", (note) => {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "notification";
  div.textContent = note;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

function formatText(text) {
  // Basic formatting: bold **text**, italic *text*, links [text](url)
  return text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}
