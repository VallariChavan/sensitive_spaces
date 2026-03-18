// grid variables -----
let grid = [];
let cols;
let rows;
let sz = 50;
let HSounds = []; // array of sounds that are human-made
let NSounds = []; // array of sounds that are natural
let numNSounds = 5; // number of natural sounds in the soundscape
let fftArray = [];

let state = "home";
// score
let score = 0;
// colours---

let h;
let s;

// UI ----
let gridShiftX = 5; // amount to shift the grid on x-axis
let gridShiftY = 2; // amount to shift the grid on y-axis

// sounds visualisation
let maxCircleSize = sz - 5;

//Focus on sounds range
let focusRange = 90;
let maxFocus = 200;
let minFocus = 20;

// buttons
let reset;
let resetCreated = false;
let enter;
let enterCreated = false;
//timer flag
let endStart = 0;

// fonts
// let bitcount;
// let quicksand;

//image
let owl;

function preload() {
  // load fonts
  // bitcount = loadFont("assets/fonts/bitcount.ttf");
  // quicksand = loadFont("assets/fonts/quicksand.ttf");

  for (let i = 1; i < 51; i++) {
    // load all the sound files
    let filename = "assets/human-made/" + i + ".mp3";
    let sound = loadSound(filename);
    HSounds.push(sound);
  }
  for (let i = 1; i < 40; i++) {
    // load all the sound files
    let filename = "assets/natural/" + i + ".mp3";
    let sound = loadSound(filename);
    NSounds.push(sound);
  }
  // load image
  owl = loadImage("assets/images/owl-sketch.PNG");
  //console.log(owl);

  //console.log(NSounds)
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  colorMode(HSB, 360, 100, 100, 255);
  //ellipseMode(CORNER);

  // get the number of columns and  rows based on size of canvas
  cols = floor(width / sz) - gridShiftX;
  rows = floor(height / sz) - gridShiftY;

  // Select sounds for each cell
  let numSounds = cols * rows;

  let numHSounds = numSounds - numNSounds; // number of human-made sounds

  // create a shuffled type list
  let types = [];
  for (let i = 0; i < numHSounds; i++) types.push("H"); // human sounds
  for (let i = 0; i < numNSounds; i++) types.push("N"); // natural sounds
  shuffle(types, true); // shuffle the array
  //console.log(types);

  // create a index variable to add sounds into each cell as it is created
  let index = 0;
  //create a 2d array which stores whether a cell is 0 or 1
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      // store the type
      let type = types[index];
      // create a variable to store a sound
      let sound;

      // select sounds according to type
      if (type === "H") {
        sound = random(HSounds);
      } else if (type === "N") {
        sound = random(NSounds);
      }
      // create an fft object to add to the cell
      let fft = new p5.FFT(0.2);
      sound.connect(fft);

      //Assign a value that is either 0 or 1
      grid[i][j] = {
        cell: 0,
        sound: sound, // add sound object
        type: type, // add type
        playing: false, // whether sound is playing from the cell
        fft: fft,
      };
      //update index value
      index++;
    }
  }
  //console.log(grid);
}
//---------------------------draw function
function draw() {
  background(0);

  //drawSoundscape();

  if (state === "soundscape") drawSoundscape();
  if (state === "end") drawEnd();
  if (state === "home") drawHomeScreen();

  if (score === numNSounds) {
    state = "end";
    recordEnd();
    score = 0; //reset score
  }
}

// ----------- home screen
function drawHomeScreen() {
  // set the state
  state = "home";

  //Format text
  rectMode(CENTER);
  //rect(width / 2, height / 2, width, height);

  // add text
  //Title
  textFont("Quicksand");
  textSize(100);
  textAlign(CENTER);
  textWrap(WORD);
  fill(120, 100,100);
  text("SENSITIVE", width / 2, height / 3-80, 200);
  textFont("Bitcount");
  fill(255);
  text("SPACES", width / 2, height / 3-80 + 100, 200);
  if (!enterCreated) {
    createEnter();
    enterCreated = true;
  }

  // Description
  textFont("Quicksand");
  textSize(18);
  textWrap(WORD);
  text(
    "Sensitivity in all its forms can be perceived by many as a problem in a world that has increasingly become overstimulating and overwhelming. Being too sensitive is at times considered a disadvantage but when it comes to animals like owls, dolphins, orcas etc. their primary way of seeing and experiencing the world is by being sensitive to small sounds around them. An owl can catch its prey just by listening carefully and figuring out where it is. This game follows a similar mechanism in which you have to find natural sounds hidden among human-made ones. While the overstimulating human world can overshadow and even hurt, the sensitive and natural world still exists beneath the surface. This game give you a chance to find that, experience it and keep it with you. \n (If you are wearing headphones lower the volume. Many sounds will start at once when you enter the soundscape.)",
    width / 2,
    (height * 2) / 3 -60,
    800,
  );

  imageMode(CENTER);
  image(owl, width / 2, (height/3) -130, 200, 200);
}

