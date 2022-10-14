<script>
import {
  defineComponent,
  onMounted,
  ref,
  useRoute,
} from "@nuxtjs/composition-api";
import { Peer } from "peerjs";

export default defineComponent({
  name: "Messenger",

  setup() {
    const route = useRoute();
    const yourPeerId = ref();
    const peerId = ref(
      route.value.query.peerId ? route.value.query.peerId : ""
    );
    const peer = ref();
    const userName = ref();
    const myIp = ref();
    const callUrl = ref();
    const splitUrl = window.location.href.split(":");
    const signalServerHost = ref(splitUrl[1].slice(2));
    const signalServerPort = ref(Number(splitUrl[2].split("/")[0]) + 1);
    const websiteServerPort = ref(splitUrl[2].split("/")[0]);
    const signalServerUrl = ref(
      `https://${signalServerHost.value}:${signalServerPort.value}/myapp`
    );
    const host = ref(signalServerHost.value);
    const port = ref(signalServerPort.value);
    const state = ref({
      myid: yourPeerId.value,
      peerId: peerId.value,
      peer: peer.value,
      message: "",
      messages: [],
    });

    function getDateTime() {
      const current = new Date();
      const date =
        current.getFullYear() +
        "-" +
        (current.getMonth() + 1) +
        "-" +
        current.getDate();
      const time =
        current.getHours() +
        ":" +
        current.getMinutes() +
        ":" +
        current.getSeconds();
      const dateTime = date + " " + time;

      return dateTime;
    }

    async function getIp() {
      const { ip } = await fetch("https://api.ipify.org?format=json", {
        method: "GET",
      })
        .then((res) => res.json())
        .catch((error) => console.error(error));
      myIp.value = ip;
    }
    getIp();
    async function createUrlLink() {
      try {
        await navigator.clipboard.writeText(callUrl.value);
        alert("Copied");
      } catch ($err) {
        alert("Cannot copy");
      }
    }

    const windowHeight = window.innerHeight * 0.7;
    const rules = [
      (value) => !!value || "Required.",
      (value) => (value && value.length >= 3) || "Min 3 characters",
    ];

    const peerCall = new Peer({
      host: signalServerHost.value,
      secure: true,
      port: signalServerPort.value,
      path: "/myapp",
    });

    peerCall.on("open", function (id) {
      yourPeerId.value = id;
      callUrl.value = `https://${signalServerHost.value}:${websiteServerPort.value}/dashboard?peerId=${yourPeerId.value}`;
    });

    peerCall.on("connection", (connection) => {
      connection.on("data", (data) => {
        state.value.messages.push(data);
      });
      scrollBottom();
    });

    async function sendMsg() {
      const connection = await state.value.peer.connect(state.value.peerId);
      connection.on("open", () => {
        const msg = {
          sender: userName.value,
          peerId: state.value.myid,
          message: state.value.message,
          time: getDateTime(),
        };
        connection.send(msg);
        state.value.messages.push(msg);
        state.value.message = "";
      });
      scrollBottom();
    }

    let currentCall = undefined;

    peerCall.on("call", (call) => {
      if (confirm(`Accept incoming Call ${call.peer}?`)) {
        state.value.myid = yourPeerId.value;
        state.value.peer = peerCall;
        state.value.peerId = call.metadata.id;
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            document.querySelector("#localStream").srcObject = stream;
            document.querySelector("#localStream").play();
            call.answer(stream);
            currentCall = call;
            document.querySelector("#menu").style.display = "none";
            document.querySelector("#liveFeed").style.display = "block";
            document.querySelector("#chat").style.display = "block";
            call.on("stream", (remoteStream) => {
              document.querySelector("#remoteStream").srcObject = remoteStream;
              document.querySelector("#remoteStream").play();
            });
          })
          .catch((err) => {
            console.log("Failed to get local stream:", err);
          });
        call.on("close", async () => {
          console.log("Called Ended");
          await call.close();
        });
      } else {
        call.close();
      }
    });

    async function endCall() {
      document.querySelector("#menu").style.display = "block";
      document.querySelector("#liveFeed").style.display = "none";
      document.querySelector("#chat").style.display = "none";
      if (!currentCall) return;
      try {
        await currentCall.close();
      } catch {}
      currentCall = undefined;
    }
    async function callUser() {
      peer.value = new Peer({
        host: host.value,
        secure: true,
        port: port.value,
        path: "/myapp",
      });
      state.value.peer = peer.value;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      document.querySelector("#menu").style.display = "none";
      document.querySelector("#liveFeed").style.display = "block";
      document.querySelector("#chat").style.display = "block";
      document.querySelector("#localStream").srcObject = stream;
      document.querySelector("#localStream").play();

      const call = peer.value.call(peerId.value, stream, {
        metadata: { id: yourPeerId.value },
      });

      call.on("stream", (stream) => {
        document.querySelector("#remoteStream").srcObject = stream;
        document.querySelector("#remoteStream").play();
      });
      // call.on("data", (stream) => {
      //   document.querySelector("#remoteStream").srcObject = stream;
      // });
      call.on("error", (err) => {
        console.log(err);
      });
      call.on("close", () => {
        peer.value.disconnect();
      });
      currentCall = call;
    }
    function scrollBottom() {
      setTimeout(function () {
        const div = document.querySelector("#msgList");
        div.scrollTo(0, div.scrollHeight);
      }, 200);
    }

    return {
      windowHeight,
      rules,
      yourPeerId,
      peerId,
      userName,
      host,
      port,
      endCall,
      callUser,
      sendMsg,
      state,
      myIp,
      createUrlLink,
      signalServerPort,
      signalServerUrl,
      scrollBottom,
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
          <v-text-field v-model="myIp" label="Your Public Ip"> </v-text-field>

          <v-text-field
            v-model="yourPeerId"
            @focus="$event.target.select()"
            label="Your Peer Id"
            disabled
            hide-details="auto"
          ></v-text-field>
          <v-card-actions>
            <v-row>
              <v-col>
                <v-btn @click="createUrlLink()">Share Link </v-btn>
              </v-col>
              <v-col>
                <v-btn :href="signalServerUrl" target="_blank"
                  >Turn Server
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <div id="menu">
                  <v-text-field
                    v-model="peerId"
                    label="Peer's ID"
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
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
        <div class="pt-3" id="chat">
          <v-card class="elevation-10">
            <v-toolbar dark color="darken-1">
              <v-toolbar-title>Chat</v-toolbar-title>
            </v-toolbar>
            <v-text-field
              label="Name"
              placeholder="Enter your name"
              v-model="userName"
            />
            <v-card-text>
              <div id="msgList">
                <v-list shaped>
                  <v-list-item v-for="(msg, i) in state.messages" :key="i">
                    <v-list-item-content>
                      <b>{{ msg.sender }} :</b> {{ msg.message }}
                      <i>({{ msg.time }})</i>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-text-field
                v-model="state.message"
                label="Message"
                single-line
                solo-inverted
              ></v-text-field>
              <div class="pb-8">
                <v-btn dark @click="sendMsg()"> send </v-btn>
              </div>
            </v-card-actions>
          </v-card>
        </div>
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
#chat {
  display: none;
}
#msgList {
  height: 200px;
  overflow-y: scroll;
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
