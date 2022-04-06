/*
* AUDIO SYNTHESIS
* Use HTML5 Web Audio to generate required audio signals
*
* Requires browsers to allow autoplay
*/

// Will return null if the browser does not support the WebAudio API
const AudioCTX  = window.AudioContext || window.webkitAudioContext

export default AudioCTX

export const signal = (ctx) => ({
  warning: createAudio(ctx, 440, 250),   // 250ms duration standard middle-A (A4) tone
  bookend: createAudio(ctx, 880, 500),   // 500ms duration A5 tone
})

/*
 * PRIVATE METHODS
 */

// Return a playable audio signal
function createAudio(context, frequency, duration) {
  const tone = audioGraph(context, frequency)
  return playAudio(context, tone, duration / 1000)
}

// Create an Audio Graph comprising a square wave oscillator and an amplifier
// @f - a frequency in Hz for the generated tone
function audioGraph(context, frequency) {
  // Create an OscillatorNode and a GainNode
  const oscillator = new OscillatorNode(context, {type: 'square', frequency})
  const audioNode  = new GainNode(context, {gain: 0})
    
  audioNode.connect(context.destination)    // Connect the GainNode to the hardware output
  oscillator.connect(audioNode)             // Connect the OscillatorNode to the GainNode
  oscillator.start()                        // Start the oscillator (at zero gain)

  // Return the audio node
  return audioNode
}

// Play some tone for a give duration by adjusting the gain
function playAudio(context, tone, duration) {
  return () => {
    tone.gain.setValueAtTime(1, context.currentTime)
    tone.gain.setValueAtTime(0, context.currentTime + duration)
  }
}
