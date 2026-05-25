import * as PIXI from "pixi.js";

export default class Human extends PIXI.Container {
  constructor(name) {
    super();

    this.name = name;
    this.breathingInterval = null;
  };
  breatheIn() {

  }
  breatheOut() {

  }
  breathe() {
    this.breatheIn();
    setTimeout(this.breatheOut, 500);
  }
  startBreathing() {
    this.breathingInterval = setInterval(this.breathe(), 3000);
  }
  suicide() {
    clearInterval(this.breathingInterval)
  }
}