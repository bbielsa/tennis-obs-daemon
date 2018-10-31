const firebase = require('firebase');
const { ObsProcessManager } = require('./obs_process_manager');

const creds = require('../creds.json');
const app = firebase.initializeApp(creds);

const firestore = firebase.firestore();
firestore.settings({ timestampsInSnapshots: true });

const court_collection = firestore.collection('courts');
const courts = [
  'court1', 'court2', 'court3', 'court4'
].reduce((acc, court_id) => {
  const court_doc = court_collection.doc(court_id);

  // Create a new process manager for this court
  const process_manager = new ObsProcessManager(court_id);

  court_doc.onSnapshot(snapshot => {
    const is_live = snapshot.get('isLive');

    process_manager.set_is_live(is_live);
  });

  return {
    ...acc,

    [court_id]: {
      court_doc,
      process_manager
    }
  };
}, {});

['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach(eventType => {
    process.on(eventType, () => {
      for (const court in courts) {
        court.process_manager.kill();
      }

      courts = [];
    });
})
