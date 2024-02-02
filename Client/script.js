const url = "YOUR_SOCKETIO_SERVER";
const messages = document.getElementById("messages");
// let socket;

let peer = new Peer();
let IDsConnectedTo = [];

let idSet = false;
let playerID;

function handleSubmit(event){
    event.preventDefault();

    console.log(IDsConnectedTo);
    console.log(peer.connections);
    msg = document.getElementById("message");
    messages.innerHTML += `<a>${msg.value}<br/></a>`

    for(let id in peer.connections){
        try {
            let conn = peer.connections[id][0];

            console.log("Conn State for", id, conn.readyState)
            conn.send({ "id": playerID, "value": msg.value });
            console.log("Sent message to", peer.connections[id][0])
        } catch {
            console.error("ERROR SENDING TO", id)
        }
    }

    msg.value = "";
}

function closeConnection(){
    peer.disconnect();
}

function setID(id){
    if(idSet){ return; };

    let data = { "id": id }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => console.log('POST response:', data))
        .then(() => localStorage.setItem("peer-connection-id", id))
        // .then(() => document.cookie = `peer-connection-id=${playerID}; path=/`)
        .catch((error) => {
            console.error('Error:', error);
        });

    // socket.emit("new-peer", id);
}

function connectToID(id){
    if(playerID == id.id || IDsConnectedTo.includes(id)){
        return;
    }

    // Check if connection already exists
    if (peer.connections[id] && peer.connections[id].length > 0) {
        return;
    }

    console.log("Connecting to", id)
    let conn = peer.connect(id);

    IDsConnectedTo.push(id)

    conn.on("open", function(){
        console.log("Connected to:", id)
    });

    conn.on('data', function(data) {
        console.log("Received:", data);
        messages.innerHTML += `<a>${data.value}<br/></a>`
    });

    conn.on('close', function() {
        console.log(`Connection to ${id} closed`);
        const index = IDsConnectedTo.indexOf(id);
        if (index > -1) {
            IDsConnectedTo.splice(index, 1);
        }
    });
}

function connectToPeers(){
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            for(let i = 0; i < data.length; i++){
                if(data[i]["id"] == playerID){ console.error(data[i]["id"]) };

                connectToID(data[i]["id"])
            }

            console.log("Conncted to the following peers:", peer.connections)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


peer.on('open', function(id) {
    setID(id);
    connectToPeers();

    playerID = id;
    console.log(id);

    // handleSocketConnection();
})

peer.on("connection", function(conn) {
    let notConnectedTo = true;

    for(let id in peer.connections){
        if(peer.connections[id][0] == conn.peer){
            notConnectedTo = false;
        }
    }

    if(playerID != conn.peer && notConnectedTo){
        connectToID(conn.peer);
    }

    // Only add 'data' event listener if it doesn't exist yet
    if (!conn._events || !conn._events.data) {
        conn.on('data', function(data) {
            console.log("Received:", data);
            messages.innerHTML += `<a>${data.value}<br/></a>`
        });
    }
})


peer.on('error', function(err) {
    console.log(err);
});




// function handleSocketConnection(){
//     const socket = io(url.replace("/api/data", ""), {
//         query: {
//             "peer-connection-id": playerID
//         }
//     });

//     socket.on('connect', () => {
//         console.log('Connected to the server');
//     });

//     socket.on("new-peer", (id) => {
//         console.log("Incoming peer...")
//         if(id["id"] == playerID){ return; }

//         console.log("New Peer - Connecting...")
//         connectToID(id);
//         console.log("Connected to new peer:", id)
//     })

//     socket.on('disconnect', () => {
//         console.log('Disconnected from the server');
//     });
// }













peer.on("disconnected", function(){
    // id = localStorage.getItem("peer-connection-id")
    let id = playerID;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
    })
        .then(response => response.json())
        .then(data => console.log('DELETE response:', data))
        .catch((error) => {
            console.error('Error:', error);
        });

    console.log("Disconnected")
})

peer.on("close", function(){
    let id = playerID

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
    })
        .then(response => response.json())
        .then(data => console.log('DELETE response:', data))
        .catch((error) => {
            console.error('Error:', error);
        });

    console.log("Conncection Closed")
})

// peer.on('data', function(data) {
//     console.log("Received:", data);

//     messages.innerHTML += `<a>${data["value"]}<br/></a>`
// });

// FIX FOR LATER - IF USER PRESSES F5, BUT CANCELS, THEIR CONNECTION IS LOST AND NO WAY TO REVERT IT YET
window.onbeforeunload = function(e) {
    e.preventDefault();
    peer.disconnect();
    e.returnValue = "";
};