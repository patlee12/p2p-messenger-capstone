<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import { Peer } from "peerjs";

export default defineComponent({
  name: "Messenger",

  setup() {
    const userId = ref();
    const peerId = ref();
    const userName = ref();
    const host = ref(process.env.HOST);
    const port = ref(process.env.PORT);
    const windowHeight = window.innerHeight * 0.7;
    const rules = [
      (value) => !!value || "Required.",
      (value) => (value && value.length >= 3) || "Min 3 characters",
    ];
    console.log(host.value);
    console.log(port.value);

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
    function endCall() {
      document.querySelector("#menu").style.display = "block";
      document.querySelector("#live").style.display = "none";
      if (!currentCall) return;
      try {
        currentCall.close();
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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      document.getElementById("menu").style.display = "none";
      document.getElementById("live").style.display = "block";
      document.getElementById("local-video").srcObject = stream;
      document.getElementById("local-video").play();

      const call = peer.call(peerId.value, stream);
      call.on("stream", (stream) => {
        document.getElementById("remote-video").srcObject = stream;
        document.getElementById("remote-video").play();
      });
      call.on("data", (stream) => {
        document.querySelector("#remote-video").srcObject = stream;
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
        // grab the camera and mic
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            // play the local preview
            document.querySelector("#local-video").srcObject = stream;
            document.querySelector("#local-video").play();
            // answer the call
            call.answer(stream);
            // save the close function
            currentCall = call;
            // change to the video view
            document.querySelector("#menu").style.display = "none";
            document.querySelector("#live").style.display = "block";
            call.on("stream", (remoteStream) => {
              // when we receive the remote stream, play it
              document.getElementById("remote-video").srcObject = remoteStream;
              document.getElementById("remote-video").play();
            });
          })
          .catch((err) => {
            console.log("Failed to get local stream:", err);
          });
      } else {
        // user rejected the call, close it
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
              <v-btn id="start-call" @click="callUser()">Connect</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="8">
        <v-card :height="windowHeight">
          <v-card-title> Conversation </v-card-title>
          <div id="live">
            <video id="remote-video"></video>
            <video id="local-video" muted="true"></video>
            <v-btn id="end-call" @click="endCall()">End Call</v-btn>
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
#live {
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
#local-video {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 250px;
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  margin: 16px;
  border: 2px solid #fff;
}
#remote-video {
  position: absolute;
  max-width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#start-call {
  padding: 5px;
  background-color: green;
  color: white;
  border: none;
}
#end-call {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px;
  background-color: red;
  color: white;
  border: none;
}
</style>
