"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Delay = Delay;

var _vec = _interopRequireDefault(require("vec2"));

var _lpf = require("./lpf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var lpf = new _lpf.LPF(0.998);
/**
 * Delay
 *
 * @export
 * @param {*} size
 * @return {*}
 */

function Delay(size) {
  if (!(this instanceof Delay)) return new Delay(size);
  size = size || 32768;
  this.buffer = new Float32Array(size);
  this.size = size;
  this.k = 0;
  this._gain = new _vec["default"](0, 0);
  this._feed = new _vec["default"](0, 0);
  this._time = new _vec["default"](0, 0);
}
/**
 * Set delay output gain
 *
 * @param {*} n
 * @return {*}
 */


Delay.prototype.gain = function (n) {
  this._gain.x = n;
  return this;
};
/**
 * Set delay feedback (0...0.9999)
 *
 * @param {*} n
 * @return {*}
 */


Delay.prototype.feedback = function (n) {
  this._feed.x = n;
  return this;
};
/**
 * Set delay time (0...32000)
 *
 * @param {*} n
 * @return {*}
 */


Delay.prototype.time = function (n) {
  this._time.x = n;
  return this;
};
/**
 * Process
 *
 * @param {*} inp
 * @return {*}
 */


Delay.prototype.run = function (inp) {
  this._gain.y = lpf.run(this._gain.x, this._gain.y);
  this._feed.y = lpf.run(this._feed.x, this._feed.y);
  this._time.y = lpf.run(this._time.x, this._time.y);
  var back = this.k - this._time.y;

  if (back < 0) {
    back = this.size + back;
  }

  var index0 = Math.floor(back);
  var index_1 = index0 - 1;
  var index1 = index0 + 1;
  var index2 = index0 + 2;
  if (index_1 < 0) index_1 = this.size - 1;
  if (index1 >= this.size) index1 = 0;
  if (index2 >= this.size) index2 = 0;
  var y_1 = this.buffer[index_1];
  var y0 = this.buffer[index0];
  var y1 = this.buffer[index1];
  var y2 = this.buffer[index2];
  var x = back - index0;
  var c0 = y0;
  var c1 = 0.5 * (y1 - y_1);
  var c2 = y_1 - 2.5 * y0 + 2.0 * y1 - 0.5 * y2;
  var c3 = 0.5 * (y2 - y_1) + 1.5 * (y0 - y1);
  var out = ((c3 * x + c2) * x + c1) * x + c0;
  this.buffer[this.k] = inp + out * this._feed.x;
  this.k++;
  if (this.k >= this.size) this.k = 0;
  return this._gain.y * out;
};