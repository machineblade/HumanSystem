import * as PIXI from "pixi.js";

export default class Human extends PIXI.Container {
  constructor(name = "Unnamed") {
    super();

    this.name = name;
    this.memory = [
      { type: "self", value: this.name, time: Date.now() },
      { type: "created", time: Date.now() },
      { type: "breath_started", active: false, time: Date.now() },
      { type: "piss_count", count: 0, time: Date.now() },
      { type: "shit_count", count: 0, time: Date.now() },
    ];

    this._breathing = false;
    this._breathHandle = null;

    this.health = 100;
    this.energy = 80;
    this.hunger = 0;
    this.thirst = 0;
    this.fatigue = 0;

    this.freakLevel = 0;
    this.bladderLevel = 0;
    this.bowelLevel = 0;
    this.toiletStatus = "none";
  }

  // CORE STATS: GET and SET (no comments)

  setHealth(amount) {
    this.health = Math.max(0, Math.min(100, amount));
    this.memory.push({ type: "health_updated", value: amount, time: Date.now() });
  }

  getHealth() {
    return this.health;
  }

  changeHealth(delta) {
    this.setHealth(this.health + delta);
  }

  setEnergy(amount) {
    this.energy = Math.max(0, Math.min(100, amount));
    this.memory.push({ type: "energy_updated", value: amount, time: Date.now() });
  }

  getEnergy() {
    return this.energy;
  }

  changeEnergy(delta) {
    this.setEnergy(this.energy + delta);
  }

  setHunger(amount) {
    this.hunger = Math.max(0, Math.min(100, amount));
    this.memory.push({ type: "hunger_updated", value: amount, time: Date.now() });
  }

  getHunger() {
    return this.hunger;
  }

  changeHunger(delta) {
    this.setHunger(this.hunger + delta);
  }

  setThirst(amount) {
    this.thirst = Math.max(0, Math.min(100, amount));
    this.memory.push({ type: "thirst_updated", value: amount, time: Date.now() });
  }

  getThirst() {
    return this.thirst;
  }

  changeThirst(delta) {
    this.setThirst(this.thirst + delta);
  }

  setFatigue(amount) {
    this.fatigue = Math.max(0, Math.min(100, amount));
    this.memory.push({ type: "fatigue_updated", value: amount, time: Date.now() });
  }

  getFatigue() {
    return this.fatigue;
  }

  changeFatigue(delta) {
    this.setFatigue(this.fatigue + delta);
  }

  setFreakLevel(amount) {
    this.freakLevel = Math.max(0, amount);
    this.memory.push({ type: "freak_level_updated", value: amount, time: Date.now() });
  }

  getFreakLevel() {
    return this.freakLevel;
  }

  increaseFreakLevel(delta = 1) {
    this.setFreakLevel(this.freakLevel + delta);
  }

  setBladderLevel(amount) {
    this.bladderLevel = Math.max(0, Math.min(100, amount));
    this.memory.push({ type: "bladder_updated", value: amount, time: Date.now() });
  }

  getBladderLevel() {
    return this.bladderLevel;
  }

  changeBladderLevel(delta) {
    this.setBladderLevel(this.bladderLevel + delta);
  }

  setBowelLevel(amount) {
    this.bowelLevel = Math.max(0, Math.min(100, amount));
    this.memory.push({ type: "bowel_updated", value: amount, time: Date.now() });
  }

  getBowelLevel() {
    return this.bowelLevel;
  }

  changeBowelLevel(delta) {
    this.setBowelLevel(this.bowelLevel + delta);
  }

  // PEE / SHIT CORE

  piss() {
    if (this.isBladderFull()) {
      this.setBladderLevel(this.bladderLevel * 0.1);
      this.changeEnergy(-1);
      this.memory.push({ type: "pissed", time: Date.now() });
    }
  }

  pissQuietly() {
    if (this.isBladderFull()) {
      this.piss();
      this.memory.push({ type: "pissed_quietly", time: Date.now() });
    }
  }

