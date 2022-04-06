const e=window.AudioContext||window.webkitAudioContext;function n(e,n,t){const i=function(e,n){const t=new OscillatorNode(e,{type:"square",frequency:n}),i=new GainNode(e,{gain:0});return i.connect(e.destination),t.connect(i),t.start(),i}(e,n);return function(e,n,t){return()=>{n.gain.setValueAtTime(1,e.currentTime),n.gain.setValueAtTime(0,e.currentTime+t)}}(e,i,t/1e3)}const t=new WebSocket(`wss://${window.location.hostname}/ws`);function i(){const i=new e,o={warning:n(s=i,440,250),bookend:n(s,880,500)};var s;return e=>{const n=function({remaining:e,climbing:n,preparation:t}){return!e&&t?n:e>=t?e-t:e}(e),i=function(e){const n=Math.floor(e/60);return n+":"+(e%60).toLocaleString("en-US",{minimumIntegerDigits:2})}(n);t.send(i),0!==n&&60!==n&&n!==e.climbing||o.bookend(),n<6&&n>0&&o.warning()}}class o{constructor(e){const n=e.climbing||300,t=e.interval||0,i=n+t,o=i;this.model={climbing:n,preparation:t,rotation:i,remaining:o},this.onChange=()=>e.onChange(this.model)}run(e){e<0||(this.model.remaining=e,this.onChange())}}const s={0:class extends o{constructor(e){super(e),this.clock=this.run.bind(this),this.ref=setInterval(this.clock,1e3)}run(){const e=this.model.remaining;super.run(e),this.model.remaining=e-1||this.model.rotation}},1:class extends o{constructor(e){super(e),this.clock=this.run.bind(this),this.ref=setInterval(this.clock,1e3)}run(){const e=this.model.remaining;super.run(e),this.model.remaining=e-1}reset(){const{remaining:e,rotation:n}=this.model;this.model.remaining=e>0?0:n}},2:class extends o{constructor(e){super(e),this.clock=this.run.bind(this),this.ref=setInterval(this.clock,1e3)}run(){const e=this.model.remaining;super.run(e),this.model.remaining=e-1||this.model.rotation}reset(){const{preparation:e,remaining:n,rotation:t}=this.model;n>e&&(this.model.remaining=e)}}};let r=null,c=!1;const a=document.getElementById("type"),l=document.getElementById("start"),d=document.getElementById("close");l.addEventListener("click",(()=>{if(c)r.reset();else{const e=i(),n=parseInt(document.getElementById("c_pd").value),t=parseInt(document.getElementById("i_pd").value);r=new s[a.value]({onChange:e,climbing:n,interval:t})}l.label="next",l.disabled="2"!==a.value,d.disabled=!1,c=!0})),document.getElementById("close").onclick=()=>{l.label="start",l.disabled=!1,d.disabled=!0,c=!1,clearInterval(r.ref),t.send("0.00"),r=null};const m=document.getElementById("timer");t.onmessage=e=>m.textContent=e.data;