// ------- go to the soundscape page
function createEnter() {
  enter = createButton("Click to enter the soundscape →");
  enter.position(width / 2, height / 2 + 40);
  enter.mousePressed(drawSoundscape);
  enter.center();
}

// ---------end
function drawEnd() {
  // stop all human made sounds
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].type === "H") grid[i][j].sound.stop();
      drawFFTVisual(grid[i][j].fft, width / 2, height / 2 + 50, 0, 2 * sz);
    }
  }

  // format text
  rectMode(CENTER);
  textFont("Bitcount");
  textSize(50);
  fill(0);
  rect(width / 2, height / 2, width, height);
  textAlign(CENTER);
  textWrap(WORD);
  fill(255);
  text("Listen to that for a moment..", width / 2, height / 3, 600);

  if (millis() - endStart > 5000) {
    finalMessage();
  }
  if (millis() - endStart > 8000) {
    createReset();
  }

    for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      drawFFTVisual(grid[i][j].fft, width / 2, height / 3 - 150, 0, 2 * sz);
    }
  }
}

// Get the exact time at which end began
function recordEnd() {
  endStart = millis();
}

// --------reload the page and reset the system
function createReset() {
  reset = createButton("Restart the experience ↩");
  reset.position(width / 2, height / 2);
  reset.center();
  reset.mousePressed(reloadScreen);
}
// reload the screen
function reloadScreen() {
  location.reload();
}
// trigger the last line after the timer goes off
function finalMessage() {
  textFont("Quicksand");
  textWrap(WORD);
  textSize(30);
  text(
    "..and bring back your sensitivity for these spaces",
    width / 2,
    height / 3 + 240,
    600,
  );
  //console.log("final message displayed");
}

// ----------draw the soundscape
function drawSoundscape() {
  state = "soundscape";
  enter.remove(); // remove the button once the

  //UI
  // title
  fill(255);
  stroke(2);
  textFont("Bitcount");
  textSize(60);
  textAlign(CENTER);
  text("SENSITIVE SPACES", width / 2, 80);

  //Graph
  rectMode(CORNER);
  let textX = cols * sz + sz;
  let textY = height / 3;
  textFont("Quicksand");
  textSize(15);
  textAlign(LEFT);
  textWrap(WORD);
  text(
    "There are 5 sounds hidden in the soundscape that occur naturally in the environment. \n Find them to build a natural soundscape.",
    textX-20,
    textY - 120,
    200,
  );
  text(
    "Instructions:\n 1. Scroll to change the focus range of the soundscape \n 2. Click to select the sounds that naturally belong in the environment and keep them playing. Click again if you want to switch the sound off but you might lose track of where the sound was! \n 3. To stop all sounds move out of the soundscape \n \n Hint: There are subtle differences in how the natural-sound carrying cells appear. ",
    textX-20,
    textY + 50,
    200,
  );
  textFont("Bitcount");
  fill(190, 90, 90, 100);
  stroke(255);
  rect(textX -40, textY + 400, 240, 80, 20);
  fill(255);
  text("Sounds found: " + score + " / " + numNSounds, textX-20, textY + 430, 200);

  // draw a grid to create the soundscape with
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // positions of the cells
      let x = i * sz;
      let y = j * sz + gridShiftY * sz;

      // if cell is selected
      if (grid[i][j].cell === 1) {
        noStroke();
        noStroke();
        // draw visualisation
        drawFFTVisual(grid[i][j].fft, x + sz / 2, y + sz / 2, 0, 2 * sz);
      } else {
        // if cell is not selected
        fill(214, 86, 33);
        noStroke();

        // if the type is natural make is blue ---------------
        if (grid[i][j].type === "N") {
          fill(0,0,255,18);
          square(x, y, sz);
        }

        // Calculate position of the center of the cells
        let cellCenterX = x + sz / 2;
        let cellCenterY = y + sz / 2;

        //select cells to play sounds based on mouse position
        let d = dist(mouseX, mouseY, cellCenterX, cellCenterY);

        //sound functionality --------
        if (d < focusRange) {
          // map the volume to how far it is from the center
          let volume = map(d, 0, focusRange, 1, 0.5);
          grid[i][j].sound.setVolume(volume);
          // cells out of focus range
          if (!grid[i][j].playing) {
            grid[i][j].sound.loop(); //stop playing sound
            grid[i][j].playing = true; // change status to false
            //console.log(grid[i][j].playing);
          }
        } else {
          if (grid[i][j].playing) {
            grid[i][j].sound.stop(); //stop playing sound
            grid[i][j].playing = false; // change status to false
            //console.log(grid[i][j].playing);
          }
        }

        // draw the concentric circles
        for (let k = maxCircleSize; k > 5; k -= 15) {
          // restricting movement of circles within the cell
          let circlesXPos = constrain(mouseX, k - k / 2 + x, sz - k / 2 + x);
          let circlesYPos = constrain(mouseY, k - k / 2 + y, sz - k / 2 + y);

          // draw soundscape
          if (dist(mouseX, mouseY, circlesXPos, circlesYPos) < focusRange) {
            //cells within focus range
            // draw stable cells
            noStroke();
            fill(random(360), 60, 100, 100);
            ellipse(circlesXPos, circlesYPos, k * 1.2);
          } else {
            // draw background cells
            noStroke();
            fill(random(360), 60, 100, 10);
            ellipse(circlesXPos, circlesYPos, random(k * 1.7));
            frameRate(20);
          }
        }
      }
    }
  }
}

