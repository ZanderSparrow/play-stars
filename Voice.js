class Voice {
  
  constructor( options ) {

    this.audioContext = options.audioContext;

    this.output = this.audioContext.createGain();
    this.output.gain.setValueAtTime( 0, this.audioContext.currentTime );

    //setup oscillator
    this.oscillator = audioContext.createOscillator();
    this.oscillator.start();
    this.oscillator.connect( this.output );

    //setup ADSR
    this.envelope = new ADSREnvelope( { audioContext } );
    this.envelope.attack = 0;
    this.envelope.decay = .5;
    this.envelope.sustain = 0.3;
    this.envelope.release = 1;
    this.envelope.connect( this.output.gain );

    //setup distortion
    this.distortion = audioContext.createWaveShaper();
    this.distortion.curve = makeDistortionCurve(10000);
    this.distortion.oversample = '2x';
    this.distortion.connect( this.output );

    //listen for oscillator waveform selection
    const oscWaveformElement = document.querySelector( "#osc-waveform" );
    oscWaveformElement.addEventListener( "change", ( event ) => {
      event.preventDefault();
      this.oscillator.type = event.target.value;
    });

  }

  start( time = this.audioContext.currentTime ) {

    this.envelope.start( time );

  }

  stop( time = this.audioContext.currentTime ) {

    this.envelope.stop( time );

  }

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
