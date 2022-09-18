<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import { Peer } from "peerjs";

export default defineComponent({
  name: "Messenger",

  setup() {
    const userId = ref();
    const peerId = ref();
    const userName = ref();
    const host = ref();
    const port = ref();
    const windowHeight = window.innerHeight * 0.7;
    const rules = [
      (value) => !!value || "Required.",
      (value) => (value && value.length >= 3) || "Min 3 characters",
    ];

    const peerCall = new Peer({
      host: process.env.HOST,
      secure: false,
      port: Number(process.env.PORT) + 1,
      path: "/myapp",
    });

    peerCall.on("open", function (id) {
      userId.value = id;
    });
    console.log(peerCall);

    let currentCall = undefined;
    async function endCall() {
      document.querySelector("#menu").style.display = "block";
      document.querySelector("#liveFeed").style.display = "none";
      if (!currentCall) return;
      try {
        await currentCall.close();
      } catch {}
      currentCall = undefined;
    }

    async function callUser() {
      const peer = new Peer({
        host: host.value,
        secure: false,
        port: port.value,
        path: "/myapp",
      });

      peer.on("open", function (id) {
        console.log(peer);
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      document.getElementById("menu").style.display = "none";
      document.getElementById("liveFeed").style.display = "block";
      document.getElementById("localStream").srcObject = stream;
      document.getElementById("localStream").play();

      const call = peer.call(peerId.value, stream);
      call.on("stream", (stream) => {
        document.getElementById("remoteStream").srcObject = stream;
        document.getElementById("remoteStream").play();
      });
      call.on("data", (stream) => {
        document.querySelector("#remoteStream").srcObject = stream;
      });
      call.on("error", (err) => {
        console.log(err);
      });
      call.on("close", () => {
        endCall();
      });
      currentCall = call;
    }

    peerCall.on("call", (call) => {
      if (confirm(`Accept call from ${call.peer}?`)) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            document.querySelector("#localStream").srcObject = stream;
            document.querySelector("#localStream").play();
            call.answer(stream);
            currentCall = call;
            document.querySelector("#menu").style.display = "none";
            document.querySelector("#liveFeed").style.display = "block";
            call.on("stream", (remoteStream) => {
              document.getElementById("remoteStream").srcObject = remoteStream;
              document.getElementById("remoteStream").play();
            });
          })
          .catch((err) => {
            console.log("Failed to get local stream:", err);
          });
      } else {
        call.close();
      }
    });

    return {
      windowHeight,
      rules,
      userId,
      peerId,
      userName,
      host,
      port,
      endCall,
      callUser,
    };
  },
});
</script>

<template>
  <div>
    <v-row>
      <v-col cols="4">
        <v-card>
          <v-card-title> Configuration </v-card-title>
          <v-text-field
            v-model="userId"
            @focus="$event.target.select()"
            label="Your Id"
            disabled
            hide-details="auto"
          ></v-text-field>
          <v-card-actions>
            <div id="menu">
              <v-text-field
                v-model="peerId"
                label="Peer ID"
                :rules="rules"
                hide-details="auto"
              ></v-text-field>
              <v-text-field
                v-model="userName"
                label="Your Name"
                :rules="rules"
                hide-details="auto"
              ></v-text-field>
              <v-text-field
                v-model="host"
                label="Host"
                :rules="rules"
                hide-details="auto"
              ></v-text-field>
              <v-text-field
                v-model="port"
                label="Port"
                :rules="rules"
                hide-details="auto"
              ></v-text-field>
              <v-btn id="startCall" @click="callUser()">Connect</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="8">
        <v-card :height="windowHeight">
          <v-card-title> Conversation </v-card-title>
          <div id="liveFeed">
            <video id="remoteStream"></video>
            <video id="localStream" muted="true"></video>
            <v-btn id="endCall" @click="endCall()">End Call</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<style scoped>
.v-text-field {
  padding: 10px;
}
#liveFeed {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  display: none;
}
#localStream {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 300px;
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  margin: 20px;
  border: 2px solid #fff;
}
#remoteStream {
  position: absolute;
  max-width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#startCall {
  padding: 5px;
  background-color: green;
  color: white;
  border: none;
}
#endCall {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px;
  background-color: red;
  color: white;
  border: none;
}
</style>