  pissHard() {
    if (this.isBladderFull()) {
      this.setBladderLevel(this.bladderLevel * 0.05);
      this.changeEnergy(-2);
      this.memory.push({ type: "pissed_hard", time: Date.now() });
    }
  }

  pissFullEmpty() {
    this.setBladderLevel(0);
    this.memory.push({ type: "pissed_full_empty", time: Date.now() });
  }

  shit(strength = 1.0) {
    if (this.isBowelFull()) {
      this.setBowelLevel(this.bowelLevel * (1 - 0.8 * strength));
      this.changeEnergy(-2);
      this.memory.push({ type: "shitted", strength, time: Date.now() });
    }
  }

  shitLight() {
    this.shit(0.5);
    this.memory.push({ type: "shitted_light", time: Date.now() });
  }

  shitMedium() {
    this.shit(0.8);
    this.memory.push({ type: "shitted_medium", time: Date.now() });
  }

  shitHeavy() {
    this.shit(1.2);
    this.memory.push({ type: "shitted_heavy", time: Date.now() });
  }

  shitVeryHeavy() {
    this.setBowelLevel(this.bowelLevel * 0.05);
    this.changeEnergy(-5);
    this.memory.push({ type: "shitted_very_heavy", time: Date.now() });
  }

  sitOnToilet() {
    this.toiletStatus = "sitting";
    this.memory.push({ type: "sat_on_toilet", time: Date.now() });
  }

  standFromToilet() {
    if (this.toiletStatus === "sitting") {
      this.toiletStatus = "standing";
      this.memory.push({ type: "stood_from_toilet", time: Date.now() });
    }
  }

  flushToilet() {
    if (this.toiletStatus === "sitting" || this.toiletStatus === "standing") {
      this.toiletStatus = "flushed";
      this.memory.push({ type: "flushed_toilet", time: Date.now() });
    }
  }

  useToilet() {
    if (this.toiletStatus === "sitting") {
      if (this.isBladderFull()) {
        this.piss();
      }
      if (this.isBowelFull()) {
        this.shit(0.8);
      }
      this.flushToilet();
    }
  }

  useToiletQuietly() {
    if (this.toiletStatus === "sitting") {
      this.pissQuietly();
      this.shitLight();
    }
  }

  useToiletCasually() {
    if (this.toiletStatus === "sitting") {
      this.piss();
      this.shitMedium();
    }
  }

  useToiletEmergency() {
    if (this.toiletStatus === "sitting") {
      this.pissHard();
      this.shitHeavy();
    }
  }

  // BASIC CONDITIONS

  isBladderFull() {
    return this.bladderLevel > 70;
  }

  isBladderVeryFull() {
    return this.bladderLevel > 90;
  }

  isBowelFull() {
    return this.bowelLevel > 70;
  }

  isBowelVeryFull() {
    return this.bowelLevel > 90;
  }

  isAlive() {
    return this.health > 0;
  }

  die() {
    this.stopBreathing();
    this.setHealth(0);
    this.memory.push({ type: "died", time: Date.now() });
  }

  revive(health = 50) {
    if (this.health <= 0) {
      this.setHealth(health);
      this.startBreathing();
      this.memory.push({ type: "revived", health, time: Date.now() });
    }
  }

  // BREATHING

  breatheIn() {
    this.scale.set(1.05, 1.05);
    this.memory.push({ type: "breathe_in", time: Date.now() });
  }

  breatheOut() {
    this.scale.set(1, 1);
    this.memory.push({ type: "breathe_out", time: Date.now() });
  }

  _doBreathOnce() {
    const start = performance.now();
    this.breatheIn();
    const exhaleAt = start + 500;
    const finishAt = start + 3000;

    const step = (now) => {
      if (now >= exhaleAt && !this._lastExhale) {
        this.breatheOut();
        this._lastExhale = exhaleAt;
      }
      if (now < finishAt && this._breathing) {
        this._breathHandle = requestAnimationFrame(step);
      }
    };

    this._breathHandle = requestAnimationFrame(step);
  }

