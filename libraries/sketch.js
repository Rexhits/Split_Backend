/*
 * @name Simple Draw
 * @description Touch to draw on the screen using touchX, touchY, ptouchX, and ptouchY values. 
 */
var circles = [];
// var voices = [];
var count,limit,circleCount;
var sound, shakeCount, shakeTimer;
var writing, printer;
var move, shaked;
var oscillator, granular;

document.addEventListener('touchmove', function(e) {
	e.preventDefault();}, false);

function preload() {
  writing = loadSound('assets/writing.mp3');
  printer = loadSound('assets/printer.mp3');
}

 function setup() {
 	const canvasElt = createCanvas(displayWidth, displayHeight);
  // canvasElt.style.width = '100%', canvasElt.style.height = '100%';
	strokeWeight(10);
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
	printer.playMode("sustain");
// 	button = createButton("Fall");
// 	button.position(0,0);
// 	button.mousePressed(keyPressed);

}

function touchStarted() {
  // printer.play();
  // move = false;
  circles.splice(0,circles.length)
  // circles = [];
  // voices = [];
  // for (var i=0; i<circles.length; i++) {
  //   granular[i].stop();
  // }
  count = 0;
  circleCount = 0;
  shaked = false;
}

function touchMoved() {
  if (count == 3) {
    if (circleCount < limit) {
    circles.push(new Circle());
    }
    if(!move) {
      granular.playGrain(random(0.5,5), random(0.01, 0.5));
    }
    circleCount ++;
  } else if (count > 3) {
    count = 0
  }
  
	count ++;
// 	print(circles.length);
  // circles[0].move();
}



function deviceShaken() {
  // shakeCount ++;
  // printer.play();
  // if (shakeCount == 1) {
  if (!shaked) {
    if (!move) {
      move = true;
    } else {
      move = false;
    }
    shaked = true;
    printer.play(0,random(0.9,1), random(0.2, 0.35));
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
  } else {
    shakeCount = 0;
    
    move = false;
    
  }
  

}
function draw() {
  noStroke();
  fill(0, 40);
  rect(0,0,width,height);
  stroke(random(50, 255),random(30, 255),random(20, 255))
  for (var i=0; i<circles.length; i++) {
    circles[i].show();
    
    if (move) {
      circles[i].move();
    }
	  if (circles[i].y > height) {
	   // circles[i].playsound(1);
	    if (move) {
      oscillator.playEnv(map(touchX, 0, windowWidth, 0, width));
      }
	   // circles[i].sound = null;
	   // circles[i].voice = null;
	    circles.splice(i, 1);
	    
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
  this.filter2.res(2);
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


function Circle() {
  // this.x = map(touchX, 0, windowWidth, 0, width);
  // this.y = map(touchY, 0, windowHeight, 0, height);
  
  this.x = touchX;
  this.y = touchY;
  // this.voice = granular;
  // this.sound = oscillator;
  // voices.push(this.voice)

  this.diameter = (random(0.1, 8));
  var speed = (random(7, 30));
  fill(random(50, 255),random(30, 255),random(20, 255))
  this.move = function() {
    this.y += speed
  }
  this.show = function() {
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }
  // this.playsound = function(rate) {
  //   if(!move) {
  //     this.voice.playGrain(random(0.5,5), random(0.1, 2));
  //   }
  // }
  // this.playsound(random(0.8,4));
  // this.bounce = function(){
  //   if (move) {
  //     this.sound.playEnv(this.x);
  //   }
  // }
}





