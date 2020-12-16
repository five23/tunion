"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Matrix4x4 = Matrix4x4;

function Matrix4x4() {
  this.elements = Array(16);
  this.loadIdentity();
}

Matrix4x4.prototype = {
  /**
   * translate
   *
   * @param {*} tx
   * @param {*} ty
   * @param {*} tz
   * @return {*}
   */
  translate: function translate(tx, ty, tz) {
    this.elements[3 * 4 + 0] += this.elements[0 * 4 + 0] * tx + this.elements[1 * 4 + 0] * ty + this.elements[2 * 4 + 0] * tz;
    this.elements[3 * 4 + 1] += this.elements[0 * 4 + 1] * tx + this.elements[1 * 4 + 1] * ty + this.elements[2 * 4 + 1] * tz;
    this.elements[3 * 4 + 2] += this.elements[0 * 4 + 2] * tx + this.elements[1 * 4 + 2] * ty + this.elements[2 * 4 + 2] * tz;
    this.elements[3 * 4 + 3] += this.elements[0 * 4 + 3] * tx + this.elements[1 * 4 + 3] * ty + this.elements[2 * 4 + 3] * tz;
    return this;
  },

  /**
   * rotate
   *
   * @param {*} angle
   * @param {*} x
   * @param {*} y
   * @param {*} z
   * @return {*}
   */
  rotate: function rotate(angle, x, y, z) {
    /** @type {*} */
    var mag = Math.sqrt(x * x + y * y + z * z);
    /** @type {*} */

    var sinAngle = Math.sin(angle * Math.PI / 180.0);
    var cosAngle = Math.cos(angle * Math.PI / 180.0);

    if (mag > 0) {
      /** @type {*} */
      var xx, yy, zz, xy, yz, zx, xs, ys, zs;
      var oneMinusCos;
      var rotMat;
      x /= mag;
      y /= mag;
      z /= mag;
      xx = x * x;
      yy = y * y;
      zz = z * z;
      xy = x * y;
      yz = y * z;
      zx = z * x;
      xs = x * sinAngle;
      ys = y * sinAngle;
      zs = z * sinAngle;
      oneMinusCos = 1.0 - cosAngle;
      rotMat = new Matrix4x4();
      rotMat.elements[0 * 4 + 0] = oneMinusCos * xx + cosAngle;
      rotMat.elements[0 * 4 + 1] = oneMinusCos * xy - zs;
      rotMat.elements[0 * 4 + 2] = oneMinusCos * zx + ys;
      rotMat.elements[0 * 4 + 3] = 0.0;
      rotMat.elements[1 * 4 + 0] = oneMinusCos * xy + zs;
      rotMat.elements[1 * 4 + 1] = oneMinusCos * yy + cosAngle;
      rotMat.elements[1 * 4 + 2] = oneMinusCos * yz - xs;
      rotMat.elements[1 * 4 + 3] = 0.0;
      rotMat.elements[2 * 4 + 0] = oneMinusCos * zx - ys;
      rotMat.elements[2 * 4 + 1] = oneMinusCos * yz + xs;
      rotMat.elements[2 * 4 + 2] = oneMinusCos * zz + cosAngle;
      rotMat.elements[2 * 4 + 3] = 0.0;
      rotMat.elements[3 * 4 + 0] = 0.0;
      rotMat.elements[3 * 4 + 1] = 0.0;
      rotMat.elements[3 * 4 + 2] = 0.0;
      rotMat.elements[3 * 4 + 3] = 1.0;
      rotMat = rotMat.multiply(this);
      this.elements = rotMat.elements;
    }

    return this;
  },

  /**
   * frustum
   *
   * @param {*} left
   * @param {*} right
   * @param {*} bottom
   * @param {*} top
   * @param {*} nearZ
   * @param {*} farZ
   * @return {*}
   */
  frustum: function frustum(left, right, bottom, top, nearZ, farZ) {
    /** @type {*} */
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;
    var frust;
    if (nearZ <= 0.0 || farZ <= 0.0 || deltaX <= 0.0 || deltaY <= 0.0 || deltaZ <= 0.0) return this;
    frust = new Matrix4x4();
    frust.elements[0 * 4 + 0] = 2.0 * nearZ / deltaX;
    frust.elements[0 * 4 + 1] = frust.elements[0 * 4 + 2] = frust.elements[0 * 4 + 3] = 0.0;
    frust.elements[1 * 4 + 1] = 2.0 * nearZ / deltaY;
    frust.elements[1 * 4 + 0] = frust.elements[1 * 4 + 2] = frust.elements[1 * 4 + 3] = 0.0;
    frust.elements[2 * 4 + 0] = (right + left) / deltaX;
    frust.elements[2 * 4 + 1] = (top + bottom) / deltaY;
    frust.elements[2 * 4 + 2] = -(nearZ + farZ) / deltaZ;
    frust.elements[2 * 4 + 3] = -1.0;
    frust.elements[3 * 4 + 2] = -2.0 * nearZ * farZ / deltaZ;
    frust.elements[3 * 4 + 0] = frust.elements[3 * 4 + 1] = frust.elements[3 * 4 + 3] = 0.0;
    frust = frust.multiply(this);
    this.elements = frust.elements;
    return this;
  },

  /**
   * perspective
   *
   * @param {*} fovy
   * @param {*} aspect
   * @param {*} nearZ
   * @param {*} farZ
   * @return {*}
   */
  perspective: function perspective(fovy, aspect, nearZ, farZ) {
    var frustumH = Math.tan(fovy / 360.0 * Math.PI) * nearZ;
    var frustumW = frustumH * aspect;
    return this.frustum(-frustumW, frustumW, -frustumH, frustumH, nearZ, farZ);
  },

  /**
   * multiply
   *
   * @param {*} right
   * @return {*}
   */
  multiply: function multiply(right) {
    var tmp = new Matrix4x4();

    for (var i = 0; i < 4; i++) {
      tmp.elements[i * 4 + 0] = this.elements[i * 4 + 0] * right.elements[0 * 4 + 0] + this.elements[i * 4 + 1] * right.elements[1 * 4 + 0] + this.elements[i * 4 + 2] * right.elements[2 * 4 + 0] + this.elements[i * 4 + 3] * right.elements[3 * 4 + 0];
      tmp.elements[i * 4 + 1] = this.elements[i * 4 + 0] * right.elements[0 * 4 + 1] + this.elements[i * 4 + 1] * right.elements[1 * 4 + 1] + this.elements[i * 4 + 2] * right.elements[2 * 4 + 1] + this.elements[i * 4 + 3] * right.elements[3 * 4 + 1];
      tmp.elements[i * 4 + 2] = this.elements[i * 4 + 0] * right.elements[0 * 4 + 2] + this.elements[i * 4 + 1] * right.elements[1 * 4 + 2] + this.elements[i * 4 + 2] * right.elements[2 * 4 + 2] + this.elements[i * 4 + 3] * right.elements[3 * 4 + 2];
      tmp.elements[i * 4 + 3] = this.elements[i * 4 + 0] * right.elements[0 * 4 + 3] + this.elements[i * 4 + 1] * right.elements[1 * 4 + 3] + this.elements[i * 4 + 2] * right.elements[2 * 4 + 3] + this.elements[i * 4 + 3] * right.elements[3 * 4 + 3];
    }

    this.elements = tmp.elements;
    return this;
  },

  /**
   * copy
   *
   * @return {*}
   */
  copy: function copy() {
    var tmp = new Matrix4x4();

    for (var i = 0; i < 16; i++) {
      tmp.elements[i] = this.elements[i];
    }

    return tmp;
  },

  /**
   * get
   *
   * @param {*} row
   * @param {*} col
   * @return {*}
   */
  get: function get(row, col) {
    return this.elements[4 * row + col];
  },

  /**
   * loadIdentity
   *
   * @return {*}
   */
  loadIdentity: function loadIdentity() {
    for (var i = 0; i < 16; i++) {
      this.elements[i] = 0;
    }

    this.elements[0 * 4 + 0] = 1.0;
    this.elements[1 * 4 + 1] = 1.0;
    this.elements[2 * 4 + 2] = 1.0;
    this.elements[3 * 4 + 3] = 1.0;
    return this;
  }
};