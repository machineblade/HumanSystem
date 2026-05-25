import * as PIXI from "pixi.js";

export default class Human extends PIXI.Container {
  constructor(name = "Unnamed") {
    super();
    this.name = name;

    this.memory = [this.name];

    this._breathing = false;
    this._breathHandle = null;
    this._lastToggle = 0;
    this._breathPhaseMs = 500;
    this._cycleMs = 3000;

    this.health = 100;
    this.energy = 80;
    this.hunger = 0;
    this.thirst = 0;
    this.fatigue = 0;
    this.mood = 50;

    this.airQuality = 1.0;
    this.temperature = 22;
    this.gravity = 1.0;

    this.isMoving = false;
    this.isEating = false;
    this.isSleeping = false;
    this.isTalking = false;
    this.isWorking = false;

    this.relationships = new Map();
    this.friends = new Set();
    this.enemies = new Set();

    this.statuses = new Set();

    this.log = [];

    this.freakLevel = 0;          // weirdness / chaos level
    this.urgency = 0;             // overall bodily urgency (bladder + bowel)
    this.bladderLevel = 0;        // 0–100, 100 = bursting
    this.bowelLevel = 0;          // 0–100, 100 = ready to crap
    this.toiletStatus = "none";   // "sitting", "standing", "flushed"
  }

  // BASIC LIFELIKE STATS
  isAlive() {
    return this.health > 0;
  }

  die() {
    this.stopBreathing();
    this.setHealth(0);
    this.logAction("died");
  }

  revive(health = 50) {
    if (this.health <= 0) {
      this.setHealth(health);
      this.startBreathing();
      this.logAction("revived");
    }
  }

  setHealth(amount) {
    this.health = Math.max(0, Math.min(100, amount));
  }

  changeHealth(delta) {
    this.setHealth(this.health + delta);
  }

  heal(amount) {
    this.changeHealth(amount);
  }

  hurt(amount) {
    this.changeHealth(-amount);
  }

  setEnergy(amount) {
    this.energy = Math.max(0, Math.min(100, amount));
  }

  changeEnergy(delta) {
    this.setEnergy(this.energy + delta);
  }

  exert(amount) {
    this.changeEnergy(-amount);
    this.logAction("exerted", { amount });
  }

  rest(delta = 1) {
    this.changeEnergy(delta);
    this.logAction("rested", { delta });
  }

  setHunger(amount) {
    this.hunger = Math.max(0, Math.min(100, amount));
  }

  changeHunger(delta) {
    this.setHunger(this.hunger + delta);
  }

  setThirst(amount) {
    this.thirst = Math.max(0, Math.min(100, amount));
  }

  changeThirst(delta) {
    this.setThirst(this.thirst + delta);
  }

  eat(foodEnergy = 20, foodHunger = -30) {
    if (this.isHungry() || this.hunger > 0) {
      this.isEating = true;
      setTimeout(() => {
        this.isEating = false;
      }, 1000);
      this.changeEnergy(foodEnergy);
      this.changeHunger(foodHunger);
      this.changeBowelLevel(0.8 * foodHunger);
      this.logAction("ate", { foodEnergy, foodHunger });
    }
  }

  drink(drinkEnergy = 10, drinkThirst = -30) {
    if (this.isThirsty() || this.thirst > 0) {
      this.changeEnergy(drinkEnergy);
      this.changeThirst(drinkThirst);
      this.changeBladderLevel(0.5 * drinkThirst);
      this.logAction("drank", { drinkEnergy, drinkThirst });
    }
  }

  isExhausted() {
    return this.energy < 10;
  }

  isRested() {
    return this.energy >= 80;
  }

  isHungry() {
    return this.hunger > 50;
  }

  isStarving() {
    return this.hunger > 80;
  }

  isThirsty() {
    return this.thirst > 50;
  }

  isDehydrated() {
    return this.thirst > 80;
  }

  // SLEEP
  isTired() {
    return this.fatigue > 60;
  }

  isSleepDeprived() {
    return this.fatigue > 90;
  }

  setFatigue(amount) {
    this.fatigue = Math.max(0, Math.min(100, amount));
  }

  changeFatigue(delta) {
    this.setFatigue(this.fatigue + delta);
  }

  sleep(durationMs = 3000) {
    if (this.isTired() || this.isSleepDeprived()) {
      this.isSleeping = true;
      this.logAction("started sleeping", { durationMs });

      setTimeout(() => {
        this.isSleeping = false;
        this.changeFatigue(-0.5 * durationMs / 1000);
        this.changeEnergy(0.5 * durationMs / 1000);
        this.logAction("woke up");
      }, durationMs);
    }
  }

  // MOOD / EMOTION
  isHappy() {
    return this.mood > 60;
  }

  isSad() {
    return this.mood < 40;
  }

  isDepressed() {
    return this.mood < 20;
  }

  setMood(amount) {
    this.mood = Math.max(0, Math.min(100, amount));
  }