  startBreathing() {
    if (this._breathing) return;
    this._breathing = true;
    this.memory.push({ type: "breath_started", time: Date.now() });

    const loop = () => {
      if (!this._breathing) return;
      this._doBreathOnce();
      this._breathHandle = setTimeout(() => {
        if (this._breathing) loop();
      }, 3000);
    };

    loop();
  }

  stopBreathing() {
    this._breathing = false;
    if (typeof this._breathHandle === "number") {
      cancelAnimationFrame(this._breathHandle);
      clearTimeout(this._breathHandle);
    }
    this._breathHandle = null;
    this.breatheOut();
    this.memory.push({ type: "breath_stopped", time: Date.now() });
  }

  simulateTick(deltaSeconds = 1) {
    if (!this.isAlive()) return;

    this.changeHunger(deltaSeconds * 0.1);
    this.changeThirst(deltaSeconds * 0.15);
    this.changeFatigue(deltaSeconds * 0.05);
    this.changeBladderLevel(deltaSeconds * 0.2);
    this.changeBowelLevel(deltaSeconds * 0.15);

    this.memory.push({
      type: "tick",
      deltaSeconds,
      health: this.health,
      energy: this.energy,
      hunger: this.hunger,
      thirst: this.thirst,
      fatigue: this.fatigue,
      bladder: this.bladderLevel,
      bowel: this.bowelLevel,
      freakLevel: this.freakLevel,
      time: Date.now(),
    });
  }

  simulateTickQuiet(deltaSeconds = 1) {
    this.simulateTick(deltaSeconds);
    this.memory.push({ type: "tick_quiet", time: Date.now() });
  }

  simulateTickStressy(deltaSeconds = 1) {
    this.simulateTick(deltaSeconds);
    this.increaseFreakLevel(deltaSeconds * 0.1);
  }

  destroy(options) {
    this.stopBreathing();
    super.destroy(options);
    this.memory.push({ type: "destroyed", time: Date.now() });
  }

  // HEALTH / ENERGY STUFF

  heal(amount) {
    this.changeHealth(amount);
  }

  healInstant(amount) {
    this.setHealth(this.health + amount);
  }

  hurt(amount) {
    this.changeHealth(-amount);
  }

  hurtInstant(amount) {
    this.setHealth(this.health - amount);
  }

  boostEnergy(amount) {
    this.changeEnergy(amount);
  }

  drainEnergy(amount) {
    this.changeEnergy(-amount);
  }

  boostHunger(amount) {
    this.changeHunger(amount);
  }

  satisfyHunger(amount) {
    this.changeHunger(-amount);
  }

  boostThirst(amount) {
    this.changeThirst(amount);
  }

  quenchThirst(amount) {
    this.changeThirst(-amount);
  }

  boostFatigue(amount) {
    this.changeFatigue(amount);
  }

  reduceFatigue(amount) {
    this.changeFatigue(-amount);
  }

  // LIFE EVENTS

  eat(foodHunger = -30) {
    this.changeHunger(foodHunger);
    this.changeEnergy(20);
    this.changeBowelLevel(20);
    this.memory.push({ type: "ate", hungerDelta: foodHunger, energyDelta: 20, time: Date.now() });
  }

  eatLight(foodHunger = -15) {
    this.eat(foodHunger);
    this.memory.push({ type: "ate_light", hungerDelta: foodHunger, time: Date.now() });
  }

  eatHeavy(foodHunger = -40) {
    this.eat(foodHunger);
    this.changeBowelLevel(40);
    this.memory.push({ type: "ate_heavy", hungerDelta: foodHunger, time: Date.now() });
  }

  drink(drinkThirst = -30) {
    this.changeThirst(drinkThirst);
    this.changeBladderLevel(20);
    this.memory.push({ type: "drank", thirstDelta: drinkThirst, time: Date.now() });
  }

