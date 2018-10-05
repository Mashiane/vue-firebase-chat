import Messages from './../Messages'
import {mapGetters} from "vuex";
export default  {
  name: 'chat-body',
  props: [
    'active_room',
    'userField',
    'fileLoader',
    'messagesPath',
    'roomPath',
    'filePath',
    'messageTypes',
    'hideSubmitMessage',
    'updateRoom',
    'orderMessagesByChild',
    'equalMessagesTo',
    'updateCounter'
  ],
  components: {
    Messages
  },
  mounted() {

  },
  data() {
    return {
      
    }
  },
  methods: {
   onClickBack(){
     console.log(this.active_room);
     if ( this.active_room ) {

       this.$store.commit('setActiveRoom', null);

     }
     console.log(this.active_room);
   }
  },
  computed: {
    ...mapGetters([
      'messages'
    ])
  }
}

