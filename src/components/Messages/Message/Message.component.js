export default  {
  name: 'message',
  props: ['message', 'user', 'messageTypes', 'room'],
  mounted() {
    if (this.$el && this.$el.querySelector('.message__body') && this.$el.querySelector('.message__body').firstChild) {
      this.hide = this.$el.querySelector('.message__body').firstChild.innerHTML === '<!---->'
    }
  },
  data() {
    return {
      hide: false
    }
  },
  methods: {
    getDate(date) {
      const dateObj = new Date(date);
      const d = {
        hh: dateObj.getHours(),
        mm: dateObj.getMinutes(),
        dd: dateObj.getDate(),
        month: dateObj.getMonth() + 1,
        yy: dateObj.getFullYear().toString().substring(2)
      };

      return `${d.hh}:${d.mm > 10 ? d.mm : '0' + d.mm}, ${d.dd}/${d.month> 10 ? d.month : '0' + d.month}/${d.yy}`
    },
    getText(text) {
      return text ? text.replace(/(?:\r\n|\r|\n)/g, '<br>') : null;
    }
  },
  computed: {

  },
  watch: {
    message(message) {
      this.hide = false;
      this.$nextTick()
        .then(() => {
          if (this.$el && this.$el.querySelector('.message__body') && this.$el.querySelector('.message__body').firstChild) {
            this.hide = this.$el.querySelector('.message__body').firstChild.innerHTML === '<!---->'
          }
        });
    }
  }
}

