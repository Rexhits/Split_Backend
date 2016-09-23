/*
 * @name Simple Draw
 * @description Touch to draw on the screen using touchX, touchY, ptouchX, and ptouchY values. 
 */
var circles = [];
// var voices = [];
var count,limit,circleCount;
var sound, shakeCount, shakeTimer;
var writing, printer;
var move, shaked, bouncing, userControl;
var oscillator, granular, oscillator2, oscillator3;
var socket;
var accX, accY, controlX, controlY;
document.addEventListener('touchmove', function(e) {
	e.preventDefault();}, false);

function preload() {
  writing = loadSound('assets/writing.mp3');
  printer = loadSound('assets/printer.mp3');
}

 function setup() {
 	const canvasElt = createCanvas(windowWidth/2, windowHeight/2).elt;
  canvasElt.style.width = '100%', canvasElt.style.height = '100%';
	strokeWeight(4);
	smooth();
	background(0);
	frameRate(28);
// 	fullscreen(true);
	move = false;
	shaked = false;
	count = 0;
	circleCount = 0
	shakeCount = 0;
	shakeTimer = 0;
	sound = writing;
	limit = 30;
	oscillator = new Oscillator();
	granular = new GranularVoice();
	oscillator2 = new Oscillator2();
	oscillator3 = new Oscillator3();
	printer.playMode("sustain");
	bouncing = false;
	start = false;
	userControl = true;
	accX = 0;
	accY = 0;
	controlX = 0;
	controlY = 0;
// 	button = createButton("Fall");
// 	button.position(0,0);
// 	button.mousePressed(keyPressed);
  socket = io.connect('http://ec2-54-174-189-134.compute-1.amazonaws.com:8080');
  socket.on('status',
    // When we receive data
    function(data) {
      move = data.move;
      bouncing = data.bouncing;
      userControl = data.userControl;
    }
  );
  socket.on('control',
    // When we receive data
    function(data) {
      controlX = data.x;
      controlY = data.y;
      if (data.length == 0) { // touchStarted()
        circles.splice(0,circles.length)
        count = 0;
        circleCount = 0;
        oscillator3.env.triggerRelease();
        if (touches.length == 1) {
          shaked = false;
          bouncing = false;
        } else if (touches.length > 1) {
          bouncing = true;
        }
      }
      if (data.length == 1) { // touchMoved()
      
        if (count == 3) {
          if (circleCount < limit) {
            circles.push(new Circle());
              if(!move && !bouncing) {
                granular.playGrain(random(0.5,5), random(0.01, 0.5));
              }
            circleCount ++;
          }
    
        } else if (count > 3) {
           count = 0
        }
  
	      count ++;
      }
      if (data.length == 2) {
        printer.play(0,random(0.9,1), random(0.2, 0.35));
      }
    }
  );
}

function touchStarted() {
  // printer.play();
  // move = false;
  if (userControl) {
    oscillator3.env.triggerRelease()
    circles.splice(0,circles.length)
    count = 0;
    circleCount = 0;
    if (touches.length == 1) {
      shaked = false;
      bouncing = false;
    } else if (touches.length > 1) {
      bouncing = true;
    }
  }
    
  
}

function touchMoved() {
  if (userControl) {
    if (count == 3) {
      if (circleCount < limit) {
      circles.push(new Circle());
        if(!move && !bouncing) {
          granular.playGrain(random(0.5,5), random(0.01, 0.5));
        }
        circleCount ++;
      }
    
    } else if (count > 3) {
      count = 0
    }
  
	  count ++;
  }
  
// 	print(circles.length);
  // circles[0].move();
}



