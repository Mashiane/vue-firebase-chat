import {mapGetters} from "vuex";

export default  {
  name: 'room',
  props: ['is_active', 'room', 'updateRoom', 'user', 'roomPath'],
  mounted() {
    
  },
  data() {
    return {
      
    }
  },
  methods: {
    onChooseRoom(room) {
      this.$store.dispatch('setActiveRoom', room.id);
      this.$store.dispatch('setMessagesWasRead', {
        room,
        path: this.roomPath,
        userID: this.user
      });
    }
  },
  computed: {
    ...mapGetters([
      'unread_messages'
    ]),
    counter() {
      const {unread_messages, room} = this;
      if (unread_messages && unread_messages.rooms) {
        return unread_messages.rooms[room.id] || 0;
      }

      return false
    },
  }
}

