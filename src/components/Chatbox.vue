<template>
  <div>
    <div
      v-if="!isShow || !store.userProfile.isLogin"
      class="show-message is-show"
    >
      <button @click="showMessage" type="button" class="show-message__btn">
        <i class="fab fa-facebook-messenger fa-2x" aria-hidden="true" />
        <q-tooltip
          anchor="center left"
          content-class="bg-indigo"
          self="center right"
          :offset="[10, 10]"
        >
          Join the chat room
        </q-tooltip>
      </button>
    </div>
    <div v-else>
      <div class="message-box is-show">
        <div class="message-box__header">
          <input
            v-if="isSearchUser"
            v-model="keySearch"
            placeholder="Enter keyword here ..."
          />

          <div class="block-name" v-else>
            <q-avatar>
              <img
                class="avatar-img"
                :src="require(`@/assets/images/Icons/chat.png`)"
              />
            </q-avatar>
            <p class="name-user">Contact</p>
          </div>
          <i class="fas fa-times custom-i" @click="isShow = false" />
          <i class="fas fa-list custom-i" />
          <!-- <i class="fas fa-video custom-i" @click="handleCallingToUser" /> -->
          <i
            class="fas fa-search custom-i"
            @click="isSearchUser = !isSearchUser"
          />
        </div>
        <div class="message-box__users">
          <ul class="list-users">
            <li
              v-for="user in usersWithSort"
              :key="user.id"
              @click="handleOpenMessage(user.id, user.fullname || 'Anonymous')"
            >
              <q-avatar size="40px">
                <img :src="require(`@/assets/images/Icons/user.png`)" />
              </q-avatar>
              <p>
                {{ user.fullname || "Anonymous" }}
                <span v-if="store.me === user.id">( Me )</span>
              </p>
              <i
                v-if="
                  users.findIndex((i) => i.id === user.id) > -1 ||
                  user.id === store.userProfile.id
                "
                class="fas fa-circle green"
              />
              <i v-else class="fas fa-circle" />
            </li>
            <li @click="handleOpenMessage(BOT_CHANNEL, 'Tèo Bot')">
              <q-avatar size="40px">
                <img :src="require(`@/assets/images/Icons/bot.png`)" />
              </q-avatar>
              <p>Tèo Bot</p>
              <i class="fas fa-circle green" />
            </li>
            <li @click="handleOpenMessage(CHANNEL, 'All Members')">
              <q-avatar size="40px">
                <img :src="require(`@/assets/images/Icons/users.jpg`)" />
              </q-avatar>
              <p>All Members</p>
              <i class="fas fa-circle green" />
            </li>
          </ul>
        </div>
      </div>

      <div
        v-for="(channel, idx) in messagesOpen"
        :key="channel.id"
        class="message-box is-show"
        :style="`right: ${(idx + 1) * 315 + 15}px`"
      >
        <div class="message-box__header">
          <div class="block-name">
            <q-avatar>
              <img
                class="avatar-img"
                :src="require(`@/assets/images/Icons/user.png`)"
              />
            </q-avatar>
            <p class="name-user">{{ channel.channel }}</p>
          </div>
          <i
            class="fas fa-times custom-i"
            @click="handleCloseMessage(channel.id)"
          />
          <i class="fas fa-list custom-i" />
          <i
            v-if="
              channel.id !== store.me &&
              channel.id !== CHANNEL &&
              channel.id !== BOT_CHANNEL
            "
            class="fas fa-video custom-i"
            @click="handleCallingToUser(channel.id)"
          />
        </div>
        <div class="message-box__body" id="message-box__body">
          <div v-if="loadingMsg && loadingMsg[channel.id]">
            <q-inner-loading :showing="true">
              <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
          </div>
          <div v-else>
            <!-- <div
            @click="handleViewAllMessages(channel.id)"
            v-if="
              messagesFormat[channel.id] &&
                messagesFormat[channel.id].length === 100
            "
            class="message-box__readmore"
          >
            View all messages
          </div> -->
            <div
              v-for="(message, index) in messagesFormat[channel.id]"
              :key="index"
              style="width: 100%; max-width: 400px"
            >
              <q-chat-message
                :name="message.user ? message.user : ''"
                :sent="message.sent ? true : false"
                :text-color="message.sent ? 'black' : 'white'"
                :bg-color="message.sent ? 'amber-7' : 'light-blue'"
                :stamp="message.timeDuration"
              >
                <VueMarkdown :source="message.message" />
              </q-chat-message>
            </div>
          </div>
        </div>
        <div class="message-box__footer">
          <input
            v-model="newMsgToSend[channel.id]"
            class="input-chat"
            type="text"
            placeholder="Enter message here... (/? to get help)"
            @keyup.enter="onSendMessage(channel.id)"
            :disabled="loadingMsg && loadingMsg[channel.id]"
          />
          <button
            :disabled="loadingMsg && loadingMsg[channel.id]"
            type="button"
            @click="onSendMessage(channel.id)"
            class="btn-send"
          >
            <i class="fas fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="phone" color="primary" text-color="white" />
          <span class="q-ml-sm">
            You have a call from: <b>{{ caller }}</b>
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Accept"
            @click="handleAcceptCall(callerId, channelId)"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import Pusher from "pusher-js"; // import Pusher