  drinkLight(drinkThirst = -15) {
    this.drink(drinkThirst);
    this.memory.push({ type: "drank_light", thirstDelta: drinkThirst, time: Date.now() });
  }

  drinkHeavy(drinkThirst = -50) {
    this.drink(drinkThirst);
    this.changeBladderLevel(40);
    this.memory.push({ type: "drank_heavy", thirstDelta: drinkThirst, time: Date.now() });
  }

  drinkAlcohol(intensity = 30) {
    this.increaseFreakLevel(intensity);
    this.changeEnergy(10);
    this.memory.push({ type: "drank_alcohol", intensity, time: Date.now() });
  }

  drinkCoffee() {
    this.changeEnergy(30);
    this.memory.push({ type: "drank_coffee", time: Date.now() });
  }

  drinkWater() {
    this.drink(-25);
    this.memory.push({ type: "drank_water", time: Date.now() });
  }

  drinkSoda() {
    this.drink(-20);
    this.changeEnergy(10);
    this.memory.push({ type: "drank_soda", time: Date.now() });
  }

  // MOVEMENT

  move(x, y) {
    this.x += x;
    this.y += y;
    this.exert(2);
    this.memory.push({ type: "moved", x, y, time: Date.now() });
  }

  moveUp(steps = 1) {
    this.move(0, -steps);
  }

  moveDown(steps = 1) {
    this.move(0, steps);
  }

  moveLeft(steps = 1) {
    this.move(-steps, 0);
  }

  moveRight(steps = 1) {
    this.move(steps, 0);
  }

  moveTo(x, y, durationMs = 1000) {
    const dx = x - this.x;
    const dy = y - this.y;
    const steps = Math.max(1, durationMs / 33);
    const stepX = dx / steps;
    const stepY = dy / steps;

    let step = 0;
    const loop = () => {
      if (step >= steps) return;
      this.x += stepX;
      this.y += stepY;
      step++;
      this._breathHandle = setTimeout(loop, 33);
    };

    loop();
  }

  moveToSafe(x, y, durationMs = 1000) {
    this.moveTo(x, y, durationMs);
    this.memory.push({ type: "move_to_safe", x, y, time: Date.now() });
  }

  moveToToilet(x, y, durationMs = 1000) {
    this.moveTo(x, y, durationMs);
    this.memory.push({ type: "moving_to_toilet", x, y, time: Date.now() });
  }

  // EXERTION / REST

  exert(amount) {
    this.changeEnergy(-amount);
    this.memory.push({ type: "exerted", amount, time: Date.now() });
  }

  exertLight(amount = 5) {
    this.exert(amount);
    this.memory.push({ type: "exerted_light", amount, time: Date.now() });
  }

  exertHard(amount = 15) {
    this.exert(amount);
    this.memory.push({ type: "exerted_hard", amount, time: Date.now() });
  }

  rest(delta = 1) {
    this.changeEnergy(delta);
    this.memory.push({ type: "rested", amount: delta, time: Date.now() });
  }

  restLight(delta = 2) {
    this.rest(delta);
    this.memory.push({ type: "rested_light", amount: delta, time: Date.now() });
  }

  restHeavy(delta = 10) {
    this.rest(delta);
    this.memory.push({ type: "rested_heavy", amount: delta, time: Date.now() });
  }

  // SLEEP

  sleep(durationMs = 3000) {
    this.setFatigue(Math.max(0, this.fatigue - 0.5 * durationMs / 1000));
    this.setEnergy(Math.max(0, this.energy + 0.5 * durationMs / 1000));
    this.memory.push({ type: "slept", durationMs, time: Date.now() });
  }

  nap(durationMs = 1000) {
    this.sleep(durationMs);
    this.memory.push({ type: "napped", durationMs, time: Date.now() });
  }

  sleepLong(durationMs = 8 * 3600 * 1000) {
    this.sleep(durationMs);
    this.memory.push({ type: "slept_long", durationMs, time: Date.now() });
  }

