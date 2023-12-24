socket = io("http://10.40.200.174:3001")
socket.on("message",(score) => {
  console.log(score)
})



const paper = document.getElementById("canvas");
const pen = paper.getContext("2d");
const startTime = new Date().getTime();
let isGameOver = false;
let isPaused = false;
let score = 0;
const pixel = 10;
const frameDivider = 3;
let frameCount = 0;

let snakePosList = [
  [300, 200],
  [310, 200],
  [320, 200]
];
let dotList = [];
let direction = "R";
function handleKey(e) {
  if (e.key === "p") {
    if (isPaused) {
      isPaused = false;
      draw();
    } else {
      isPaused = true;
    }
  } else if (e.key === "r") {
    if (isGameOver) {
      console.log("Game restarted");
      score = 0;
      frameCount = 0;
      snakePosList = [
        [300, 200],
        [310, 200],
        [320, 200]
      ];
      dotList = [];
      direction = "R";
      draw();
    }
  } else {
    let dir = e.key[5];
    socket.emit("direction",dir)
    // Eviter les 180° :
    if (direction === "U") {
      if (dir === "D") {
        dir = "U";
      }
    }
    if (direction === "D") {
      if (dir === "U") {
        dir = "D";
      }
    }
    if (direction === "L") {
      if (dir === "R") {
        dir = "L";
      }
    }
    if (direction === "R") {
      if (dir === "L") {
        dir = "R";
      }
    }
    direction = dir;
  }
}

const dotCollision = (rayonDot) => {
  // Verifie si le snake entre dans le rayon d'un DOT
  if (dotList.length > 0) {
    snakePos = snakePosList[snakePosList.length - 1];
    for (let dotPos in dotList) {
      let distance = Math.sqrt(
        (snakePos[0] - dotList[dotPos][0]) ** 2 +
          (snakePos[1] - dotList[dotPos][1]) ** 2
      );
      if (distance <= rayonDot) {
        dotList.splice(dotPos, 1);
        score += 10;
        // socket.emit("score",score)
        return true;
      }
    }
  }
  return false;
};

const newPosList = (rayonDot) => {
  // Crer suprime le dernier pixel et ajoute le suivant pour faire avancer le snake
  const isCollision = dotCollision(rayonDot);
  if (!isCollision) {
    // Si collision, on ne suprime pas le dernier element de la liste => Grandit le snake
    snakePosList.shift();
  }
  nextX =
    direction === "R"
      ? snakePosList[snakePosList.length - 1][0] + pixel
      : direction === "L"
      ? snakePosList[snakePosList.length - 1][0] - pixel
      : snakePosList[snakePosList.length - 1][0];
  nextY =
    direction === "U"
      ? snakePosList[snakePosList.length - 1][1] - pixel
      : direction === "D"
      ? snakePosList[snakePosList.length - 1][1] + pixel
      : snakePosList[snakePosList.length - 1][1];

  snakePosList.push([nextX, nextY]);
  // socket.emit("snakePosList",snakePosList)
};
const gameOver = (space) => {
  snakeHead = snakePosList[snakePosList.length - 1];
  // touche les bord de la map
  xDeathList = [paper.width * space, (1 - space) * paper.width];
  yDeathList = [paper.height * space, (1 - space) * paper.height];
  if (snakeHead[0] <= xDeathList[0] || snakeHead[0] >= xDeathList[1]) {
    return true;
  }
  if (snakeHead[1] <= yDeathList[0] || snakeHead[1] >= yDeathList[1]) {
    return true;
  }

  // Se touche lui meme => 2 fois la meme position
  for (let pos = 0; pos < snakePosList.length - 2; pos++) {
    if (snakePosList[pos][0] === snakeHead[0]) {
      if (snakePosList[pos][1] === snakeHead[1]) {
        return true;
      }
    }
  }
  // Si tout va bien:
  return false;
};

const draw = () => {
  frameCount++;
  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;
  const space = 0.05;
  const rayonDot = pixel;
  const txt = () => {
    const text = `SCORE : ${score}`;
    pen.font = "20px Roboto";
    pen.fillStyle = "white";
    const x = paper.width * space * 1.5;
    const y = paper.height * space * 2.5;
    pen.fillText(text, x, y);
  };
  const rectangle = (space) => {
    // Dessine les bords de la map
    pen.lineWidth = 2;
    pen.setLineDash([30, 5]);
    pen.strokeStyle = "red";

    pen.beginPath();
    pen.moveTo(space * paper.width, space * paper.height);
    pen.lineTo((1 - space) * paper.width, space * paper.height);
    pen.stroke();
    pen.beginPath();
    pen.moveTo((1 - space) * paper.width, space * paper.height);
    pen.lineTo((1 - space) * paper.width, (1 - space) * paper.height);
    pen.stroke();
    pen.beginPath();
    pen.moveTo((1 - space) * paper.width, (1 - space) * paper.height);
    pen.lineTo(space * paper.width, (1 - space) * paper.height);
    pen.stroke();
    pen.beginPath();
    pen.moveTo(space * paper.width, space * paper.height);
    pen.lineTo(space * paper.width, (1 - space) * paper.height);
    pen.stroke();
  };
  rectangle(space);

  const dotSpawn = () => {
    //Créer les dots de manière random
    const width = Math.floor(
      Math.random() * (paper.width * (1 - 4 * space)) + paper.width * 2 * space
    );
    const height = Math.floor(
      Math.random() * (paper.height * (1 - 4 * space)) +
        paper.height * 2 * space
    );
    dotList.push([width, height]);
  };
  const deathScreen = () => {
    // Affichage du Game Over
    rectangle();
    pen.font = "60px Roboto";
    pen.fillStyle = "white";
    pen.fillText(`GAME OVER`, paper.width * 0.35, paper.height * 0.3);
    pen.font = "40px Roboto";
    pen.fillStyle = "white";
    pen.fillText(`SCORE : ${score}`, paper.width * 0.4, paper.height * 0.45);
    pen.font = "30px Roboto";
    pen.fillStyle = "white";
    pen.fillText(
      `PRESS "R" TO RESTART`,
      paper.width * 0.35,
      paper.height * 0.65
    );
  };
  const affichage = () => {
    pen.lineWidth = 6;
    pen.setLineDash([]);
    for (let pos = 0; pos < snakePosList.length - 1; pos++) {
      pen.beginPath();
      pen.moveTo(snakePosList[pos][0], snakePosList[pos][1]);
      pen.lineTo(snakePosList[pos + 1][0], snakePosList[pos + 1][1]);
      pen.stroke();
    }
    if (dotList.length > 0) {
      for (let dot of dotList) {
        pen.beginPath();
        pen.arc(dot[0], dot[1], rayonDot, 0, 2 * Math.PI);
        pen.fillStyle = "white";
        pen.fill();
      }
    }
  };
  if (frameCount % frameDivider === 0) {
    // Permet de ralentire le snake
    newPosList(rayonDot);
  }
  if (frameCount % (frameDivider * 60) === 0) {
    dotSpawn();
  }
  affichage();

  isGameOver = gameOver(space);
  if (!isGameOver) {
    txt();
    if (isPaused) {
      pen.font = "60px Roboto";
      pen.fillStyle = "white";
      pen.fillText(`PAUSE`, paper.width * 0.35, paper.height * 0.4);
    } else {
      requestAnimationFrame(draw);
    }
  } else {
    deathScreen();
  }
};
draw();

document.addEventListener("keydown", handleKey);

//Ajouter un bonus qui reduit la vitesse
// faire augmenter la vitesse petit a petit