  changeMood(delta) {
    this.setMood(this.mood + delta);
  }

  feelHappy(factor = 10) {
    this.changeMood(factor);
  }

  feelSad(factor = -10) {
    this.changeMood(factor);
  }

  feelRelaxed(factor = 5) {
    this.changeMood(factor);
    this.changeFatigue(-factor);
  }

  // FREAK LEVEL
  increaseFreakLevel(delta = 1) {
    this.freakLevel = Math.max(0, this.freakLevel + delta);
    this.logAction("freak level increased", { delta });
  }

  decreaseFreakLevel(delta = 1) {
    this.freakLevel = Math.max(0, this.freakLevel - delta);
    this.logAction("freak level decreased", { delta });
  }

  isFreaky() {
    return this.freakLevel > 70;
  }

  isUnbearablyFreaky() {
    return this.freakLevel > 100;
  }

  panic() {
    this.changeEnergy(-10);
    this.changeMood(-15);
    this.increaseFreakLevel(20);
    this.logAction("panicked");
  }

  calmDown() {
    this.changeMood(10);
    this.setFatigue(Math.min(this.fatigue, 70));
    this.decreaseFreakLevel(10);
    this.logAction("calmed down");
  }

  // BLADDER / BOWEL / TOILET
  setBladderLevel(amount) {
    this.bladderLevel = Math.max(0, Math.min(100, amount));
    this.updateUrgency();
  }

  setBowelLevel(amount) {
    this.bowelLevel = Math.max(0, Math.min(100, amount));
    this.updateUrgency();
  }

  changeBladderLevel(delta) {
    this.setBladderLevel(this.bladderLevel + delta);
  }

  changeBowelLevel(delta) {
    this.setBowelLevel(this.bowelLevel + delta);
  }

  updateUrgency() {
    this.urgency = Math.max(0, Math.min(100, (this.bladderLevel + this.bowelLevel) / 2));
  }

  isBladderFull() {
    return this.bladderLevel > 70;
  }

  isBowelFull() {
    return this.bowelLevel > 70;
  }

  isUrgent() {
    return this.urgency > 70;
  }

  isBursting() {
    return this.urgency > 90;
  }

  findToilet() {
    if (this.urgency > 0) {
      this.logAction("searching for toilet");
    }
  }

  sitOnToilet() {
    if (this.urgency > 0) {
      this.toiletStatus = "sitting";
      this.logAction("sat on toilet");
    }
  }

  standFromToilet() {
    if (this.toiletStatus === "sitting") {
      this.toiletStatus = "standing";
      this.logAction("stood up from toilet");
    }
  }

  flushToilet() {
    if (this.toiletStatus === "sitting" || this.toiletStatus === "standing") {
      this.toiletStatus = "flushed";
      this.logAction("flushed toilet");
    }
  }

  // PEE / PEE ANIMATION
  pee() {
    if (this.isBladderFull()) {
      this.logAction("peeing");
      this.changeBladderLevel(-this.bladderLevel * 0.9);
      this.changeMood(3);
      this.decreaseFreakLevel(5);
    }
  }

  // CRAP / BOWEL MOVEMENT
  crap(strength = 1.0) {
    if (this.isBowelFull()) {
      this.logAction("crapping", { strength });

      const released = this.bowelLevel * strength;
      this.changeBowelLevel(-released);
      this.changeEnergy(-2);
      this.setFatigue(this.fatigue + 2);
      this.changeMood(-5);

      this.increaseFreakLevel(5);

      if (this.isBursting()) {
        this.hurt(1);
        this.logAction("crapped too hard");
      }
    }
  }

  forceCrapping() {
    if (this.urgency > 70) {
      this.logAction("forced a crap");
      this.crap(1.0);
    }
  }

  // DAILY / ROUTINE
  wake() {
    this.changeFatigue(-10);
    this.changeEnergy(10);
    this.setBowelLevel((this.bowelLevel + 10) / 2);
    this.logAction("woke up");
  }

  breakfast() {
    this.eat(15, -20);
    this.logAction("ate breakfast");
  }

  lunch() {
    this.eat(20, -30);
    this.drink(10, -20);
    this.logAction("ate lunch");
  }

  dinner() {
    this.eat(25, -35);
    this.drink(10, -20);
    this.logAction("ate dinner");
  }

  shower() {
    this.changeHunger(0);
    this.setThirst(0);
    this.logAction("showered");
  }

  useToilet() {
    if (this.isUrgent()) {
      this.sitOnToilet();
      if (this.isBladderFull()) {
        this.pee();
      }
      if (this.isBowelFull()) {
        this.crap(0.8);
      }
      this.flushToilet();
      this.standFromToilet();
      this.logAction("used toilet");
    }
  }

  // SOCIAL / EMOTIONAL
  isAlone() {
    return this.friends.size === 0 && this.enemies.size === 0;
  }

  setMoodFor(name, level) {
    this.relationships.set(name, level);
    this.logAction("set mood for", { name, level });
  }