  // FREAK LEVEL STUFF

  panic() {
    this.increaseFreakLevel(30);
    this.changeEnergy(-15);
    this.memory.push({ type: "panic", time: Date.now() });
  }

  panicLight() {
    this.increaseFreakLevel(10);
    this.memory.push({ type: "panic_light", time: Date.now() });
  }

  panicHard() {
    this.increaseFreakLevel(50);
    this.memory.push({ type: "panic_hard", time: Date.now() });
  }

  calmDown() {
    this.setFreakLevel(this.freakLevel * 0.7);
    this.changeEnergy(5);
    this.memory.push({ type: "calmed_down", time: Date.now() });
  }

  calmDownLight() {
    this.setFreakLevel(this.freakLevel * 0.95);
    this.memory.push({ type: "calmed_down_light", time: Date.now() });
  }

  calmDownHard() {
    this.setFreakLevel(Math.max(0, this.freakLevel - 50));
    this.memory.push({ type: "calmed_down_hard", time: Date.now() });
  }

  isFreakedOut() {
    return this.freakLevel > 50;
  }

  isVeryFreakedOut() {
    return this.freakLevel > 80;
  }

  // MEMORY / LOGGING HELPERS

  getLast(type) {
    return this.memory.slice().reverse().find(e => e.type === type);
  }

  getLastPiss() {
    return this.memory.slice().reverse().find(e => e.type === "pissed");
  }

  getLastPissQuietly() {
    return this.memory.slice().reverse().find(e => e.type === "pissed_quietly");
  }

  getLastPissHard() {
    return this.memory.slice().reverse().find(e => e.type === "pissed_hard");
  }

  getLastPissFullEmpty() {
    return this.memory.slice().reverse().find(e => e.type === "pissed_full_empty");
  }

  getLastShit() {
    return this.memory.slice().reverse().find(e => e.type === "shitted");
  }

  getLastShitLight() {
    return this.memory.slice().reverse().find(e => e.type === "shitted_light");
  }

  getLastShitMedium() {
    return this.memory.slice().reverse().find(e => e.type === "shitted_medium");
  }

  getLastShitHeavy() {
    return this.memory.slice().reverse().find(e => e.type === "shitted_heavy");
  }

  getLastShitVeryHeavy() {
    return this.memory.slice().reverse().find(e => e.type === "shitted_very_heavy");
  }

  getLastDrank() {
    return this.memory.slice().reverse().find(e => e.type === "drank");
  }

  getLastDrankLight() {
    return this.memory.slice().reverse().find(e => e.type === "drank_light");
  }

  getLastDrankHeavy() {
    return this.memory.slice().reverse().find(e => e.type === "drank_heavy");
  }

  getLastAte() {
    return this.memory.slice().reverse().find(e => e.type === "ate");
  }

  getLastAteLight() {
    return this.memory.slice().reverse().find(e => e.type === "ate_light");
  }

  getLastAteHeavy() {
    return this.memory.slice().reverse().find(e => e.type === "ate_heavy");
  }

  getLastDrankAlcohol() {
    return this.memory.slice().reverse().find(e => e.type === "drank_alcohol");
  }

  getLastDrankCoffee() {
    return this.memory.slice().reverse().find(e => e.type === "drank_coffee");
  }

  getLastDrankWater() {
    return this.memory.slice().reverse().find(e => e.type === "drank_water");
  }

  getLastDrankSoda() {
    return this.memory.slice().reverse().find(e => e.type === "drank_soda");
  }

  getLastExerted() {
    return this.memory.slice().reverse().find(e => e.type === "exerted");
  }

  getLastExertedLight() {
    return this.memory.slice().reverse().find(e => e.type === "exerted_light");
  }

  getLastExertedHard() {
    return this.memory.slice().reverse().find(e => e.type === "exerted_hard");
  }

  getLastRested() {
    return this.memory.slice().reverse().find(e => e.type === "rested");
  }

