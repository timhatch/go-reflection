import AudioCTX, {signal} from "./audiosignal.js"

// const compose = (...fns) => (initialVal) => fns.reduceRight((val, fn) => fn(val), initialVal)

export const socket = new WebSocket(`wss://${window.location.hostname}/ws`)
// export const socket = new WebSocket(`ws://rhapsody.local/ws`)

export function eventHandler() {
  const audioCTX = new AudioCTX
  const audio    = signal(audioCTX)
  
  return (model) => {
    const t = display(model)  // (int)    (calculated seconds)
    const s = format(t)       // (string) (calculated m:ss)

    // Broadcast the display time (always)
    socket.send(s)

    // Play audio signals (as required)
    if (t === 0 || t === 60 || t === model.climbing) audio.bookend()
    if (t < 6 && t > 0) audio.warning()
  }
}

// Utility method to return the remaining time in the current period
// Format the time into a mm:ss string
//
// sig: (Integer time) -> String
function format(time) {
  const m = Math.floor(time / 60)
  const s = time % 60

  return (m + ':' + s.toLocaleString('en-US', {minimumIntegerDigits: 2}))
}

// Return the time to be displayed
// Assumes the following IFSC time periods are provided:
// climbing:    the allowed climbing period
// preparation: the allowed interval following a climbing period (e.g. in boulder, the transition time)
// remaining:   the calculated time  remaining within the rotation/attempt period
//
// sig: (Hash[Integer]) -> Integer
function display({remaining, climbing, preparation}) {
  // If there's no time left in the rotation/attempt period, return the climbing time
  if (!remaining && !!preparation) return climbing

  // Otherwise. calculate whether we're in the climbing or preparation period and return the
  // remaining time within the relevant period
  return remaining >= preparation ? (remaining - preparation) : remaining
}