import { isArray } from "lodash";
import FetchApi from "utils/FetchApi";

import { processStamp } from "utils/Helpers";
// import VueMarkdown from "vue-markdown";
import VueMarkdown from "vue3-markdown-it";
import { CHANNEL, BOT_CHANNEL } from "utils/Constants";

const API_URL = process.env.VUE_APP_API_URL;
// Enable pusher logging - don't include this in production
Pusher.logToConsole = false;
const pusherMessage = new Pusher("1bb3ea564162ad9f320a", {
  cluster: "ap1",
});

import { mapActions, mapState } from "vuex";
function mapStateToProps(state) {
  const data = state.Message.messageList.data;
  const userProfile = state.User.userProfile;
  const users = state.User.users.data;
  return {
    loading: state.Message.messageList.loading,
    messageList: data,
    userProfile,
    users,
    isLogin: userProfile.isLogin,
    me: userProfile.id,
  };
}

export default {
  name: "ChatboxComponet",
  components: {
    VueMarkdown,
  },
  created: function () {
    if (this.store.userProfile.isLogin) {
      const userId = this.store.userProfile.id;
      const userName = this.store.userProfile.fullname;
      this.initCountUsers(userId, userName);
      this.initChannelCall();
      this.handleGetUsers();
    }
  },
  data() {
    return {
      messages: [],
      msgToSend: "",
      isShow: false,
      users: [],
      activeBot: false,
      limit: -1,
      isLoading: true,
      messagesOpen: [],
      newMessages: {},
      newMsgToSend: {},
      CHANNEL,
      loadingMsg: {},
      keySearch: "",
      isSearchUser: false,
      isFetchUser: false,
      confirm: false,
      caller: "",
      channelId: "",
      callerId: "",
      BOT_CHANNEL,
    };
  },

  methods: {
    ...mapActions("Message", ["getMessageList"]),
    ...mapActions("User", ["getUsers"]),

    handleOpenMessage(id, channel) {
      const idx = this.messagesOpen.findIndex((msgOpen) => msgOpen.id === id);
      if (idx > -1) {
        this.handleRemoveListen(id);
        this.messagesOpen.splice(idx, 1);
      } else {
        this.handleAddListen(id);
        this.messagesOpen.push({ id, channel });
        this.handleGetMessages(id, this.limit);
        if (this.messagesOpen.length > 4) {
          this.messagesOpen.splice(0, 1);
        }
      }
    },

    handleCloseMessage(id) {
      const idx = this.messagesOpen.findIndex((msgOpen) => msgOpen.id === id);
      if (idx > -1) {
        this.handleRemoveListen(id);
        this.messagesOpen.splice(idx, 1);
      }
    },

    handleGetUsers() {
      let payload = {
        nextErr: (err) => {
          console.log("[ERROR] " + err);
          this.isLoading = false;
        },
        nextSuccess: () => {
          this.isLoading = false;
          this.isFetchUser = true;
        },
        limit: this.limit,
      };
      this.getUsers(payload);
    },

    handlePushMessage(channel, message, type = 0) {
      this.newMsgToSend[channel] = "";
      if (type === 0) {
        if (
          this.newMessages[channel].length &&
          this.newMessages[channel].length > 0
        ) {
          const length = this.newMessages[channel].length;
          const lastestMsg = this.newMessages[channel][length - 1];
          if (lastestMsg && lastestMsg.id === message.id) {
            delete message.user;
          }
        }
        this.newMessages[channel].push(message);
      } else {
        const firstMsg = this.newMessages[channel][0];
        if (firstMsg.id === message.id) {
          delete firstMsg.user;
        }
        this.newMessages[channel].unshift(message);
      }
      this.newMessages = { ...this.newMessages };
    },

    onSendMessage(channelId) {
      // Get ID if empty will init with name & save to local storage
      const id = this.store.userProfile.id;
      let channel = id + channelId;
      if (channelId === CHANNEL) {
        channel = CHANNEL;
      }
      const name = this.store.userProfile.fullname;
      // Case Msg Empty Return
      if (this.newMsgToSend[channelId] === "") {
        this.$q.notify({
          message: "Oops! Sorry, please enter your message.",
          color: "light-blue",
          icon: "announcement",
        });
        return;
      }
      // Case get help
      if (this.newMsgToSend[channelId] === "/?") {
        const messageEnableBot = {
          id,
          user: "Me",
          message: "/bot on # Enable bot",
          sent: true,
          createdAt: Date.now(),
        };
        const messageDisableBot = {
          id,
          user: "Me",
          message: "/bot off # Disable bot",
          sent: true,
          createdAt: Date.now(),
        };
        this.handlePushMessage(channelId, messageEnableBot);
        this.handlePushMessage(channelId, messageDisableBot);
        return;
      }
      // Case enable bot
      if (this.newMsgToSend[channelId] === "/bot on") {
        this.activeBot = true;
        const messageEnableBot = {
          id,
          user: "Me",
          message: "Bot have been enabled.",
          sent: true,
          createdAt: Date.now(),
        };
        this.handlePushMessage(channelId, messageEnableBot);
        return;
      }
      // Case disable bot
      if (this.newMsgToSend[channelId] === "/bot off") {
        this.activeBot = false;
        const messageDisableBot = {
          id,
          user: "Me",
          message: "Bot have been disabled.",
          sent: true,
          createdAt: Date.now(),
        };
        this.handlePushMessage(channelId, messageDisableBot);
        return;
      }
      // Case normal
      const message = {
        id,
        user: "Me",
        message: this.newMsgToSend[channelId],
        sent: true,
        createdAt: Date.now(),
      };
      this.handlePushMessage(channelId, message);

      const payload = {
        uri: "send-message",
        params: {
          id,
          user: name,
          message: message.message,
          channel: channel,
          activeBot: channelId === this.BOT_CHANNEL ? true : this.activeBot,
        },
        opt: {
          method: "POST",
        },
      };
      FetchApi(payload).then((response) => {
        if (!response.id) {
          this.$q.notify({
            message:
              "Oops! Sorry, can't send message now. Please wait a few minutes and try again. Thanks",
            color: "light-blue",
            icon: "announcement",
          });
        }
      });
    },

    showMessage() {
      if (!this.store.userProfile.isLogin) {
        this.$q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: "Must sign in to join the chat room.",
        });
        if (this.$route.path !== "/signin") {
          this.$router.push("/signin");
        }
      } else {
        this.isShow = true;
      }
    },

    handleGetMessages(channel, limit) {
      this.loadingMsg[channel] = true;
      this.isLoading = true;
      let channelA;
      let channelB;
      if (channel === CHANNEL) {
        channelA = channelB = channel;
      } else {
        channelA = channel + this.store.userProfile.id;
        channelB = this.store.userProfile.id + channel;
      }
      let payload = {
        nextErr: (err) => {
          console.log("[ERROR] " + err);
          this.isLoading = false;
          this.loadingMsg[channel] = false;
        },
        nextSuccess: (response) => {
          this.isLoading = false;
          this.loadingMsg[channel] = false;
          if (response && isArray(response)) {
            const id = this.store.userProfile.id;
            let tempData = [...response];
            if (
              this.newMessages[channel] &&
              this.newMessages[channel].length > 0
            ) {
              tempData = tempData.slice(this.newMessages[channel].length);
              tempData.forEach((message) => {
                const parseMessage = {
                  id: message.senderId,
                  user: message.senderId === id ? "Me" : message.senderName,
                  message: message.message,
                  sent: message.senderId === id,
                  createdAt: message.createdAt,
                };
                this.handlePushMessage(channel, parseMessage, 1);
              });
            } else {
              this.newMessages[channel] = [];
              tempData.reverse().forEach((message) => {
                const parseMessage = {
                  id: message.senderId,
                  user: message.senderId === id ? "Me" : message.senderName,
                  message: message.message,
                  sent: message.senderId === id,
                  createdAt: message.createdAt,
                };
                this.handlePushMessage(channel, parseMessage);
              });
            }
          }
        },
        limit,
        channelA,
        channelB,
      };
      this.getMessageList(payload);
    },

    handleAddListen(channelId) {
      let channel = this.store.userProfile.id + channelId;
      if (channelId === CHANNEL) {
        channel = CHANNEL;
      }
      const channelMessage = pusherMessage.subscribe(channel);
      channelMessage.bind("chat-message", (data) => {
        const id = this.store.userProfile.id;
        if (id !== data.id) {
          this.handlePushMessage(channelId, data);
          if (Notification.permission === "granted") {
            navigator.serviceWorker.getRegistration().then((reg) => {
              let name = data.user;
              if (!name) {
                name = this.newMessages[channelId].find(
                  (message) => message.id === data.id
                ).user;
              }
              const options = {
                body: `${name}: ${data.message}`,
                vibrate: [100, 50, 100],
                data: {
                  dateOfArrival: Date.now(),
                  primaryKey: 1,
                },
              };
              reg.showNotification("Notification", options);
            });
          }
        }
      });

      if (this.messages.length === 0) {
        this.handleGetMessages(channelId, this.limit);
      }
    },

    handleRemoveListen(channelId) {
      let channel = this.store.userProfile.id + channelId;
      if (channelId === CHANNEL) {
        channel = CHANNEL;
      }
      pusherMessage.unsubscribe(channel);
    },

    initCountUsers(userId, userName) {
      const pusher = new Pusher("1bb3ea564162ad9f320a", {
        cluster: "ap1",
        encrypted: true,
        authEndpoint: `${API_URL}pusher/auth?userName=${userName}&userId=${userId}`,
      });

      const channel = pusher.subscribe("presence-videocall");

      channel.bind("pusher:subscription_succeeded", (members) => {
        //set the member count
        this.usersOnline = members.count;
        members.each((member) => {
          if (member.id != channel.members.me.id) {
            this.users.push(member);
          }
        });
      });

      channel.bind("pusher:member_added", (member) => {
        this.users.push(member);
      });

      channel.bind("pusher:member_removed", (member) => {
        // for remove member from list:
        const index = this.users.findIndex((user) => user.id === member.id);
        this.users.splice(index, 1);
      });
    },

    initChannelCall() {
      const channelCalling = pusherMessage.subscribe("call-channel");
      channelCalling.bind("trigger-call", (data) => {
        const { channelId, callerId, receiverId, callerName } = data;
        console.log("data ===>", data);
        const id = this.store.userProfile.id;
        if (id !== callerId && id === receiverId) {
          this.confirm = true;
          this.caller = callerName;
          this.callerId = callerId;
          this.channelId = channelId;
        }
      });
    },

    handleViewAllMessages(channelId) {
      this.handleGetMessages(channelId, -1);
    },

    handleCallingToUser(userId) {
      const channelId = `${userId}${this.store.userProfile.id}`;
      const n =
        "width=1354,height=836,status=0,titlebar=0,scrollbars=0,menubar=0,toolbar=0,location=0,resizable=1";
      let route = this.$router.resolve({
        path: `/video-call?receiverId=${userId}&callerId=${this.store.userProfile.id}&isVideo=true&channelId=${channelId}`,
      });
      window.open(route.href, "_blank", n);
      // API Send signal to Pusher --- Trigger event
      this.handleSendCall(
        channelId,
        this.store.userProfile.id,
        userId,
        this.store.userProfile.fullname
      );
    },

    handleAcceptCall(userId, channelId) {
      const n =
        "width=1354,height=836,status=0,titlebar=0,scrollbars=0,menubar=0,toolbar=0,location=0,resizable=1";
      let route = this.$router.resolve({
        path: `/video-call?receiverId=${this.store.userProfile.id}&callerId=${userId}&isVideo=true&channelId=${channelId}`,
      });
      window.open(route.href, "_blank", n);
    },

    handleSendCall(channelId, callerId, receiverId, callerName) {
      const payload = {
        uri: "sendCall",
        params: { channelId, callerId, receiverId, callerName },
        opt: {
          method: "POST",
        },
      };
      FetchApi(payload);
    },
  },
  computed: {
    ...mapState({
      store: mapStateToProps,
    }),

    messagesFormat() {
      const result = {};
      for (let key in this.newMessages) {
        result[key] = this.newMessages[key].map((message) => {
          message.timeDuration = processStamp(message.createdAt);
          return message;
        });
      }
      return result;
    },
    usersWithSort() {
      return this.store.users.filter(
        (user) =>
          (user.fullname &&
            user.fullname
              .toLowerCase()
              .includes(this.keySearch.toLowerCase())) ||
          user.username.includes(this.keySearch.toLowerCase())
      );
    },
  },
  watch: {
    store(newValue) {
      if (newValue.isLogin) {
        if (!this.isFetchUser) {
          const userId = newValue.userProfile.id;
          const userName = newValue.userProfile.fullname;
          this.initCountUsers(userId, userName);
          this.initChannelCall();
          this.handleGetUsers();
        }
      } else {
        try {
          this.handleRemoveListen("presence-videocall");
          this.handleRemoveListen("call-channel");
          this.isFetchUser = false;
        } catch {
          // console.log("[DEBUG] NOTHING")
        }
      }
    },
  },
};
</script>
