var React = require('react');
var Emitter = require('tiny-emitter');
var audioCtx = require('audio-context');
var AudioSource = require('audiosource');
var emitter = new Emitter();
var props = require('./props');
var sequence = require('./index')(emitter);
var muter = document.querySelector('.mute');
var bpmr = document.querySelector('.bpm');
var gainNode = audioCtx.createGain();
var playButton = document.querySelector('.play');
var store = {};

var currentTrack;
var seqData = {};

props.tracks.forEach(function(track, idx) {
  currentTrack = new AudioSource(audioCtx, {
    url: track.url ? track.url : null,
    gainNode: gainNode
  });
  seqData[idx] = {
    id: track.id,
    seq: getFreshSequence()
  }
  currentTrack.loadSilent();
  store[track.id] = currentTrack;
});

function getFreshSequence() {
  return [0,0,0,0,
          0,0,0,0,
          0,0,0,0,
          0,0,0,0];
};


var sequence = React.renderComponent(sequence(props), document.querySelector('.container'));

playButton.addEventListener('click', function() {
  emitter.emit('sequence:play');
})

emitter.on('sequence:preview', function(ev) {
  store[ev.id].play();
});

emitter.on('sequence:step', function(ev) {
  Object.keys(seqData).forEach(function(key) {
    if (seqData[key].seq[ev.x]) {
      store[seqData[key].id].play();
    }
  });
});

emitter.on('sequence:set', function(ev) {
  seqData[ev.y].seq[ev.x] = !seqData[ev.y].seq[ev.x];
})