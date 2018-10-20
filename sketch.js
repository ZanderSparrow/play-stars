//set AudioContext class for compatibility
let AudioContext = window.AudioContext || window.webkitAudioContext;

//create audio context
const audioContext = new AudioContext();

//setup master gain
const masterGain = audioContext.createGain();
masterGain.connect( audioContext.destination );
masterGain.gain.value = .8;


//setup bus and effects
const compressor = audioContext.createDynamicsCompressor();
// compressor.threshold.value = -30;
compressor.knee.value = 30;
compressor.ratio.value = 3;
// compressor.attack.value = .1;
// compressor.release.value = 0.15;
// compressor.reduction = -20;
compressor.connect(masterGain);

const submixGain = audioContext.createGain();
submixGain.connect( compressor );
submixGain.gain.value = 0;

const effectGain = audioContext.createGain();
effectGain.connect( compressor );

const delay = new Delay( { audioContext, feedback: .7, time: 5 } );
submixGain.connect( delay.input );
delay.output.connect( effectGain );

//setup oscillator
const oscillator = audioContext.createOscillator();
oscillator.start();
oscillator.connect( submixGain );

//setup ADSR
const envelope = new ADSREnvelope( { audioContext } );
envelope.attack = 0;
envelope.decay = .5;
envelope.sustain = 0.3;
envelope.release = 1;
envelope.connect( submixGain.gain );

// envelope.connect( delay.input.delayTime);
const delayEnvelope = new ADSREnvelope( { audioContext } );
delayEnvelope.attack = 0;
delayEnvelope.decay = 2;
delayEnvelope.sustain = 3;
delayEnvelope.release = 5;
delayEnvelope.connect( delay.input.delayTime );

//setup distortion
var distortion = audioContext.createWaveShaper();
var distortionGain = audioContext.createGain();
distortion.oversample = '2x';
distortionGain.connect( distortion );
compressor.connect( distortionGain );
distortion.connect( audioContext.destination );

//setup musical scale and keyboard
const musicalScale = new MusicalScale({ scale: "minor", rootNote: "A0" });
const keyboardKeyCount = 35;
const slideTime = .5;
let currentKeyboardKey = 0;

// stars 
let newStar;
var stars = [];


function setup() {

  //resume web audio on first click for Chrome autoplay rules
  function clickHandler(){
    audioContext.resume();
    document.body.removeEventListener( "click", clickHandler );
  }
  document.body.addEventListener( "click", clickHandler );

  //listen for oscillator waveform selection
  const oscWaveformElement = document.querySelector( "#osc-waveform" );
  oscWaveformElement.addEventListener( "change", function( event ){
    event.preventDefault();
    oscillator.type = event.target.value;
  });

  //create p5 canvas
  createCanvas( windowWidth, windowHeight );

}

function mousePressed(){

  envelope.start();
  distortion.curve = makeDistortionCurve(mouseY / 2);

  let k = updateKeyboardKey();

  newStar = new Star(mouseX, mouseY, k + 3, 3, k, {r: 255, g: 200, b: 30, o: 200});
  newStar.draw();
  stars.push(newStar);

}

function mouseReleased() {

  envelope.stop();

}

function mouseDragged() {

  let k = updateKeyboardKeySlide();
  newStar = new Star(mouseX, mouseY, k, 3, k, {r: 255, g: 200, b: 30, o: 200});
  newStar.draw();
  stars.push(newStar);

}

function mouseMoved() {

}

function updateKeyboardKey() {
  
  let k = Math.floor( ( mouseX / windowWidth ) * keyboardKeyCount );

  currentKeyboardKey = k;
  oscillator.frequency.cancelScheduledValues( audioContext.currentTime );
  oscillator.frequency.setValueAtTime( musicalScale.getFrequency( currentKeyboardKey ), audioContext.currentTime );

  return k;

}

function updateKeyboardKeySlide() {
  
  let k = Math.floor( ( mouseX / windowWidth ) * keyboardKeyCount );

  if( k !== currentKeyboardKey ) {
    currentKeyboardKey = k;
    oscillator.frequency.cancelScheduledValues( audioContext.currentTime );
    oscillator.frequency.linearRampToValueAtTime( musicalScale.getFrequency( currentKeyboardKey ), audioContext.currentTime + slideTime );
  }

  return k;

}

function draw() {

  //clear canvas
  stroke( 200 );
  //fill( 255, 255, 255 );
  background(0, 0, 60);

  // draw stars
  stars = stars.filter(star => !star.dead);

  stars.forEach(star => {
    noStroke();
    star.draw();
    star.fade();
  });

}

// Distortion function

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};