  getLastRestedLight() {
    return this.memory.slice().reverse().find(e => e.type === "rested_light");
  }

  getLastRestedHeavy() {
    return this.memory.slice().reverse().find(e => e.type === "rested_heavy");
  }

  getLastSlept() {
    return this.memory.slice().reverse().find(e => e.type === "slept");
  }

  getLastNapped() {
    return this.memory.slice().reverse().find(e => e.type === "napped");
  }

  getLastSleepLong() {
    return this.memory.slice().reverse().find(e => e.type === "slept_long");
  }

  getLastPanic() {
    return this.memory.slice().reverse().find(e => e.type === "panic");
  }

  getLastPanicLight() {
    return this.memory.slice().reverse().find(e => e.type === "panic_light");
  }

  getLastPanicHard() {
    return this.memory.slice().reverse().find(e => e.type === "panic_hard");
  }

  getLastCalmDown() {
    return this.memory.slice().reverse().find(e => e.type === "calmed_down");
  }

  getLastCalmDownLight() {
    return this.memory.slice().reverse().find(e => e.type === "calmed_down_light");
  }

  getLastCalmDownHard() {
    return this.memory.slice().reverse().find(e => e.type === "calmed_down_hard");
  }

  // MEMORY COUNTERS

  countMemoryType(type) {
    return this.memory.filter(e => e.type === type).length;
  }

  countPiss() {
    return this.countMemoryType("pissed");
  }

  countPissQuietly() {
    return this.countMemoryType("pissed_quietly");
  }

  countPissHard() {
    return this.countMemoryType("pissed_hard");
  }

  countPissFullEmpty() {
    return this.countMemoryType("pissed_full_empty");
  }

  countShit() {
    return this.countMemoryType("shitted");
  }

  countShitLight() {
    return this.countMemoryType("shitted_light");
  }

  countShitMedium() {
    return this.countMemoryType("shitted_medium");
  }

  countShitHeavy() {
    return this.countMemoryType("shitted_heavy");
  }

  countShitVeryHeavy() {
    return this.countMemoryType("shitted_very_heavy");
  }

  countDrank() {
    return this.countMemoryType("drank");
  }

  countDrankLight() {
    return this.countMemoryType("drank_light");
  }

  countDrankHeavy() {
    return this.countMemoryType("drank_heavy");
  }

  countDrankAlcohol() {
    return this.countMemoryType("drank_alcohol");
  }

  countDrankCoffee() {
    return this.countMemoryType("drank_coffee");
  }

  countDrankWater() {
    return this.countMemoryType("drank_water");
  }

  countDrankSoda() {
    return this.countMemoryType("drank_soda");
  }

  countAte() {
    return this.countMemoryType("ate");
  }

  countAteLight() {
    return this.countMemoryType("ate_light");
  }

  countAteHeavy() {
    return this.countMemoryType("ate_heavy");
  }

  countExerted() {
    return this.countMemoryType("exerted");
  }

  countExertedLight() {
    return this.countMemoryType("exerted_light");
  }

  countExertedHard() {
    return this.countMemoryType("exerted_hard");
  }

  countRested() {
    return this.countMemoryType("rested");
  }

  countRestedLight() {
    return this.countMemoryType("rested_light");
  }

  countRestedHeavy() {
    return this.countMemoryType("rested_heavy");
  }

  countSlept() {
    return this.countMemoryType("slept");
  }

  countNapped() {
    return this.countMemoryType("napped");
  }

  countSleepLong() {
    return this.countMemoryType("slept_long");
  }

  countPanic() {
    return this.countMemoryType("panic");
  }

  countPanicLight() {
    return this.countMemoryType("panic_light");
  }

  countPanicHard() {
    return this.countMemoryType("panic_hard");
  }

  countCalmDown() {
    return this.countMemoryType("calmed_down");
  }

  countCalmDownLight() {
    return this.countMemoryType("calmed_down_light");
  }

