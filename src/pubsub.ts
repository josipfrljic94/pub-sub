// PubSub.js - Create a simple Pub-Sub system using an event bus

class PubSub {
  constructor() {
    this.events = {};
  }

  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  unsubscribe(event, callback) {
    if (!this.events[event]) return;

    const index = this.events[event].indexOf(callback);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }
  }

  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(data));
  }
}

export default new PubSub();