function deviceShaken() {
  // shakeCount ++;
  // printer.play();
  // if (shakeCount == 1) {
  if(userControl) {
    if (!shaked) {
      if (!move) {
        move = true;
      } else {
        move = false;
      // bouncing = false;
      }
      shaked = true;
      printer.play(0,random(0.9,1), random(0.2, 0.35));
    }
  }
  
 
  // } else {
    // shakeCount = 0;
    // move = false;
  // }
  
}
function keyPressed() {
  shakeCount ++;
  if (shakeCount == 1) {
    move = true;
    printer.play(0,random(0.9,1), random(0.3, 0.45));
  } else if (shakeCount == 2) {
    bouncing = true;
    
  } else {
    shakeCount = 0;
    bouncing = false;
    move = false;
    
  }
  

}
function draw() {
  strokeWeight(random(0.5,6));
  fill(0, 40);
  rect(0,0,width,height);
  stroke(random(50, 255),random(30, 255),random(20, 255))
  for (var i=0; i<circles.length; i++) {
    circles[i].show();
    if (bouncing) {
      circles[i].bouncing();
    }
    
    if (move) {
      circles[i].move();
      if (!bouncing) {
        if (circles[i].y > height) {
          oscillator.playEnv(map(touchX, 0, windowWidth, 0, width));
	        circles.splice(i, 1);
	      }
      }
      
    }
	  if (!move && !bouncing) {
	    circles[i].gravity();
	    if (circles[i].y > height || circles[i].x > width || circles[i].y < 0 || circles[i].x < 0) {
          oscillator.playEnv(map(touchX, 0, windowWidth, 0, width));
	        circles.splice(i, 1);
	       // print("over")
	        oscillator3.env.triggerRelease()
	      }
	  }
	}
	
	
// 	sound.start();
  if (shaked) {
    shakeTimer ++;
    if (shakeTimer > 14) {
      shaked = false;
      shakeTimer = 0;
    }
  }
}

function Oscillator() {
  this.osc = new p5.Noise('pink');

  this.filter = new p5.HighPass();
  this.filter2 = new p5.LowPass();
  this.filter2.freq(6000);
  this.filter2.res(5);
  // this.reverb = new p5.Reverb();
  this.osc.disconnect();
  this.osc.connect(this.filter);
  this.filter.disconnect();
  this.filter.connect(this.filter2);
  // this.osc.setType('sine');
  this.osc.start();
  this.osc.amp(0);
  // this.reverb.process(this.filter, 2, 2);
  this.decay = 0.2;
  this.amp = 0.2;
  this.env = new p5.Env();
  this.env.setExp(true);
  
  this.osc.amp(this.env);
  this.env.setADSR(0.0001, this.decay, 0.1, 0.3);
  this.playEnv = function(x) {
    this.osc.pan(map(x, 0, width, -1, 1));
    this.pitches = [60, 62, 64, 67, 69];
    var pitchSel = int(random(0,(this.pitches.length - 1)));
    var freq = midiToFreq(this.pitches[pitchSel]);
    this.filter.freq(freq * int(random(1,3)));
    this.filter.res(random(10,30));
    
    this.decay = random(0.2, 0.4);
    this.amp = random(0.2, 0.5);
    this.env.mult(this.amp/circles.length);
    
    this.env.play();
  }
}

function GranularVoice(){

  this.sound = sound;
  this.sound.playMode('restart');
  // this.delay = new p5.Delay();
  // this.delay.process(this.sound, .35, .1, 5000);
  this.playGrain = function(rate, grLength) {
    // this.delay.delayTime(random(0.01, 0.5));
    this.start = random(0, this.sound.duration() - grLength);
    this.grainDur = grLength - (this.attack + this.release);
    this.attack = random(0.1, 0.4);
    this.release = random(0.1, 2);
    this.sound.pan(map(touchX, 0, width, -1.0, 1.0));
    this.attack = grLength*1/10; 
    this.release = grLength*1/10;
    this.grainDur = grLength - (this.attack + this.release)
    this.sound.play(0,rate,random(0.4, 0.8),this.start,grLength);
 }
}


