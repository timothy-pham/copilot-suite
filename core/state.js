const fs = require('fs');
const path = require('path');
const { ensureDir, readJsonc, writeJson } = require('./utils');

class StateStore {
  constructor(filePath) {
    this.path = filePath;
    this.data = {
      status: 'new',
      completed_steps: [],
      data: {},
    };
  }

  load() {
    if (fs.existsSync(this.path)) {
      this.data = readJsonc(this.path);
      this.ensureDefaults();
    }
  }

  ensureDefaults() {
    if (!this.data.status) this.data.status = 'new';
    if (!Array.isArray(this.data.completed_steps)) this.data.completed_steps = [];
    if (!this.data.data || typeof this.data.data !== 'object') this.data.data = {};
  }

  save() {
    ensureDir(path.dirname(this.path));
    writeJson(this.path, this.data);
  }

  clear() {
    if (fs.existsSync(this.path)) fs.unlinkSync(this.path);
    this.data = { status: 'new', completed_steps: [], data: {} };
  }

  markComplete(step) {
    if (!this.data.completed_steps.includes(step)) {
      this.data.completed_steps.push(step);
    }
  }

  isComplete(step) {
    return this.data.completed_steps.includes(step);
  }

  setStatus(status) {
    this.data.status = status;
  }

  setData(key, value) {
    this.data.data[key] = value;
  }

  getData(key, fallback = null) {
    return this.data.data[key] ?? fallback;
  }
}

module.exports = { StateStore };
