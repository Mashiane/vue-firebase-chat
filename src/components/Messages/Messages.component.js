import {mapGetters} from "vuex";
import Message from "./Message";

export default  {
  name: 'messages',
  props: [
    'room',
    'user',
    'fileLoader',
    'roomPath',
    'messagesPath',
    'messageTypes',
    'updateRoom',
    'hideSubmitMessage',
    'filePath',
    'orderMessagesByChild',
    'updateCounter',
    'equalMessagesTo'
  ],
  components: {
    Message
  },
  mounted() {
    const {orderMessagesByChild, equalMessagesTo} = this;
    let filter;

    if (orderMessagesByChild && equalMessagesTo) {
      filter = {
        orderByChild: orderMessagesByChild,
        equalTo: equalMessagesTo
      }
    }
    this.loading = true;
    this.$store.dispatch(
      'getRoomMessages', {
        filter,
        id: this.room.id,
        path: this.messagesPath
      }).then(() => {
      this.$store.dispatch('setMessagesWasRead', {
        room: this.room,
        path: this.roomPath,
        userID: this.user
      });
      this.loading = false;
    });
    if (!this.hideSubmitMessage) {
      this.initTextareaResize(this.$refs.textarea);
    }
  },
  data() {
    return {
      messages_loading: true,
      loading: false,
      active_room_id: null,
      formData: {
        type: 'message',
        from: this.user,
        text: null
      }
    }
  },
  methods: {
    sortObject(list, key) {
      const obj = Object.assign({}, list);
      delete obj['.key'];
      return Object.keys(obj).sort((a,b) =>{
        if (obj[a] && obj[b]) {
          return obj[a][key]-obj[b][key]
        }

        // for (var i=0,len=a.length;i<len;++i){
        //   if (a[i]!=b[i]) return a[i]<b[i]?-1:1;
        // }
        return 0;
      });
    },
    onSubmit() {
      const text = this.formData.text ? this.formData.text.trim() : '';
      if (text.length) {
        this.$store.dispatch('sendMessage', {
          path: this.messagesPath,
          message: Object.assign(
            {
              room: this.room.id
            },
            this.formData,
            {
              text: this.formData.text.trim()
            })
        }).then((message) => {
          this.$store.dispatch('updateCurrentRoom', {
            path: this.roomPath,
            message
          });
        });
        this.clearForm();
      }
    },
    updateMessage(message, update) {
      this.$store.dispatch('updateMessage', {
        path: this.messagesPath,
        message,
        update
      }).then((message) => {
        this.$store.dispatch('updateCurrentRoom', {
          path: this.roomPath,
          message
        });
      });
    },
    clearForm() {
      this.formData = {
        type: 'message',
        from: this.user,
        text: null
      };
      this.$refs.textarea.value = null;

      setTimeout(() => {
        this.$refs.textarea.selectionStart = 0;
        this.$refs.textarea.selectionEnd = 0;
      });
    },
    resize (event) {
      event.target.style.height = 'auto';
      event.target.style.height = event.target.scrollHeight + 3 + 'px';
    },
    delayedResize (event) {
      if (event.keyCode === 13) {
        if (event.ctrlKey) {
          event.currentTarget.value += '\n';
        } else {
          this.onSubmit();
        }
      } else {
        window.setTimeout(this.resize, 0, event);
      }
    },
    initTextareaResize(el) {
      el.addEventListener('change',  this.resize, false);
      el.addEventListener('cut',     this.delayedResize, false);
      el.addEventListener('paste',   this.delayedResize, false);
      el.addEventListener('drop',    this.delayedResize, false);
      el.addEventListener('keydown', this.delayedResize, false);
    },
    onFileChange() {
      this.loading = true;
      const file = this.$refs.input_file.files[0];

      this.$store.dispatch('uploadFile', {path: this.filePath, file}).then((ref) => {
        this.$store.dispatch('sendMessage', {
          path: this.messagesPath,
          message: {
            room: this.room.id,
            type: 'file',
            from: this.user,
            file_name: file.name,
            sort_by: `document`,
            download_url: ref
          }
        }).then((message) => {
          this.loading = false;
          this.updateCurrentRoom(message);
        }).catch(err => {
          console.log(err);
          this.loading = false;
        });
      });
    }
  },
  computed: {
    ...mapGetters([
      'messages'
    ]),
    sortedMessages() {
      if (this.messages && this.messages['.value'] !== null) {
        return this.sortObject(this.messages, 'updated_at').map(key => {
          return this.messages[key]
        })
      }

      return false;
    }
  },
  watch: {
    room(room) {
      if (room && this.active_room_id !== room.id) {
        // this.messages_loading = true;
        const {orderMessagesByChild, equalMessagesTo} = this;
        let filter;

        if (orderMessagesByChild && equalMessagesTo) {
          filter = {
            orderByChild: orderMessagesByChild,
            equalTo: equalMessagesTo
          }
        }

        this.$store.dispatch('getRoomMessages', {
          filter,
          id: room.id,
          path: this.messagesPath
        }).then(() => {
        });

        this.active_room_id = room.id;
      } else if (this.active_room_id === room.id) {
        this.$store.dispatch('setMessagesWasRead', {
          room,
          path: this.roomPath,
          userID: this.user
        });
      }
    },
    messages() {
      setTimeout(() => {
        if (this.$refs.body) {
          this.$refs.body.scrollTop = this.$refs.body.scrollHeight;
          this.messages_loading = false;
        }
      });
    }
  }
}