  countCalmDownHard() {
    return this.countMemoryType("calmed_down_hard");
  }

  // STATUS CHECKS

  isHealthy() {
    return this.health > 50;
  }

  isUnhealthy() {
    return this.health < 50;
  }

  isVeryUnhealthy() {
    return this.health < 20;
  }

  isWellRested() {
    return this.fatigue < 20;
  }

  isTired() {
    return this.fatigue > 60;
  }

  isVeryTired() {
    return this.fatigue > 80;
  }

  isHungry() {
    return this.hunger > 50;
  }

  isVeryHungry() {
    return this.hunger > 80;
  }

  isThirsty() {
    return this.thirst > 50;
  }

  isVeryThirsty() {
    return this.thirst > 80;
  }

  // POLICY / RULES

  canPiss() {
    return this.isBladderFull();
  }

  canPissHard() {
    return this.isBladderVeryFull();
  }

  canShit() {
    return this.isBowelFull();
  }

  canShitHeavy() {
    return this.isBowelVeryFull();
  }

  canUseToilet() {
    return this.toiletStatus === "sitting";
  }

  canMove() {
    return this.isAlive() && !this.isSleeping();
  }

  // STAT GETTERS (boilerplate spam)

  getHealthPercent() {
    return this.health / 100;
  }

  getEnergyPercent() {
    return this.energy / 100;
  }

  getHungerPercent() {
    return this.hunger / 100;
  }

  getThirstPercent() {
    return this.thirst / 100;
  }

  getFatiguePercent() {
    return this.fatigue / 100;
  }

  getFreakLevelPercent() {
    return this.freakLevel / 100;
  }

  getBladderPercent() {
    return this.bladderLevel / 100;
  }

  getBowelPercent() {
    return this.bowelLevel / 100;
  }

  // MIN / MAX CLAMPING

