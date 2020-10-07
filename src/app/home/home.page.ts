import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _top: number = 80;
  private _width: number = 0;
  private _height: number = 0;
  private _squareSize: number;
  private _heightToWidthRatio: number = 1.9;
  private _numberOfSquaresHorizontally: number = 40;
  private _left: number = 0;
  private _canvasBorderWidth: number = 2;
  private _gameArray = [];
  private _numberOfSquaresVertically: number;
  private _moveJ: number = 1;
  private _moveI: number = 0;
  private _headI: number;
  private _headJ: number;
  private _headValue: number;
  private _playing: boolean = false;
  private _canTurn: boolean;
  private _numberOfTreats: number = 0;
  private _gameFinished: boolean = false;

  constructor(
    private _platform: Platform,

  ) { }


  ngOnInit(): void {

    //window.screen.orientation.lock('portrait');


    this.setPlayground();
    this.initArray();
    this.initSnake();
    this.handleDarkTheme();
    this.timers();


  }

  setPlayground() {
    this._platform.ready().then(() => {
      this._width = this._platform.width() - 10;
      this._height = this._platform.height() - this._top;
      if (this._width * this._heightToWidthRatio > this._height) {
        this._width = Math.floor(this._height / this._heightToWidthRatio);
        this._height = this._width * this._heightToWidthRatio;
      } else {
        this._height = Math.floor(this._width * this._heightToWidthRatio);
        this._width = this._height / this._heightToWidthRatio;
      }
      this._squareSize = Math.floor(this._width / this._numberOfSquaresHorizontally);
      this._width = this._squareSize * this._numberOfSquaresHorizontally;
      this._height = this._width * this._heightToWidthRatio;
      this._left = ((this._platform.width() - this._width) / 2) - this._canvasBorderWidth;
      this.setCanvas();
      this.drawCanvas();
    });
  }

  setCanvas() {
    this._canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this._canvas.setAttribute('width', this._width.toString() + 'px');
    this._canvas.setAttribute('height', this._height.toString() + 'px');
    this._canvas.setAttribute('top', this._top.toString() + 'px');
    this._canvas.style.left = this._left.toString() + 'px';
    this._ctx = this._canvas.getContext("2d");
  }

  handleDarkTheme() {
    const toggle = document.querySelector('#themeToggle');
    toggle.addEventListener('ionChange', (ev) => {
      document.body.classList.toggle('dark', ev.detail.checked);
    });
  }

  turnLeft() {
    if (this._canTurn) {
      if (this._moveI === 1) {
        this._moveI = 0;
        this._moveJ = 1;
      } else if (this._moveJ === 1) {
        this._moveJ = 0;
        this._moveI = -1;
      } else if (this._moveI === -1) {
        this._moveI = 0;
        this._moveJ = -1;
      } else if (this._moveJ === -1) {
        this._moveJ = 0;
        this._moveI = 1;
      }
      this._canTurn = false
    }

  }
  turnRight() {
    if (this._canTurn) {
      if (this._moveI === 1) {
        this._moveI = 0;
        this._moveJ = -1;
      } else if (this._moveJ === -1) {
        this._moveJ = 0;
        this._moveI = -1;
      } else if (this._moveI === -1) {
        this._moveI = 0;
        this._moveJ = 1;
      } else if (this._moveJ === 1) {
        this._moveJ = 0;
        this._moveI = 1;
      }
      this._canTurn = false
    }
  }

  initArray() {
    this._numberOfSquaresVertically = this._numberOfSquaresHorizontally * this._heightToWidthRatio;
    if (this._gameArray.length > 0) { //clear array for new game
      for (let i = 0; i < this._numberOfSquaresVertically; i++) {
        for (let j = 0; j < this._numberOfSquaresHorizontally; j++) {
          this._gameArray[i][j] = 0;
          this.initSnake();
        }
      }
    } else {
      for (let i = 0; i < this._numberOfSquaresVertically; i++) {
        let rowArray = new Array();
        for (let j = 0; j < this._numberOfSquaresHorizontally; j++) {
          rowArray.push(0);
        }
        this._gameArray.push(rowArray);
      }
    }
  }

  initSnake() {
    this._numberOfTreats = 0;
    let i = Math.floor(this._numberOfSquaresVertically / 2)-8;
    let x = 1;
    
    for (let j = Math.floor((this._numberOfSquaresHorizontally / 2) - 3); j < Math.floor((this._numberOfSquaresHorizontally / 2) + 3); j++) {
      if (x === 6) {
        this._headI = i;
        this._headJ = j;     
        this._headValue = x;   
      }
      this._gameArray[i][j] = x;
      x++;
    }

  }

  drawCanvas() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    for (let i = 0; i < this._numberOfSquaresVertically; i++) {
      for (let j = 0; j < this._numberOfSquaresHorizontally; j++) {
        if (this._gameArray[i][j] > 0) {
          this._ctx.fillStyle = 'rgb(68, 33, 18)';
          this._ctx.fillRect(j * this._squareSize, i * this._squareSize, this._squareSize, this._squareSize);
          this._ctx.strokeStyle = 'rgb(35, 13, 0)';
          this._ctx.strokeRect(j * this._squareSize, i * this._squareSize, this._squareSize, this._squareSize);
        } else if (this._gameArray[i][j] === -1) {
          this._ctx.fillStyle = 'rgb(180, 0, 0)';
          this._ctx.fillRect(j * this._squareSize, i * this._squareSize, this._squareSize, this._squareSize);
          this._ctx.strokeStyle = 'rgb(0,0,0)';
          this._ctx.strokeRect(j * this._squareSize, i * this._squareSize, this._squareSize, this._squareSize);
        }


      }
    }
  }
  moveSnake() {
    if (this._headI + this._moveI === this._numberOfSquaresVertically) { // past top border
      this._headI = 0;
    } else if (this._headI + this._moveI < 0) { // past bottom border
      this._headI = this._numberOfSquaresVertically - 1;
    }
    else if (this._headJ + this._moveJ === this._numberOfSquaresHorizontally) { // past right border
      this._headJ = 0;
    } else if (this._headJ + this._moveJ < 0) { // past left border
      this._headJ = this._numberOfSquaresHorizontally - 1;
    } else { // move without passing border
      this._headJ += this._moveJ;
      this._headI += this._moveI;
    }
    if (this._gameArray[this._headI][this._headJ] === 0) {
      for (let i = 0; i < this._numberOfSquaresVertically; i++) {
        for (let j = 0; j < this._numberOfSquaresHorizontally; j++) {
          if (this._gameArray[i][j] > 0) {
            this._gameArray[i][j]--;
          }
        }
      }
      this._gameArray[this._headI][this._headJ] = this._headValue;
    } else if (this._gameArray[this._headI][this._headJ] < 0) { // snake ate something
      this._headValue++;
      this._gameArray[this._headI][this._headJ] = this._headValue;
      this._numberOfTreats--;
    } else if (this._gameArray[this._headI][this._headJ] > 0) { //snake bit self
      this.gameOver()
    }
  }

  gameOver(){
    this._playing = false;
    this._gameFinished = true;
  }
  timers() {

    setInterval(() => {
      if (this._playing) {
        this.generateTreats();
        this.drawCanvas();
      }
    }, 1000 / 60);

    setInterval(() => {
      if (this._playing) {
        this.moveSnake();
        this._canTurn = true;
      }
    }, 1000 / 12);
  }

  generateTreats() {
    if (this._numberOfTreats < 2) {
      let randomI = Math.floor((Math.random() * this._numberOfSquaresVertically));
      let randomJ = Math.floor((Math.random() * this._numberOfSquaresHorizontally));
      if (this._gameArray[randomI][randomJ] === 0) {
        this._gameArray[randomI][randomJ] = -1;
        this._numberOfTreats++;
      }
    }
  }
  getHeadValue() {
    return this._headValue;
  }

  pause(){
    if(this._playing){
    this._playing = false;
    } else {      
      if(this._gameFinished) {
        this.initArray();
        this._gameFinished = false;
      }
      this._playing = true;
    }
    console.log(this._gameFinished)
    console.log(this._playing)
  }

  restart(){
    this._playing = false;
    this.initArray();
    this.drawCanvas();
  }

  getIsPlaying():boolean {
    return this._playing
  }
}