function Oscillator2() {
  this.osc = new p5.TriOsc();
  this.lfo = new p5.Oscillator('sine');
  this.filter = new p5.LowPass();
  // this.reverb = new p5.Reverb();
  this.osc.disconnect();
  this.osc.connect(this.filter);
  this.lfo.disconnect();
  this.osc.amp(this.lfo);
  this.lfo.start();
  
  
  this.osc.start();
  this.osc.amp(0);
  // this.reverb.process(this.filter, 2, 2);
  this.decay = 0.2;
  this.amp = 0.2;
  this.env = new p5.Env();
  this.env.setExp(true);
  this.lfo.amp(this.env);
  // this.lfo.amp(1);
  // this.osc.amp(this.env);
  this.env.setADSR(0.0001, this.decay, 0.1, 0.3);
  this.playEnv = function(x) {
    this.lfo.freq(map(x, 0, width, 700, 50));
    this.osc.pan(map(x, 0, width, -1, 1));
    this.pitches = [60, 62, 64, 65, 67, 69, 71];
    var pitchSel = int(random(0,(this.pitches.length - 1)));
    var freq = midiToFreq(this.pitches[pitchSel]);
    this.osc.freq(freq * int(map(x,0,width,1,3)) * this.lfo)
    this.filter.freq((random(freq,3000)));
    this.filter.res(random(20,40));
    
    this.decay = random(0.5, 0.8);
    this.amp = random(0.1, 0.4);
    this.env.mult(this.amp);
    
    this.env.play();
  }
}

function Oscillator3() {
  this.osc = new p5.Oscillator('sine');
  this.lfo = new p5.Oscillator('sine');

  this.lfo.disconnect();
  this.osc.amp(this.lfo);
  this.lfo.start();
  this.freqMul = 1;
  
  this.osc.start();
  this.osc.amp(0);
  this.decay = 0;
  this.amp = 0.05;
  this.env = new p5.Env();
  this.env.setExp(true);
  this.lfo.amp(this.env);

  this.env.setADSR(8, this.decay, 1, 1);

}

function Circle() {
  this.x = map(touchX, 0, windowWidth, 0, width);
  this.y = map(touchY, 0, windowHeight, 0, height);
  
  // this.x = touchX;
  // this.y = touchY;
  // this.voice = granular;
  // this.sound = oscillator;
  // voices.push(this.voice)

  this.diameter = (random(3, 6));
  
  var xspeed = (random(-5, 5));
  var yspeed = (random(7, 20));
  if(!userControl) {
    this.x = controlX;
    this.y = controlY;
  }
  
  if (!move && !bouncing) {
    oscillator3.decay = random(0.5, 0.8);
    oscillator3.env.mult(oscillator3.amp);
    oscillator3.env.triggerAttack();
    
  }
  this.gravity = function() {
	  this.x += accX * 4;
	  this.y -= accY * 4;
	  oscillator3.lfo.freq(map(this.y, 0, height, 2, 40));
    // oscillator3.osc.pan(map(this.x, 0, width, -1, 1));
    oscillator3.pitches = [48, 50, 52, 53, 55, 57, 59];
    var pitchSel = int(random(0,(oscillator3.pitches.length - 1)));
    var freq = midiToFreq(oscillator3.pitches[pitchSel]);
    oscillator3.osc.freq(freq * int(map(this.x,0,width,1,3)) * oscillator3.lfo)
    

    
  }
  
  this.move = function() {
    if (!bouncing) {
      this.y += yspeed;
    }
    
    
  }
  this.show = function() {
    fill(random(50, 255),random(30, 255),random(20, 255))
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }
  this.bouncing = function() {
    this.x += xspeed;
    this.y += yspeed;
    
    if (this.y > height || this.y < 0 ) {
      yspeed *= -1;
      if (!move) {
        oscillator.playEnv(this.x);
      } else {
        oscillator2.playEnv(this.x);
      }
    }
    if (this. x > width || this.x < 0) {
      xspeed *= -1;
      if (!move) {
        oscillator.playEnv(this.x);
      } else {
        oscillator2.playEnv(this.x);
      }
    }

  }

}

window.addEventListener('devicemotion', function(e) {
  accX = e.accelerationIncludingGravity.x;
  accY = e.accelerationIncludingGravity.y;
})