  clampStat(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  clampHealth(min, max) {
    this.setHealth(this.clampStat(this.health, min, max));
  }

  clampEnergy(min, max) {
    this.setEnergy(this.clampStat(this.energy, min, max));
  }

  clampHunger(min, max) {
    this.setHunger(this.clampStat(this.hunger, min, max));
  }

  clampThirst(min, max) {
    this.setThirst(this.clampStat(this.thirst, min, max));
  }

  clampFatigue(min, max) {
    this.setFatigue(this.clampStat(this.fatigue, min, max));
  }

  clampFreakLevel(min, max) {
    this.setFreakLevel(this.clampStat(this.freakLevel, min, max));
  }

  clampBladderLevel(min, max) {
    this.setBladderLevel(this.clampStat(this.bladderLevel, min, max));
  }

  clampBowelLevel(min, max) {
    this.setBowelLevel(this.clampStat(this.bowelLevel, min, max));
  }

  // SCALE / NORMALIZE

  normalizeHealth() {
    this.clampHealth(0, 100);
  }

  normalizeEnergy() {
    this.clampEnergy(0, 100);
  }

  normalizeHunger() {
    this.clampHunger(0, 100);
  }

  normalizeThirst() {
    this.clampThirst(0, 100);
  }

  normalizeFatigue() {
    this.clampFatigue(0, 100);
  }

  normalizeFreakLevel() {
    this.clampFreakLevel(0, 100);
  }

  normalizeBladderLevel() {
    this.clampBladderLevel(0, 100);
  }

  normalizeBowelLevel() {
    this.clampBowelLevel(0, 100);
  }

  // RESET / DEFAULTS

  resetHealth() {
    this.setHealth(100);
  }

  resetEnergy() {
    this.setEnergy(80);
  }

  resetHunger() {
    this.setHunger(0);
  }

  resetThirst() {
    this.setThirst(0);
  }

  resetFatigue() {
    this.setFatigue(0);
  }

  resetFreakLevel() {
    this.setFreakLevel(0);
  }

  resetBladderLevel() {
    this.setBladderLevel(0);
  }

  resetBowelLevel() {
    this.setBowelLevel(0);
  }

  resetToDefaults() {
    this.resetHealth();
    this.resetEnergy();
    this.resetHunger();
    this.resetThirst();
    this.resetFatigue();
    this.resetFreakLevel();
    this.resetBladderLevel();
    this.resetBowelLevel();
  }

  // LOG / DUMP

  dumpMemoryToConsole() {
    console.log("Human Memory:", this.memory);
  }

  dumpMemoryToConsoleLastN(n = 10) {
    console.log("Last N Memory:", this.memory.slice(-n));
  }

  dumpMemoryTypes() {
    const types = {};
    this.memory.forEach(e => {
      if (types[e.type] === undefined) types[e.type] = 0;
      types[e.type]++;
    });
    console.log("Memory types:", types);
  }

  dumpMemoryByType(type) {
    console.log("Memory for type", type, ":", this.memory.filter(e => e.type === type));
  }

  // FILTERED LISTS

  getPissEvents() {
    return this.memory.filter(e => e.type.includes("piss"));
  }

  getShitEvents() {
    return this.memory.filter(e => e.type.includes("shit"));
  }

  getDrinkEvents() {
    return this.memory.filter(e => e.type.includes("drank"));
  }

  getEatEvents() {
    return this.memory.filter(e => e.type.includes("ate"));
  }

  getExertEvents() {
    return this.memory.filter(e => e.type.includes("exert"));
  }

  getRestEvents() {
    return this.memory.filter(e => e.type.includes("rest"));
  }

  getSleepEvents() {
    return this.memory.filter(e => e.type.includes("slept") || e.type.includes("nap"));
  }

  getPanicEvents() {
    return this.memory.filter(e => e.type.includes("panic"));
  }

  getCalmDownEvents() {
    return this.memory.filter(e => e.type.includes("calmed_down"));
  }

  // BASIC DEBUG HELPERS

  debugHealth() {
    console.log("Health:", this.getHealth());
  }

  debugEnergy() {
    console.log("Energy:", this.getEnergy());
  }

  debugHunger() {
    console.log("Hunger:", this.getHunger());
  }

  debugThirst() {
    console.log("Thirst:", this.getThirst());
  }

  debugFatigue() {
    console.log("Fatigue:", this.getFatigue());
  }

  debugFreakLevel() {
    console.log("FreakLevel:", this.getFreakLevel());
  }

  debugBladderLevel() {
    console.log("BladderLevel:", this.getBladderLevel());
  }

  debugBowelLevel() {
    console.log("BowelLevel:", this.getBowelLevel());
  }

  // FULL DEBUG

  debugFull() {
    this.debugHealth();
    this.debugEnergy();
    this.debugHunger();
    this.debugThirst();
    this.debugFatigue();
    this.debugFreakLevel();
    this.debugBladderLevel();
    this.debugBowelLevel();
  }

  // SAVE / RESTORE STUBS (you can plug real storage later)

  saveToJSON() {
    return JSON.stringify({
      stats: {
        health: this.health,
        energy: this.energy,
        hunger: this.hunger,
        thirst: this.thirst,
        fatigue: this.fatigue,
        freakLevel: this.freakLevel,
        bladderLevel: this.bladderLevel,
        bowelLevel: this.bowelLevel,
      },
      toiletStatus: this.toiletStatus,
      memory: this.memory,
    });
  }

  restoreFromJSON(jsonStr) {
    const data = JSON.parse(jsonStr);
    this.health = data.stats.health || 100;
    this.energy = data.stats.energy || 80;
    this.hunger = data.stats.hunger || 0;
    this.thirst = data.stats.thirst || 0;
    this.fatigue = data.stats.fatigue || 0;
    this.freakLevel = data.stats.freakLevel || 0;
    this.bladderLevel = data.stats.bladderLevel || 0;
    this.bowelLevel = data.stats.bowelLevel || 0;
    this.toiletStatus = data.toiletStatus || "none";
    this.memory = data.memory || [];
  }
}