  getMoodFor(name) {
    return this.relationships.get(name) ?? 50;
  }

  befriend(name) {
    this.friends.add(name);
    this.enemies.delete(name);
    this.setMoodFor(name, 70);
  }

  enemy(name) {
    this.enemies.add(name);
    this.friends.delete(name);
    this.setMoodFor(name, 20);
  }

  isFriend(name) {
    return this.friends.has(name);
  }

  isEnemy(name) {
    return this.enemies.has(name);
  }

  talk(message) {
    this.isTalking = true;
    this.logAction("said", { message });
    setTimeout(() => {
      this.isTalking = false;
    }, Math.min(5000, Math.max(1000, message.length * 30)));
  }

  gossip(targetName, rumor) {
    this.logAction("gossiped about", { targetName, rumor });
    this.changeMood(5);
  }

  // MOVEMENT / WORK
  move(x, y) {
    this.x += x;
    this.y += y;
    this.isMoving = true;
    this.exert(2);
    this.logAction("moved", { x, y });
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

  startWork() {
    this.isWorking = true;
    this.exert(5);
    this.changeEnergy(-5);
    this.logAction("started working");
  }

  stopWork() {
    this.isWorking = false;
    this.changeEnergy(2);
    this.logAction("stopped working");
  }

  // ENVIRONMENT / SURVIVAL
  adjustToTemperature(temp) {
    this.temperature = temp;
    if (temp > 35) {
      this.hurt(1);
      this.changeFatigue(2);
      this.increaseFreakLevel(10);
      this.logAction("overheated", { temp });
    } else if (temp < 5) {
      this.hurt(1);
      this.changeFatigue(2);
      this.logAction("froze", { temp });
    } else {
      this.changeEnergy(1);
    }
  }

  setAirQuality(factor) {
    this.airQuality = Math.max(0, Math.min(1, factor));
    if (this.airQuality < 0.3) {
      this.hurt(2);
      this.increaseFreakLevel(15);
      this.logAction("poor air");
    }
  }

  gainAirQuality(factor) {
    this.setAirQuality(this.airQuality + factor);
    if (factor > 0) {
      this.heal(1);
      this.decreaseFreakLevel(5);
    }
  }

  // STATUS / EFFECTS
  applyStatus(status) {
    this.statuses.add(status);
    this.logAction("status applied", { status });
  }

  removeStatus(status) {
    this.statuses.delete(status);
    this.logAction("status removed", { status });
  }

  hasStatus(status) {
    return this.statuses.has(status);
  }

  tickStatuses() {
    if (this.hasStatus("poisoned")) {
      this.hurt(1);
      this.logAction("took poison damage");
    }
    if (this.hasStatus("burning")) {
      this.hurt(2);
      this.increaseFreakLevel(20);
      this.logAction("burning");
    }
    if (this.hasStatus("frozen")) {
      this.changeFatigue(3);
      this.logAction("frozen");
    }
  }

  // MEMORY / LOG
  remember(eventKey, data) {
    this.memory.push({ key: eventKey, ...data, time: Date.now() });
  }

  recall(predicate) {
    return this.memory.filter(predicate);
  }

  logAction(type, data) {
    this.log.push({ type, data, time: Date.now() });
  }

  // LIFESTYLE / INTERESTS
  learn(skill, xp) {
    this.changeEnergy(-1);
    this.setEnergy(this.energy);
    this.logAction("learned", { skill, xp });
  }

  play(gameName) {
    this.changeEnergy(-2);
    this.changeMood(10);
    this.logAction("played", { gameName });
  }

  read(bookTitle) {
    this.changeFatigue(-3);
    this.changeMood(5);
    this.logAction("read", { bookTitle });
  }

  meditate(durationMs = 2000) {
    this.changeFatigue(-0.5 * durationMs / 1000);
    this.changeMood(0.5 * durationMs / 1000);
    this.logAction("meditated", { durationMs });
  }

  // LIFE CYCLE / AGING
  setAge(age) {
    this.age = age;
    this.logAction("aged", { age });
  }

  ageBy(years) {
    this.setAge((this.age ?? 0) + years);
  }

  // DAILY SIMULATION STEP
  simulateTick(deltaSeconds = 1) {
    if (!this.isAlive()) return;

    this.changeHunger(deltaSeconds * 0.1);
    this.changeThirst(deltaSeconds * 0.15);
    this.changeFatigue(deltaSeconds * 0.05);
    this.changeBladderLevel(deltaSeconds * 0.2);
    this.changeBowelLevel(deltaSeconds * 0.15);

    if (this.hasStatus("poisoned")) {
      this.hurt(deltaSeconds * 0.5);
    }
    if (this.isBursting()) {
      this.hurt(deltaSeconds * 0.1);
      this.increaseFreakLevel(deltaSeconds * 2);
    }

    this.tickStatuses();
  }

  // CLEANUP
  destroy(options) {
    this.stopBreathing();
    super.destroy(options);
  }
}