// --------mouseClicked
function mouseClicked() {
  if (state === "soundscape") {
    // get the index in the grid array based on position
    let i = floor(mouseX / sz);
    let j = floor(mouseY / sz) - gridShiftY;

    //console.log(grid[i][j].cell, i, j);


    // check if within bounds of the grid
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      // if it is on turn it off
      if (grid[i][j].cell == 0 && grid[i][j].type === "N") {
        // select a sound that is natural
        grid[i][j].cell = 1;
        score++;
      } else if (grid[i][j].cell == 1 && grid[i][j].type === "N") {
        // if the sound that had been selected is deselected again
        grid[i][j].cell = 0;
        score--;
      } else if (grid[i][j].cell == 0 && grid[i][j].type === "H") {
        // if human made sound
        fill(10, 100, 100);
        ellipse(i * sz + sz / 2, j * sz + gridShiftY * sz + sz / 2, sz * 2);
      } else {
        //cell has sound
        grid[i][j].cell = 0;
      }
    }
  }
}
// ----------- mouseWheel
function mouseWheel(event) {
  userStartAudio();
  if (event.delta > 0 && focusRange > minFocus) {
    focusRange -= 5;
  } else if (focusRange < maxFocus) {
    focusRange += 5;
  }
}
//draws a visualisation of the sound clip
function drawFFTVisual(fft, posX, posY, minSz, maxSz) {
  let fftWave = fft.waveform();
  noStroke();
  // creating the gradient
  let gradient = drawingContext.createLinearGradient(
    posX,
    posY,
    posX + maxSz,
    posY + maxSz,
  );
  gradient.addColorStop(0, color(map(posX, 0, width, 0, 130), 100, 100, 255));
  gradient.addColorStop(
    0.4,
    color(map(posY, 0, height, 130, 360), 100, 100, 255),
  );

  //asign data to drawing context
  drawingContext.fillStyle = gradient;
  // making the shape
  beginShape();
  // let x = width/2 +r*cos(0);
  // let y = height/2+r*sin(0);
  for (let i = 0; i < fftWave.length; i += 2) {
    // get the angle based on i
    let a = map(i, 0, fftWave.length, 0, TWO_PI);
    // from p5 docs on fft
    let r = map(fftWave[i], -1, 1, minSz, maxSz);
    let x = posX + r * cos(a);
    let y = posY + r * sin(a);
    curveVertex(x, y);
    //console.log(a, r);
  }
  endShape();
}
function stopAllSounds() {
  //stop all sounds
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].sound.stop();
    }
  }
}
