import {mapGetters} from 'vuex';
import Rooms from './Rooms';
import ChatBody from './ChatBody';

const defMessage = ['message', 'file'];

export default  {
  name: 'firebase-chat',

  props: {
    user: {
      type: Object,
      default: {},
      required: true,
    },
    groupRoomsBy: {
      type: String,
      default: '',
    },
    searchRoomsBy: {
      type: [String, Array],
      default: 'name',
    },
    userField: {
      type: String,
      default: 'user',
    },
    fileLoader: {
      type: Boolean,
      default: true,
    },
    hideSubmitMessage: {
      type: Boolean,
      default: false,
    },
    searchOrder: {
      type: String,
      default: 'bottom',
    },
    roomPath: {
      type: String,
      default: 'rooms',
    },
    filePath: {
      type: String,
      default: 'media/chat/',
    },
    messagesPath: {
      type: String,
      default: 'messages',
    },
    orderByChild: {
      type: String,
      default: 'id',
    },
    equalTo: {
      type: String
    },
    orderMessagesByChild: {
      type: String
    },
    equalMessagesTo: {
      type: String
    },
    messageTypes: {
      type: Array,
      default() {
        return defMessage;
      }
    },
    updateCounter: {
      type: Function
    },
  },
  components: {
    Rooms,
    ChatBody
  },
  mounted() {
    this.$store.dispatch('setChatUser', this.user);
    this.$store.dispatch('getJobsStatuses').then(() => {
      const id = this.equalTo || this.user.id;

      this.$store.dispatch('getRooms', {
        path: this.roomPath,
        filter: {
          orderByChild: this.orderByChild,
          equalTo: id,
        }
      })
    })
  },
  data() {
    return {
      type: 'main'
    }
  },
  beforeDestroy() {
    this.$store.commit('setActiveRoom', null);
    this.$store.commit('setRooms', null);
    this.$store.commit('clearMessages');
  },
  methods: {
    updateMessage(message, update, notUpdateDate) {
      return this.$store.dispatch('updateMessage', {
        path: this.messagesPath,
        message,
        update,
        notUpdateDate
      }).then((newMessage) => {
        this.$store.dispatch('updateCurrentRoom', {
          path: this.roomPath,
          message: newMessage
        });

        return newMessage;
      })
    },
    sendMessage(message) {
      return this.$store.dispatch('sendMessage', {
        path: this.messagesPath,
        message
      }).then((newMessage) => {
        this.$store.dispatch('updateCurrentRoom', {
          path: this.roomPath,
          message: newMessage
        });

        return newMessage;
      })
    },
    removeMessage(message) {
      return this.$store.dispatch('removeMessage', {
        path: this.messagesPath,
        message
      })
    },
    updateRoom(room, update, not_update_time) {
      return this.$store.dispatch('updateRoom', {
        path: this.roomPath,
        room,
        update,
        not_update_time
      })
    }
  },
  computed: {
    ...mapGetters([
      'rooms',
      'statuses',
      'active_room'
    ]),
    current_active_room() {
      return this.rooms && this.active_room ? this.rooms[this.active_room] : false;
    },
    types() {
      return defMessage.reduce((prev, next) => {
        if (prev.indexOf(next) === -1) {
          prev.push(next);
        }
        return prev;
      }, this.messageTypes)
    }
  }
}

