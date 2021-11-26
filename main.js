const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor() {
    this.field = [];
    this.fieldWidth = 0;
    this.fieldHeight = 0;
    this.playerPositionX = 0;
    this.playerPositionY = 0;
    this.hatPosition = [];
    this.holePositions = [];
    this.level = 1;
  };

  generateField(y = 5, x = 5, difficulty = this.level) {

    let field = []

    // preset difficulty to field size
    if (difficulty < 1) {
      difficulty = 1;
    }

    if (x === 5 && y === 5) {
      x = difficulty * x;
      y = difficulty * y;
    };

    this.difficulty = difficulty;
    this.fieldWidth = x;
    this.fieldHeight = y;

    // count items in array
    const numberOf = (item, array) => {
    let count = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i] === item) {
        count += 1;
      }
    }
    return count;
    };

    // field characters
    for (let i = 0; i < y; i++) {
      let row = [];
      for (let j = 0; j < x; j++) {
        row.push(fieldCharacter);
      };
    field.push(row);
    };

    // holes
    const holesInX = Math.ceil(x * (difficulty / 10));
    for (let i = 0; i < y; i++) {
      while (numberOf(hole, field[i]) < holesInX) {
        let rand = Math.floor(Math.random() * x);
        if (field[i][rand] !== hole) {
          field[i][rand] = hole;
        };
      };
    };

    // find hole positions
    let holePositions = [];
    let searchFrom = 0;
    for (let i = 0; i < field.length; i++) {
      searchFrom = 0
      for (let j = 0; j < holesInX; j++) {
        let holeAt = field[i].indexOf(hole, searchFrom);
        holePositions.push([i, holeAt]);
        searchFrom = holeAt + 1;
      };
    };
    this.holePositions = holePositions;

    // hat
    let isFinished = false;
    let hatX = 0;
    let hatY = 0;
    while (!isFinished) {
      let isTrue = true;
      let randX = Math.floor(Math.random() * x);
      let randY = 0;
      while (randY < Math.floor(y * .66)) {
        randY = Math.floor(Math.random() * y);
      };
      for (let i = 0; isTrue === true && i < holePositions.length; i++) {
        if (holePositions[i][0] === randY && holePositions[i][1] === randX) {
          isTrue = false
        };
        if (i === holePositions.length -1 && isTrue === true) {
          isFinished = true;
        };
      };
      hatX = randX;
      hatY = randY;
    };
    field[hatY][hatX] = hat;
    this.hatPosition[0] = hatY;
    this.hatPosition[1] = hatX;

    // path start
    let finished = false;
    let pathX = 0;
    while (!finished) {
      let isTrue = true;
      let randX = Math.floor(Math.random() * x);
      for (let i = 0; isTrue === true && i < holePositions.length; i++) {
        if (holePositions[0][i] === randX) {
          isTrue = false
        };
        if (i === holePositions.length -1 && isTrue === true) {
          finished = true;
        };
      };
      pathX = randX;
    };
    field[0][pathX] = pathCharacter;
    this.playerPositionY = 0;
    this.playerPositionX = field[0].indexOf(pathCharacter);
    
    //finished generating field
    this.field = field;
  };

  print() {
    const currentField = this.field.map(row => {
      return row.join('');
    }).join('\n');
    console.log(currentField);
  };

  // is in bounds
  isInBounds() {
    const boundaryX = this.fieldWidth - 1;
    const boundaryY = this.fieldHeight - 1;
    if (this.playerPositionX < 0 || this.playerPositionX > boundaryX || this.playerPositionY < 0 || this.playerPositionY > boundaryY) {
      return false;
    } else {
      return true;
    };
  };

  // // is in hole
  isInHole() {
    let isTrue = false;
    this.holePositions.forEach(position => {
      if (this.playerPositionY === position[0] && this.playerPositionX === position[1]) {
        isTrue = true;
      };
    });
    return isTrue;
  };

  // // has reached hat
  hasReachedHat() {
    if (this.playerPositionY === this.hatPosition[0] && this.playerPositionX === this.hatPosition[1]) {
      return true;
    } else {
      return false;
    };
  };

  // movement prompt
  move() {
    console.log('Up = W, Left = A, Down = S, Right = D');
    let move = prompt('Which way?: ')
    move = move.toLowerCase();
    if (move === 'w' && this.canMove(true, false)) {
      this.playerPositionY -= 1;
    } else if (move === 'a' && this.canMove(false, false)) {
      this.playerPositionX -= 1;
    } else if (move === 's' && this.canMove(true, true)) {
      this.playerPositionY += 1;
    } else if (move === 'd' && this.canMove(false, true)) {
      this.playerPositionX += 1;
    } else {
      console.log('Invalid Move');
    };
  };

  // can move
  canMove(isY, isPlus) {
    if (isY && isPlus) {
      if (this.field[this.playerPositionY + 1][this.playerPositionX] === pathCharacter) {
        return false;
      } else {
        return true;
      };
    } else if (isY && !isPlus) {
      if (this.field[this.playerPositionY - 1][this.playerPositionX] === pathCharacter) {
        return false;
      } else {
        return true;
      };
    } else if (!isY && isPlus) {
      if (this.field[this.playerPositionY][this.playerPositionX + 1] === pathCharacter) {
        return false;
      } else {
        return true;
      };
    } else {
      if (this.field[this.playerPositionY][this.playerPositionX - 1] === pathCharacter) {
        return false;
      } else {
        return true;
      };
    };
  };

  drawPath() {
    this.field[this.playerPositionY][this.playerPositionX] = pathCharacter;
  }

  startGame() {
    let gameOver = false;
    let level = 1;
    let customHeight = 5;
    let customWidth = 5;
    while (!gameOver) {
      let levelComplete = false;
      this.generateField(customHeight, customWidth, this.level);
      if (this.fieldIsSolvable() === true) {
        console.log('Level ' + level);
        while (!levelComplete) {
            this.print();
            this.move();
            let inBounds = this.isInBounds();
            let inHole = this.isInHole();
            let foundHat = this.hasReachedHat();
            if (!inBounds ) {
              console.log('You are out of bounds! GAME OVER!');
              gameOver = true;
              return;
            } else if (inHole) {
              console.log('You fell down a hole! GAME OVER!');
              gameOver = true;
              return;
            } else if (foundHat) {
              console.log('You completed the level');
              levelComplete = true;
              if (level < 5) {
                this.level += 1;
                level += 1;
              } else if (level === 5) {
                customHeight = 25;
                customWidth = 50;
                level += 1
              } else if (level > 5 && level < 10) {
                customHeight += 5;
                customWidth += 10;
                level += 1;
              } else if (level >= 10 && level < 15) {
                this.level = 3;
                customHeight = 60;
                customWidth += 20;
                level += 1;
              } else if (level >= 15 && level < 20) {
                this.level += .5;
                customHeight = 60;
                customWidth += 10;
                level += 1;
              } else if (level === 20) {
                console.log('Congratlations, YOU WIN!!!');
                gameOver = true;
                return;
              }
              
              
            };
            if (!levelComplete && !gameOver){
              this.drawPath();
            };
        } 
      };
    };
  };

  restartGame() {
    let restart = prompt('Would you like to play again? (Y or N): ');
    restart = restart.toLowerCase();
    if (restart === 'y') {
        this.startGame();
    };
  };

  fieldIsSolvable() {
    let startPosition = [this.playerPositionY, this.playerPositionX];
    let endPosition = this.hatPosition;
    let holePositions = this.holePositions;
    let gridStart = [0, 0];
    let gridEnd = [this.fieldHeight -1, this.fieldWidth - 1];
    
    const findAllSpaces = (gridEnd) => {
      const allSpaces = []
      for (let i = 0; i <= gridEnd[0]; i++) {
        for (let j = 0; j <= gridEnd[1]; j++) {
          allSpaces.push([i, j]);
        };
      };
      return allSpaces;
    };

    // console.log(holePositions)
    
    const findMovableSpaces = (allSpaces, holePositions) => {
      let movableSpaces = [];
      for (let i = 0; i < allSpaces.length; i++) {
        let match = false;
        for (let j = 0; j <holePositions.length; j++) {
          if (allSpaces[i][0] === holePositions[j][0] && allSpaces[i][1] === holePositions[j][1]) {
            match = true;
          };
        };
        if (!match) {
          movableSpaces.push(allSpaces[i]);
        };
      }
      return movableSpaces;
    };

    const allSpaces = findAllSpaces(gridEnd);
    const movableSpaces = findMovableSpaces(allSpaces, holePositions);
    let visitedSpaces = [startPosition];

    const compareArrayListWithArray = (arrayList, array) => {
        let match = false;
        arrayList.forEach(arr => {
            // console.log(arr, array)
            if (arr[0] === array[0] && arr[1] === array[1]) {
                match = true;
            };
        });
        return match;
    };
    
    for (let i = 0; i < visitedSpaces.length; i++) {
        let currentSpace = visitedSpaces[i].slice();
        let newSpace;
        if (visitedSpaces[i][0] - 1 >= 0) {
            newSpace = currentSpace
            newSpace[0] = newSpace[0] - 1;
            if (compareArrayListWithArray(movableSpaces, newSpace) && !compareArrayListWithArray(visitedSpaces, newSpace)) {
                visitedSpaces.push(newSpace);
            }
        }
        currentSpace = visitedSpaces[i].slice();
        newSpace;
        if (visitedSpaces[i][1] - 1 >= 0) {
            newSpace = currentSpace
            newSpace[1] = newSpace[1] - 1;
            if (compareArrayListWithArray(movableSpaces, newSpace) && !compareArrayListWithArray(visitedSpaces, newSpace)) {
                visitedSpaces.push(newSpace);
            }
        }
        currentSpace = visitedSpaces[i].slice();
        newSpace;
        if (visitedSpaces[i][0] + 1 < this.fieldHeight) {
            newSpace = currentSpace
            newSpace[0] = newSpace[0] + 1;
            if (compareArrayListWithArray(movableSpaces, newSpace) && !compareArrayListWithArray(visitedSpaces, newSpace)) {
                visitedSpaces.push(newSpace);
            }
        }
        currentSpace = visitedSpaces[i].slice();
        newSpace;
        if (visitedSpaces[i][1] + 1 < this.fieldWidth) {
            newSpace = currentSpace
            newSpace[1] = newSpace[1] + 1;
            if (compareArrayListWithArray(movableSpaces, newSpace) && !compareArrayListWithArray(visitedSpaces, newSpace)) {
                visitedSpaces.push(newSpace);
            }
        } 
        const endPositionVisited = compareArrayListWithArray(visitedSpaces, this.hatPosition); 
        if (endPositionVisited) {
            console.log(endPositionVisited)
            return endPositionVisited;
        }
    }
  }
};


const playGame = new Field();
playGame.startGame();

// playGame.generateField();
// playGame.print();
// console.log(playGame.field)
// playGame.move();

// console.log(playGame.playerPositionY, playGame.playerPositionX)
// console.log(playGame.hatPosition);
// console.log(playGame.holePositions);


// console.log('Testing');