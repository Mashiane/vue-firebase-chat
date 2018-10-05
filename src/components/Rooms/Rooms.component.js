import Spinner from './../Spinner';
import Room from './Room';
export default  {
  name: 'rooms',
  props: [
    'rooms',
    'groupRoomsBy',
    'searchRoomsBy',
    'active_room',
    'searchOrder',
    'updateRoom',
    'roomPath',
    'user'
  ],
  components: {
    Spinner,
    Room
  },
  mounted() {

  },
  data() {
    const {searchRoomsBy} = this;
    const searchBy = typeof searchRoomsBy === 'string' ? [searchRoomsBy] : searchRoomsBy;

    return {
      loading: true,
      search_room: '',
      filter: null,
      first_loading: true,
      searchBy
    }
  },
  methods: {
    sortObject(list, key) {
      return Object.keys(list).sort(function(a,b){return list[a][key]-list[b][key]});
    },

    onSearchRoom(e) {
      const val = this.search_room || e.currentTarget.value || '';
      this.filter = {
        value: val.toLowerCase().trim(),
        searchBy: this.searchBy
      }
    },

    matchWithFilter(filter, item) {
      return filter.searchBy.find((field) => {
        return item && item[field] && item[field].toLowerCase().search(filter.value) !== -1
      })
    },

    setActiveRoom({room}) {
      if (!this.first_loading) return;
      const roomId = this.$route.hash ? this.$route.hash.replace('#', '') : room;
      const active = this.rooms[roomId];

      if (active) {
        this.first_loading = false;
        if (!this.active_room) {
          this.scrollToElement(active.id);
        }
        this.$store.commit('setActiveRoom', roomId);
      }
    },

    scrollToElement(id) {
      setTimeout(() => {
        const {wrapper} = this.$refs;
        const el = wrapper.querySelector(`[data-id="${id}"]`);

        if (el) {
          wrapper.scrollTop = -(wrapper.offsetTop - el.offsetTop);
        }
      })
    },

    getClusteringRooms(rooms, groupName) {
      const {filter} = this;
      let name = [];
      let active_room = this.$route.hash.replace('#', '');


      const computedRooms = this.sortObject(rooms, groupName).reduce((prev, next, index) => {
        if (filter && !this.matchWithFilter(filter, rooms[next])) return prev;
        if (next === '.key') return prev;

        const item = rooms[next];
        const isFirstGroupedElement = item[groupName] && name.indexOf(item[groupName]) === -1;

        if (isFirstGroupedElement) {
          name.push(item[groupName]);
          prev.push({
            [groupName]: item[groupName],
            title: true,
            id: index + 1,
            items: []
          })
        }

        // if (!index) {
        //   active_room = item.id;
        // }

        prev.forEach((field) => {
          if (field[groupName] === item[groupName]) {
            field.items.push(this.extendIsShowCounter(item));
          }
        });

        return prev;
      }, []);


      if (active_room) {
        this.setActiveRoom({room: active_room});
      }

      return computedRooms.map(item => {
        item.items.sort((a, b) => {
          return b.updated_at - a.updated_at
        });
        return item
      });
    },

    getCommonRooms(rooms) {
      return Object.keys(rooms).map((room, index) => {
        const el = rooms[room];

        if (!index) {
          this.setActiveRoom({room: el.id});
        }

        return this.extendIsShowCounter(el)
      })
    },

    extendIsShowCounter(room) {
      return Object.assign({}, room, {
        isShowCounter: this.isShowCounter(room)
      })
    },

    isShowCounter(room) {
      const {unread_messages} = room;
      const {id} = this.user;
      if (unread_messages) {
        const current_unread_messages = Object.keys(unread_messages)
          .filter(message_id => message_id !== id && unread_messages[message_id] && unread_messages[message_id].length);

        return current_unread_messages && current_unread_messages.length;
      }

      return room.unread_messages;
    }
  },

  watch: {
    computedRooms() {
      this.loading = false;
    },
    loading() {
      if (this.active_room) {
        this.scrollToElement(this.active_room.id);
      }
    }
  },

  computed: {
    computedRooms() {
      const {rooms} = this;
      if (!rooms) return false;
      const groupName = this.groupRoomsBy;

      if (rooms && !rooms.hasOwnProperty('.value')) {
        return groupName.length ? this.getClusteringRooms(rooms, groupName) : this.getCommonRooms(rooms);
      } else {
        this.loading = false;
      }

      return false;
    }
  }
}

