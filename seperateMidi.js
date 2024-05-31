const fs = require('fs');

const MidiParser = require('midi-parser-js');

const song = fs.readFileSync('song.midi', 'binary');
const midiParser = new MidiParser(song);
const tracks = midiParser.parse();

const pianoTrack = tracks.find((track) => track.instrument === 'Piano');
const pianoNotes = pianoTrack.notes;

console.log(pianoNotes);
