/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ uni0nsongbook
/*----------------------------------*/

import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";

import jsWorkerUrl from "file-loader!ace-builds/src-noconflict/worker-javascript";

import NexusUI from "nexusui";

import { Delay } from "../../node_modules/delay/index";

var audiopen;
var analyser;
var freqByteData;

// The "model" matrix is the "world" matrix in Standard Annotations and Semantics
var model = 0;
var view = 0;
var projection = 0;

var shader = shader || {};

var ANALYSISTYPE_FREQUENCY = 0;
var ANALYSISTYPE_SONOGRAM = 1;
var ANALYSISTYPE_3D_SONOGRAM = 2;
var ANALYSISTYPE_WAVEFORM = 3;

function Matrix4x4() {
  this.elements = Array(16);
  this.loadIdentity();
};

Matrix4x4.prototype = {
  /**
   *
   *
   * @param {*} sx
   * @param {*} sy
   * @param {*} sz
   * @return {*} 
   */
  scale: function (sx, sy, sz) {
    this.elements[0 * 4 + 0] *= sx;
    this.elements[0 * 4 + 1] *= sx;
    this.elements[0 * 4 + 2] *= sx;
    this.elements[0 * 4 + 3] *= sx;

    this.elements[1 * 4 + 0] *= sy;
    this.elements[1 * 4 + 1] *= sy;
    this.elements[1 * 4 + 2] *= sy;
    this.elements[1 * 4 + 3] *= sy;

    this.elements[2 * 4 + 0] *= sz;
    this.elements[2 * 4 + 1] *= sz;
    this.elements[2 * 4 + 2] *= sz;
    this.elements[2 * 4 + 3] *= sz;

    return this;
  },

  /**
   *
   *
   * @param {*} tx
   * @param {*} ty
   * @param {*} tz
   * @return {*} 
   */
  translate: function (tx, ty, tz) {
    this.elements[3 * 4 + 0] +=
      this.elements[0 * 4 + 0] * tx +
      this.elements[1 * 4 + 0] * ty +
      this.elements[2 * 4 + 0] * tz;
    this.elements[3 * 4 + 1] +=
      this.elements[0 * 4 + 1] * tx +
      this.elements[1 * 4 + 1] * ty +
      this.elements[2 * 4 + 1] * tz;
    this.elements[3 * 4 + 2] +=
      this.elements[0 * 4 + 2] * tx +
      this.elements[1 * 4 + 2] * ty +
      this.elements[2 * 4 + 2] * tz;
    this.elements[3 * 4 + 3] +=
      this.elements[0 * 4 + 3] * tx +
      this.elements[1 * 4 + 3] * ty +
      this.elements[2 * 4 + 3] * tz;

    return this;
  },

  rotate: function (angle, x, y, z) {
    /** @type {*} */
    var mag = Math.sqrt(x * x + y * y + z * z);
    /** @type {*} */
    var sinAngle = Math.sin((angle * Math.PI) / 180.0);
    var cosAngle = Math.cos((angle * Math.PI) / 180.0);

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

  frustum: function (left, right, bottom, top, nearZ, farZ) {
    /** @type {*} */
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;
    var frust;

    if (
      nearZ <= 0.0 ||
      farZ <= 0.0 ||
      deltaX <= 0.0 ||
      deltaY <= 0.0 ||
      deltaZ <= 0.0
    )
      return this;

    frust = new Matrix4x4();

    frust.elements[0 * 4 + 0] = (2.0 * nearZ) / deltaX;
    frust.elements[0 * 4 + 1] = frust.elements[0 * 4 + 2] = frust.elements[
      0 * 4 + 3
    ] = 0.0;

    frust.elements[1 * 4 + 1] = (2.0 * nearZ) / deltaY;
    frust.elements[1 * 4 + 0] = frust.elements[1 * 4 + 2] = frust.elements[
      1 * 4 + 3
    ] = 0.0;

    frust.elements[2 * 4 + 0] = (right + left) / deltaX;
    frust.elements[2 * 4 + 1] = (top + bottom) / deltaY;
    frust.elements[2 * 4 + 2] = -(nearZ + farZ) / deltaZ;
    frust.elements[2 * 4 + 3] = -1.0;

    frust.elements[3 * 4 + 2] = (-2.0 * nearZ * farZ) / deltaZ;
    frust.elements[3 * 4 + 0] = frust.elements[3 * 4 + 1] = frust.elements[
      3 * 4 + 3
    ] = 0.0;

    frust = frust.multiply(this);
    this.elements = frust.elements;

    return this;
  },

  perspective: function (fovy, aspect, nearZ, farZ) {
    var frustumH = Math.tan((fovy / 360.0) * Math.PI) * nearZ;
    var frustumW = frustumH * aspect;

    return this.frustum(-frustumW, frustumW, -frustumH, frustumH, nearZ, farZ);
  },

  ortho: function (left, right, bottom, top, nearZ, farZ) {
    /** @type {*} */
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;

    var ortho = new Matrix4x4();

    if (deltaX == 0.0 || deltaY == 0.0 || deltaZ == 0.0) return this;

    ortho.elements[0 * 4 + 0] = 2.0 / deltaX;
    ortho.elements[3 * 4 + 0] = -(right + left) / deltaX;
    ortho.elements[1 * 4 + 1] = 2.0 / deltaY;
    ortho.elements[3 * 4 + 1] = -(top + bottom) / deltaY;
    ortho.elements[2 * 4 + 2] = -2.0 / deltaZ;
    ortho.elements[3 * 4 + 2] = -(nearZ + farZ) / deltaZ;

    ortho = ortho.multiply(this);
    this.elements = ortho.elements;

    return this;
  },

  multiply: function (right) {
    var tmp = new Matrix4x4();

    for (var i = 0; i < 4; i++) {
      tmp.elements[i * 4 + 0] =
        this.elements[i * 4 + 0] * right.elements[0 * 4 + 0] +
        this.elements[i * 4 + 1] * right.elements[1 * 4 + 0] +
        this.elements[i * 4 + 2] * right.elements[2 * 4 + 0] +
        this.elements[i * 4 + 3] * right.elements[3 * 4 + 0];

      tmp.elements[i * 4 + 1] =
        this.elements[i * 4 + 0] * right.elements[0 * 4 + 1] +
        this.elements[i * 4 + 1] * right.elements[1 * 4 + 1] +
        this.elements[i * 4 + 2] * right.elements[2 * 4 + 1] +
        this.elements[i * 4 + 3] * right.elements[3 * 4 + 1];

      tmp.elements[i * 4 + 2] =
        this.elements[i * 4 + 0] * right.elements[0 * 4 + 2] +
        this.elements[i * 4 + 1] * right.elements[1 * 4 + 2] +
        this.elements[i * 4 + 2] * right.elements[2 * 4 + 2] +
        this.elements[i * 4 + 3] * right.elements[3 * 4 + 2];

      tmp.elements[i * 4 + 3] =
        this.elements[i * 4 + 0] * right.elements[0 * 4 + 3] +
        this.elements[i * 4 + 1] * right.elements[1 * 4 + 3] +
        this.elements[i * 4 + 2] * right.elements[2 * 4 + 3] +
        this.elements[i * 4 + 3] * right.elements[3 * 4 + 3];
    }

    this.elements = tmp.elements;
    return this;
  },

  copy: function () {
    var tmp = new Matrix4x4();
    for (var i = 0; i < 16; i++) {
      tmp.elements[i] = this.elements[i];
    }
    return tmp;
  },

  get: function (row, col) {
    return this.elements[4 * row + col];
  },

  // In-place inversion
  invert: function () {
    var tmp_0 = this.get(2, 2) * this.get(3, 3);
    var tmp_1 = this.get(3, 2) * this.get(2, 3);
    var tmp_2 = this.get(1, 2) * this.get(3, 3);
    var tmp_3 = this.get(3, 2) * this.get(1, 3);
    var tmp_4 = this.get(1, 2) * this.get(2, 3);
    var tmp_5 = this.get(2, 2) * this.get(1, 3);
    var tmp_6 = this.get(0, 2) * this.get(3, 3);
    var tmp_7 = this.get(3, 2) * this.get(0, 3);
    var tmp_8 = this.get(0, 2) * this.get(2, 3);
    var tmp_9 = this.get(2, 2) * this.get(0, 3);
    var tmp_10 = this.get(0, 2) * this.get(1, 3);
    var tmp_11 = this.get(1, 2) * this.get(0, 3);
    var tmp_12 = this.get(2, 0) * this.get(3, 1);
    var tmp_13 = this.get(3, 0) * this.get(2, 1);
    var tmp_14 = this.get(1, 0) * this.get(3, 1);
    var tmp_15 = this.get(3, 0) * this.get(1, 1);
    var tmp_16 = this.get(1, 0) * this.get(2, 1);
    var tmp_17 = this.get(2, 0) * this.get(1, 1);
    var tmp_18 = this.get(0, 0) * this.get(3, 1);
    var tmp_19 = this.get(3, 0) * this.get(0, 1);
    var tmp_20 = this.get(0, 0) * this.get(2, 1);
    var tmp_21 = this.get(2, 0) * this.get(0, 1);
    var tmp_22 = this.get(0, 0) * this.get(1, 1);
    var tmp_23 = this.get(1, 0) * this.get(0, 1);

    var t0 =
      tmp_0 * this.get(1, 1) +
      tmp_3 * this.get(2, 1) +
      tmp_4 * this.get(3, 1) -
      (tmp_1 * this.get(1, 1) +
        tmp_2 * this.get(2, 1) +
        tmp_5 * this.get(3, 1));
    var t1 =
      tmp_1 * this.get(0, 1) +
      tmp_6 * this.get(2, 1) +
      tmp_9 * this.get(3, 1) -
      (tmp_0 * this.get(0, 1) +
        tmp_7 * this.get(2, 1) +
        tmp_8 * this.get(3, 1));
    var t2 =
      tmp_2 * this.get(0, 1) +
      tmp_7 * this.get(1, 1) +
      tmp_10 * this.get(3, 1) -
      (tmp_3 * this.get(0, 1) +
        tmp_6 * this.get(1, 1) +
        tmp_11 * this.get(3, 1));
    var t3 =
      tmp_5 * this.get(0, 1) +
      tmp_8 * this.get(1, 1) +
      tmp_11 * this.get(2, 1) -
      (tmp_4 * this.get(0, 1) +
        tmp_9 * this.get(1, 1) +
        tmp_10 * this.get(2, 1));

    var d =
      1.0 /
      (this.get(0, 0) * t0 +
        this.get(1, 0) * t1 +
        this.get(2, 0) * t2 +
        this.get(3, 0) * t3);

    var out_00 = d * t0;
    var out_01 = d * t1;
    var out_02 = d * t2;
    var out_03 = d * t3;

    var out_10 =
      d *
      (tmp_1 * this.get(1, 0) +
        tmp_2 * this.get(2, 0) +
        tmp_5 * this.get(3, 0) -
        (tmp_0 * this.get(1, 0) +
          tmp_3 * this.get(2, 0) +
          tmp_4 * this.get(3, 0)));
    var out_11 =
      d *
      (tmp_0 * this.get(0, 0) +
        tmp_7 * this.get(2, 0) +
        tmp_8 * this.get(3, 0) -
        (tmp_1 * this.get(0, 0) +
          tmp_6 * this.get(2, 0) +
          tmp_9 * this.get(3, 0)));
    var out_12 =
      d *
      (tmp_3 * this.get(0, 0) +
        tmp_6 * this.get(1, 0) +
        tmp_11 * this.get(3, 0) -
        (tmp_2 * this.get(0, 0) +
          tmp_7 * this.get(1, 0) +
          tmp_10 * this.get(3, 0)));
    var out_13 =
      d *
      (tmp_4 * this.get(0, 0) +
        tmp_9 * this.get(1, 0) +
        tmp_10 * this.get(2, 0) -
        (tmp_5 * this.get(0, 0) +
          tmp_8 * this.get(1, 0) +
          tmp_11 * this.get(2, 0)));

    var out_20 =
      d *
      (tmp_12 * this.get(1, 3) +
        tmp_15 * this.get(2, 3) +
        tmp_16 * this.get(3, 3) -
        (tmp_13 * this.get(1, 3) +
          tmp_14 * this.get(2, 3) +
          tmp_17 * this.get(3, 3)));
    var out_21 =
      d *
      (tmp_13 * this.get(0, 3) +
        tmp_18 * this.get(2, 3) +
        tmp_21 * this.get(3, 3) -
        (tmp_12 * this.get(0, 3) +
          tmp_19 * this.get(2, 3) +
          tmp_20 * this.get(3, 3)));
    var out_22 =
      d *
      (tmp_14 * this.get(0, 3) +
        tmp_19 * this.get(1, 3) +
        tmp_22 * this.get(3, 3) -
        (tmp_15 * this.get(0, 3) +
          tmp_18 * this.get(1, 3) +
          tmp_23 * this.get(3, 3)));
    var out_23 =
      d *
      (tmp_17 * this.get(0, 3) +
        tmp_20 * this.get(1, 3) +
        tmp_23 * this.get(2, 3) -
        (tmp_16 * this.get(0, 3) +
          tmp_21 * this.get(1, 3) +
          tmp_22 * this.get(2, 3)));

    var out_30 =
      d *
      (tmp_14 * this.get(2, 2) +
        tmp_17 * this.get(3, 2) +
        tmp_13 * this.get(1, 2) -
        (tmp_16 * this.get(3, 2) +
          tmp_12 * this.get(1, 2) +
          tmp_15 * this.get(2, 2)));
    var out_31 =
      d *
      (tmp_20 * this.get(3, 2) +
        tmp_12 * this.get(0, 2) +
        tmp_19 * this.get(2, 2) -
        (tmp_18 * this.get(2, 2) +
          tmp_21 * this.get(3, 2) +
          tmp_13 * this.get(0, 2)));
    var out_32 =
      d *
      (tmp_18 * this.get(1, 2) +
        tmp_23 * this.get(3, 2) +
        tmp_15 * this.get(0, 2) -
        (tmp_22 * this.get(3, 2) +
          tmp_14 * this.get(0, 2) +
          tmp_19 * this.get(1, 2)));
    var out_33 =
      d *
      (tmp_22 * this.get(2, 2) +
        tmp_16 * this.get(0, 2) +
        tmp_21 * this.get(1, 2) -
        (tmp_20 * this.get(1, 2) +
          tmp_23 * this.get(2, 2) +
          tmp_17 * this.get(0, 2)));

    this.elements[0 * 4 + 0] = out_00;
    this.elements[0 * 4 + 1] = out_01;
    this.elements[0 * 4 + 2] = out_02;
    this.elements[0 * 4 + 3] = out_03;
    this.elements[1 * 4 + 0] = out_10;
    this.elements[1 * 4 + 1] = out_11;
    this.elements[1 * 4 + 2] = out_12;
    this.elements[1 * 4 + 3] = out_13;
    this.elements[2 * 4 + 0] = out_20;
    this.elements[2 * 4 + 1] = out_21;
    this.elements[2 * 4 + 2] = out_22;
    this.elements[2 * 4 + 3] = out_23;
    this.elements[3 * 4 + 0] = out_30;
    this.elements[3 * 4 + 1] = out_31;
    this.elements[3 * 4 + 2] = out_32;
    this.elements[3 * 4 + 3] = out_33;
    return this;
  },

  // Returns new matrix which is the inverse of this
  inverse: function () {
    var tmp = this.copy();
    return tmp.invert();
  },

  // In-place transpose
  transpose: function () {
    var tmp = this.elements[0 * 4 + 1];
    this.elements[0 * 4 + 1] = this.elements[1 * 4 + 0];
    this.elements[1 * 4 + 0] = tmp;

    tmp = this.elements[0 * 4 + 2];
    this.elements[0 * 4 + 2] = this.elements[2 * 4 + 0];
    this.elements[2 * 4 + 0] = tmp;

    tmp = this.elements[0 * 4 + 3];
    this.elements[0 * 4 + 3] = this.elements[3 * 4 + 0];
    this.elements[3 * 4 + 0] = tmp;

    tmp = this.elements[1 * 4 + 2];
    this.elements[1 * 4 + 2] = this.elements[2 * 4 + 1];
    this.elements[2 * 4 + 1] = tmp;

    tmp = this.elements[1 * 4 + 3];
    this.elements[1 * 4 + 3] = this.elements[3 * 4 + 1];
    this.elements[3 * 4 + 1] = tmp;

    tmp = this.elements[2 * 4 + 3];
    this.elements[2 * 4 + 3] = this.elements[3 * 4 + 2];
    this.elements[3 * 4 + 2] = tmp;

    return this;
  },

  loadIdentity: function () {
    for (var i = 0; i < 16; i++) this.elements[i] = 0;
    this.elements[0 * 4 + 0] = 1.0;
    this.elements[1 * 4 + 1] = 1.0;
    this.elements[2 * 4 + 2] = 1.0;
    this.elements[3 * 4 + 3] = 1.0;
    return this;
  },
};

/**
 * CameraController
 *
 * @param {*} element
 * @param {*} opt_canvas
 * @param {*} opt_context
 */
function CameraController(element, opt_canvas, opt_context) {
  var controller = this;
  this.onchange = null;
  this.xRot = 0;
  this.yRot = 0;
  this.scaleFactor = 3.0;
  this.dragging = false;
  this.curX = 0;
  this.curY = 0;

  if (opt_canvas) this.canvas_ = opt_canvas;

  if (opt_context) this.context_ = opt_context;

  // Assign a mouse down handler to the HTML element.
  element.onmousedown = function (ev) {
    controller.curX = ev.clientX;
    controller.curY = ev.clientY;
    var dragging = false;
    if (controller.canvas_ && controller.context_) {
      var rect = controller.canvas_.getBoundingClientRect();
      // Transform the event's x and y coordinates into the coordinate
      // space of the canvas
      var canvasRelativeX = ev.pageX - rect.left;
      var canvasRelativeY = ev.pageY - rect.top;
      var canvasWidth = controller.canvas_.width;
      var canvasHeight = controller.canvas_.height;

      // Read back a small portion of the frame buffer around this point
      if (
        canvasRelativeX > 0 &&
        canvasRelativeX < canvasWidth &&
        canvasRelativeY > 0 &&
        canvasRelativeY < canvasHeight
      ) {
        var pixels = controller.context_.readPixels(
          canvasRelativeX,
          canvasHeight - canvasRelativeY,
          1,
          1,
          controller.context_.RGBA,
          controller.context_.UNSIGNED_BYTE
        );
        if (pixels) {
          // See whether this pixel has an alpha value of >= about 10%
          if (pixels[3] > 255.0 / 10.0) {
            dragging = true;
          }
        }
      }
    } else {
      dragging = true;
    }

    controller.dragging = dragging;
  };

  // Assign a mouse up handler to the HTML element.
  element.onmouseup = function (ev) {
    controller.dragging = false;
  };

  // Assign a mouse move handler to the HTML element.
  element.onmousemove = function (ev) {
    if (controller.dragging) {
      // Determine how far we have moved since the last mouse move
      // event.
      var curX = ev.clientX;
      var curY = ev.clientY;
      var deltaX = (controller.curX - curX) / controller.scaleFactor;
      var deltaY = (controller.curY - curY) / controller.scaleFactor;
      controller.curX = curX;
      controller.curY = curY;
      // Update the X and Y rotation angles based on the mouse motion.
      controller.yRot = (controller.yRot + deltaX) % 360;
      controller.xRot = controller.xRot + deltaY;
      // Clamp the X rotation to prevent the camera from going upside
      // down.
      if (controller.xRot < -90) {
        controller.xRot = -90;
      } else if (controller.xRot > 90) {
        controller.xRot = 90;
      }
      // Send the onchange event to any listener.
      if (controller.onchange != null) {
        controller.onchange(controller.xRot, controller.yRot);
      }
    }
  };
}

/**
 * Shader stuff
 *
 * @param {*} gl
 * @param {*} vertexScriptName
 * @param {*} fragmentScriptName
 * @return {*} 
 */
shader.loadFromScriptNodes = (gl, vertexScriptName, fragmentScriptName) => {
  /** @type {*} */
  const vertexScript = document.getElementById(vertexScriptName);
  const fragmentScript = document.getElementById(fragmentScriptName);
  if (!vertexScript || !fragmentScript) return null;
  return new shader.Shader(gl, vertexScript.text, fragmentScript.text);
};

shader.loadTextFileSynchronous = (url) => {
  /** @type {*} */
  const error = `loadTextFileSynchronous failed to load url "${url}"`;
  let request;

  request = new XMLHttpRequest();
  if (request.overrideMimeType) {
    request.overrideMimeType("text/plain");
  }

  request.open("GET", url, false);
  request.send(null);
  if (request.readyState != 4) {
    throw error;
  }
  return request.responseText;
};

/**
 *
 *
 * @param {*} gl
 * @param {*} vertexURL
 * @param {*} fragmentURL
 * @return {*} 
 */
shader.loadFromURL = (gl, vertexURL, fragmentURL) => {
  const vertexText = shader.loadTextFileSynchronous(vertexURL);
  const fragmentText = shader.loadTextFileSynchronous(fragmentURL);

  if (!vertexText || !fragmentText) return null;
  return new shader.Shader(gl, vertexText, fragmentText);
};

/**
 *
 *
 * @param {*} name
 * @return {*} 
 */
shader.glslNameToJs_ = (name) => {
  return name.replace(/_(.)/g, (_, p1) => {
    return p1.toUpperCase();
  });
};

/**
 *
 *
 * @param {*} gl
 * @param {*} vertex
 * @param {*} fragment
 * @return {*} 
 */
shader.Shader = function (gl, vertex, fragment) {
  this.program = gl.createProgram();
  this.gl = gl;

  const vs = this.loadShader(this.gl.VERTEX_SHADER, vertex);
  if (vs == null) {
    return;
  }
  this.gl.attachShader(this.program, vs);
  this.gl.deleteShader(vs);

  const fs = this.loadShader(this.gl.FRAGMENT_SHADER, fragment);
  if (fs == null) {
    return;
  }
  this.gl.attachShader(this.program, fs);
  this.gl.deleteShader(fs);

  this.gl.linkProgram(this.program);
  this.gl.useProgram(this.program);

  // Check the link status
  const linked = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
  if (!linked) {
    const infoLog = this.gl.getProgramInfoLog(this.program);
    output(`Error linking program:\n${infoLog}`);
    this.gl.deleteProgram(this.program);
    this.program = null;
    return;
  }

  // find uniforms and attributes
  const re = /(uniform|attribute)\s+\S+\s+(\S+)\s*;/g;
  let match = null;
  while ((match = re.exec(`${vertex}\n${fragment}`)) != null) {
    const glslName = match[2];
    const jsName = shader.glslNameToJs_(glslName);
    const loc = -1;
    if (match[1] == "uniform") {
      this[`${jsName}Loc`] = this.getUniform(glslName);
    } else if (match[1] == "attribute") {
      this[`${jsName}Loc`] = this.getAttribute(glslName);
    }
    if (loc >= 0) {
      this[`${jsName}Loc`] = loc;
    }
  }
};

shader.Shader.prototype.bind = function () {
  this.gl.useProgram(this.program);
};

/**
 *
 *
 * @param {*} type
 * @param {*} shaderSrc
 * @return {*} 
 */
shader.Shader.prototype.loadShader = function (type, shaderSrc) {
  const shader = this.gl.createShader(type);
  if (shader == null) {
    return null;
  }

  // Load the shader source
  this.gl.shaderSource(shader, shaderSrc);
  // Compile the shader
  this.gl.compileShader(shader);
  // Check the compile status
  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    const infoLog = this.gl.getShaderInfoLog(shader);
    output(`Error compiling shader:\n${infoLog}`);
    this.gl.deleteShader(shader);
    return null;
  }
  return shader;
};

shader.Shader.prototype.getAttribute = function (name) {
  return this.gl.getAttribLocation(this.program, name);
};

shader.Shader.prototype.getUniform = function (name) {
  return this.gl.getUniformLocation(this.program, name);
};

/**
 *
 *
 * @param {*} context
 * @param {*} fname
 * @return {*} 
 */
function createGLErrorWrapper(context, fname) {
  return function () {
    var rv = context[fname].apply(context, arguments);
    var err = context.getError();
    if (err != 0) throw "GL error " + err + " in " + fname;
    return rv;
  };
}

/**
 *
 *
 * @param {*} context
 * @return {*} 
 */
function create3DDebugContext(context) {
  // Thanks to Ilmari Heikkinen for the idea on how to implement this so elegantly.
  var wrap = {};
  for (var i in context) {
    try {
      if (typeof context[i] == "function") {
        wrap[i] = createGLErrorWrapper(context, i);
      } else {
        wrap[i] = context[i];
      }
    } catch (e) {
      // console.log("create3DDebugContext: Error accessing " + i);
    }
  }
  wrap.getError = function () {
    return context.getError();
  };
  return wrap;
}

/**
 * AnalyserView
 *
 * @param {*} canvasElementID
 */
function AnalyserView(canvasElementID) {
  this.canvasElementID = canvasElementID;

  // NOTE: the default value of this needs to match the selected radio button

  // This analysis type may be overriden later on if we discover we don't support the right shader features.
  this.analysisType = ANALYSISTYPE_3D_SONOGRAM;

  this.sonogram3DWidth = 256;
  this.sonogram3DHeight = 256;
  this.sonogram3DGeometrySize = 10;
  this.freqByteData = 0;
  this.texture = 0;
  this.TEXTURE_HEIGHT = 256;
  this.yoffset = 0;

  this.frequencyShader = 0;
  this.waveformShader = 0;
  this.sonogramShader = 0;
  this.sonogram3DShader = 0;

  // Background color
  this.backgroundColor = [191.0 / 255.0, 169.0 / 255.0, 135.0 / 255.0, 1.0];
  // Foreground color
  this.foregroundColor = [63.0 / 255.0, 39.0 / 255.0, 0.0 / 255.0, 1.0];

  this.initGL();
};

/**
 *
 *
 */
AnalyserView.prototype.initGL = function () {
  model = new Matrix4x4();
  view = new Matrix4x4();
  projection = new Matrix4x4();

  var sonogram3DWidth = this.sonogram3DWidth;
  var sonogram3DHeight = this.sonogram3DHeight;
  var sonogram3DGeometrySize = this.sonogram3DGeometrySize;
  var backgroundColor = this.backgroundColor;

  var canvas = document.getElementById(this.canvasElementID);
  this.canvas = canvas;

  // var gl = create3DDebugContext(canvas.getContext("experimental-webgl"));
  var gl = canvas.getContext("experimental-webgl");
  this.gl = gl;

  // If we're missing this shader feature, then we can't do the 3D visualization.
  this.has3DVisualizer = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;

  if (!this.has3DVisualizer && this.analysisType == ANALYSISTYPE_3D_SONOGRAM)
    this.analysisType = ANALYSISTYPE_FREQUENCY;

  var cameraController = new CameraController(canvas);
  this.cameraController = cameraController;

  cameraController.xRot = -45; //-55;
  cameraController.yRot = 0;
  gl.clearColor(
    backgroundColor[0],
    backgroundColor[1],
    backgroundColor[2],
    backgroundColor[3]
  );
  gl.enable(gl.DEPTH_TEST);

  // Initialization for the 2D visualizations
  var vertices = new Float32Array([
    1.0,
    1.0,
    0.0,
    -1.0,
    1.0,
    0.0,
    -1.0,
    -1.0,
    0.0,
    1.0,
    1.0,
    0.0,
    -1.0,
    -1.0,
    0.0,
    1.0,
    -1.0,
    0.0,
  ]);
  var texCoords = new Float32Array([
    1.0,
    1.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
  ]);

  var vboTexCoordOffset = vertices.byteLength;
  this.vboTexCoordOffset = vboTexCoordOffset;

  // Create the vertices and texture coordinates
  var vbo = gl.createBuffer();
  this.vbo = vbo;

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    vboTexCoordOffset + texCoords.byteLength,
    gl.STATIC_DRAW
  );
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
  gl.bufferSubData(gl.ARRAY_BUFFER, vboTexCoordOffset, texCoords);

  // Initialization for the 3D visualizations
  var numVertices = sonogram3DWidth * sonogram3DHeight;
  if (numVertices > 65536) {
    throw "Sonogram 3D resolution is too high: can only handle 65536 vertices max";
  }
  vertices = new Float32Array(numVertices * 3);
  texCoords = new Float32Array(numVertices * 2);

  for (var z = 0; z < sonogram3DHeight; z++) {
    for (var x = 0; x < sonogram3DWidth; x++) {
      // Generate a reasonably fine mesh in the X-Z plane
      vertices[3 * (sonogram3DWidth * z + x) + 0] =
        (sonogram3DGeometrySize * (x - sonogram3DWidth / 2)) / sonogram3DWidth;
      vertices[3 * (sonogram3DWidth * z + x) + 1] = 0;
      vertices[3 * (sonogram3DWidth * z + x) + 2] =
        (sonogram3DGeometrySize * (z - sonogram3DHeight / 2)) /
        sonogram3DHeight;

      texCoords[2 * (sonogram3DWidth * z + x) + 0] = x / (sonogram3DWidth - 1);
      texCoords[2 * (sonogram3DWidth * z + x) + 1] = z / (sonogram3DHeight - 1);
    }
  }

  var vbo3DTexCoordOffset = vertices.byteLength;
  this.vbo3DTexCoordOffset = vbo3DTexCoordOffset;

  // Create the vertices and texture coordinates
  var sonogram3DVBO = gl.createBuffer();
  this.sonogram3DVBO = sonogram3DVBO;

  gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    vbo3DTexCoordOffset + texCoords.byteLength,
    gl.STATIC_DRAW
  );
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
  gl.bufferSubData(gl.ARRAY_BUFFER, vbo3DTexCoordOffset, texCoords);

  // Now generate indices
  var sonogram3DNumIndices = (sonogram3DWidth - 1) * (sonogram3DHeight - 1) * 6;
  this.sonogram3DNumIndices = sonogram3DNumIndices;

  var indices = new Uint16Array(sonogram3DNumIndices);
  // We need to use TRIANGLES instead of for example TRIANGLE_STRIP
  // because we want to make one draw call instead of hundreds per
  // frame, and unless we produce degenerate triangles (which are very
  // ugly) we won't be able to split the rows.
  var idx = 0;
  for (var z = 0; z < sonogram3DHeight - 1; z++) {
    for (var x = 0; x < sonogram3DWidth - 1; x++) {
      indices[idx++] = z * sonogram3DWidth + x;
      indices[idx++] = z * sonogram3DWidth + x + 1;
      indices[idx++] = (z + 1) * sonogram3DWidth + x + 1;
      indices[idx++] = z * sonogram3DWidth + x;
      indices[idx++] = (z + 1) * sonogram3DWidth + x + 1;
      indices[idx++] = (z + 1) * sonogram3DWidth + x;
    }
  }

  var sonogram3DIBO = gl.createBuffer();
  this.sonogram3DIBO = sonogram3DIBO;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sonogram3DIBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  // Note we do not unbind this buffer -- not necessary

  // Load the shaders
  this.frequencyShader = shader.loadFromURL(
    gl,
    "shaders/common-vertex.shader",
    "shaders/frequency-fragment.shader"
  );
  this.waveformShader = shader.loadFromURL(
    gl,
    "shaders/common-vertex.shader",
    "shaders/waveform-fragment.shader"
  );
  this.sonogramShader = shader.loadFromURL(
    gl,
    "shaders/common-vertex.shader",
    "shaders/sonogram-fragment.shader"
  );

  if (this.has3DVisualizer)
    this.sonogram3DShader = shader.loadFromURL(
      gl,
      "shaders/sonogram-vertex.shader",
      "shaders/sonogram-fragment.shader"
    );
};

AnalyserView.prototype.initByteBuffer = function () {
  var gl = this.gl;
  var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;

  if (
    !this.freqByteData ||
    this.freqByteData.length != analyser.frequencyBinCount
  ) {
    freqByteData = new Uint8Array(analyser.frequencyBinCount);
    this.freqByteData = freqByteData;

    // (Re-)Allocate the texture object
    if (this.texture) {
      gl.deleteTexture(this.texture);
      this.texture = null;
    }
    var texture = gl.createTexture();
    this.texture = texture;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // TODO(kbr): WebGL needs to properly clear out the texture when null is specified
    var tmp = new Uint8Array(freqByteData.length * TEXTURE_HEIGHT);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.ALPHA,
      freqByteData.length,
      TEXTURE_HEIGHT,
      0,
      gl.ALPHA,
      gl.UNSIGNED_BYTE,
      tmp
    );
  }
};

/**
 * setAnalysisType
 *
 * @param {*} type
 * @return {*} 
 */
AnalyserView.prototype.setAnalysisType = function (type) {
  // Check for read textures in vertex shaders.
  if (!this.has3DVisualizer && type == ANALYSISTYPE_3D_SONOGRAM) return;

  this.analysisType = type;
};

/**
 * analysisType
 *
 * @return {*} 
 */
AnalyserView.prototype.analysisType = function () {
  return this.analysisType;
};

/**
 * doFrequencyAnalysis
 * 
 * @param {*} event
 */
AnalyserView.prototype.doFrequencyAnalysis = function (event) {
  freqByteData = this.freqByteData;

  switch (this.analysisType) {
    case ANALYSISTYPE_FREQUENCY:
      analyser.smoothingTimeConstant = 0.75;
      analyser.getByteFrequencyData(freqByteData);
      break;

    case ANALYSISTYPE_SONOGRAM:
    case ANALYSISTYPE_3D_SONOGRAM:
      analyser.smoothingTimeConstant = 0.1;
      analyser.getByteFrequencyData(freqByteData);
      break;

    case ANALYSISTYPE_WAVEFORM:
      analyser.smoothingTimeConstant = 0.1;
      analyser.getByteTimeDomainData(freqByteData);
      break;
  }

  this.drawGL();
};

/**
 * drawGL
 *
 */
AnalyserView.prototype.drawGL = function () {
  var canvas = this.canvas;
  var gl = this.gl;
  var vbo = this.vbo;
  var vboTexCoordOffset = this.vboTexCoordOffset;
  var sonogram3DVBO = this.sonogram3DVBO;
  var vbo3DTexCoordOffset = this.vbo3DTexCoordOffset;
  var sonogram3DGeometrySize = this.sonogram3DGeometrySize;
  var sonogram3DNumIndices = this.sonogram3DNumIndices;
  var sonogram3DWidth = this.sonogram3DWidth;
  var sonogram3DHeight = this.sonogram3DHeight;
  var freqByteData = this.freqByteData;
  var texture = this.texture;
  var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;

  var frequencyShader = this.frequencyShader;
  var waveformShader = this.waveformShader;
  var sonogramShader = this.sonogramShader;
  var sonogram3DShader = this.sonogram3DShader;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  if (
    this.analysisType != ANALYSISTYPE_SONOGRAM &&
    this.analysisType != ANALYSISTYPE_3D_SONOGRAM
  ) {
    this.yoffset = 0;
  }

  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    0,
    this.yoffset,
    freqByteData.length,
    1,
    gl.ALPHA,
    gl.UNSIGNED_BYTE,
    freqByteData
  );

  if (
    this.analysisType == ANALYSISTYPE_SONOGRAM ||
    this.analysisType == ANALYSISTYPE_3D_SONOGRAM
  ) {
    this.yoffset = (this.yoffset + 1) % TEXTURE_HEIGHT;
  }
  var yoffset = this.yoffset;

  // Point the frequency data texture at texture unit 0 (the default),
  // which is what we're using since we haven't called activeTexture
  // in our program

  var vertexLoc;
  var texCoordLoc;
  var frequencyDataLoc;
  var foregroundColorLoc;
  var backgroundColorLoc;
  var texCoordOffset;

  var currentShader;

  switch (this.analysisType) {
    case ANALYSISTYPE_FREQUENCY:
    case ANALYSISTYPE_WAVEFORM:
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      currentShader =
        this.analysisType == ANALYSISTYPE_FREQUENCY
          ? frequencyShader
          : waveformShader;
      currentShader.bind();
      vertexLoc = currentShader.gPositionLoc;
      texCoordLoc = currentShader.gTexCoord0Loc;
      frequencyDataLoc = currentShader.frequencyDataLoc;
      foregroundColorLoc = currentShader.foregroundColorLoc;
      backgroundColorLoc = currentShader.backgroundColorLoc;
      gl.uniform1f(currentShader.yoffsetLoc, 0.5 / (TEXTURE_HEIGHT - 1));
      texCoordOffset = vboTexCoordOffset;
      break;

    case ANALYSISTYPE_SONOGRAM:
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      sonogramShader.bind();
      vertexLoc = sonogramShader.gPositionLoc;
      texCoordLoc = sonogramShader.gTexCoord0Loc;
      frequencyDataLoc = sonogramShader.frequencyDataLoc;
      foregroundColorLoc = sonogramShader.foregroundColorLoc;
      backgroundColorLoc = sonogramShader.backgroundColorLoc;
      gl.uniform1f(sonogramShader.yoffsetLoc, yoffset / (TEXTURE_HEIGHT - 1));
      texCoordOffset = vboTexCoordOffset;
      break;

    case ANALYSISTYPE_3D_SONOGRAM:
      gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO);
      sonogram3DShader.bind();
      vertexLoc = sonogram3DShader.gPositionLoc;
      texCoordLoc = sonogram3DShader.gTexCoord0Loc;
      frequencyDataLoc = sonogram3DShader.frequencyDataLoc;
      foregroundColorLoc = sonogram3DShader.foregroundColorLoc;
      backgroundColorLoc = sonogram3DShader.backgroundColorLoc;
      gl.uniform1i(sonogram3DShader.vertexFrequencyDataLoc, 0);
      var normalizedYOffset = this.yoffset / (TEXTURE_HEIGHT - 1);
      gl.uniform1f(sonogram3DShader.yoffsetLoc, normalizedYOffset);
      var discretizedYOffset =
        Math.floor(normalizedYOffset * (sonogram3DHeight - 1)) /
        (sonogram3DHeight - 1);
      gl.uniform1f(sonogram3DShader.vertexYOffsetLoc, discretizedYOffset);
      gl.uniform1f(
        sonogram3DShader.verticalScaleLoc,
        sonogram3DGeometrySize / 4.0
      );

      // Set up the model, view and projection matrices
      projection.loadIdentity();
      projection.perspective(55 /*35*/, canvas.width / canvas.height, 1, 100);
      view.loadIdentity();
      view.translate(0, 0, -10.0 /*-13.0*/);

      // Add in camera controller's rotation
      model.loadIdentity();
      model.rotate(this.cameraController.xRot, 1, 0, 0);
      model.rotate(this.cameraController.yRot, 0, 1, 0);

      // Compute necessary matrices
      var mvp = new Matrix4x4();
      mvp.multiply(model);
      mvp.multiply(view);
      mvp.multiply(projection);
      gl.uniformMatrix4fv(
        sonogram3DShader.worldViewProjectionLoc,
        gl.FALSE,
        mvp.elements
      );
      texCoordOffset = vbo3DTexCoordOffset;
      break;
  }

  if (frequencyDataLoc) {
    gl.uniform1i(frequencyDataLoc, 0);
  }
  if (foregroundColorLoc) {
    gl.uniform4fv(foregroundColorLoc, this.foregroundColor);
  }
  if (backgroundColorLoc) {
    gl.uniform4fv(backgroundColorLoc, this.backgroundColor);
  }

  // Set up the vertex attribute arrays
  gl.enableVertexAttribArray(vertexLoc);
  gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordLoc);
  gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, gl.FALSE, 0, texCoordOffset);

  // Clear the render area
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Actually draw
  if (
    this.analysisType == ANALYSISTYPE_FREQUENCY ||
    this.analysisType == ANALYSISTYPE_WAVEFORM ||
    this.analysisType == ANALYSISTYPE_SONOGRAM
  ) {
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  } else if (this.analysisType == ANALYSISTYPE_3D_SONOGRAM) {
    // Note: this expects the element array buffer to still be bound
    gl.drawElements(gl.TRIANGLES, sonogram3DNumIndices, gl.UNSIGNED_SHORT, 0);
  }

  // Disable the attribute arrays for cleanliness
  gl.disableVertexAttribArray(vertexLoc);
  gl.disableVertexAttribArray(texCoordLoc);
};

/**
 * onload
 *
 */
window.onload = () => {
  var editorToggle = NexusUI.Add.Toggle("#header-panel");

  var vco1 = new NexusUI.Rack("#vco1");
  var vco2 = new NexusUI.Rack("#vco1");
  var vco3 = new NexusUI.Rack("#vco1");

  var vizSelect = NexusUI.Add.RadioButton("#header-panel", {
    size: [120, 25],
    numberOfButtons: 4,
    active: -1,
  });

  editorToggle.on("change", function (v) {
    if (v) {
      document.getElementById("editor").className =
        "ace_editor ace_hidpi ace-tm visible";
    } else {
      document.getElementById("editor").className =
        "ace_editor ace_hidpi ace-tm";
    }
  });

  audiopen = new AudioPen();

  if (navigator.mediaDevices) {
    console.log("getUserMedia supported.");
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .then((stream) => {
        audiopen.start(stream);
      })
      .catch((err) => {
        console.log(`The following gUM error occured: ${err}`);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
};

/**
 *
 *
 */
function AudioPen() {
  this.apiFunctionNames = ["process", "digamma"];
  this.isPlaying = false;
  this.compiledCode = null;
  this.lastCodeChangeTime = 0;
  this.lastCompilationTime = 0;
  this.compilationDelay = 1e3;
  this.sampleRate = 44100;
  this.bufferSize = 2048;
  this.t = 0;
}

AudioPen.prototype = {
  start: function (stream) {
    var self = this;

    this.audioContext = new AudioContext();
    this.analyserView = new AnalyserView("view1");

    ace.config.setModuleUrl("ace/mode/javascript_worker", jsWorkerUrl);

    this.editor = ace.edit("editor");
    this.editor.setShowPrintMargin(false);
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.on("change", function (e) {
      self.lastCodeChangeTime = Date.now();
    });

    this.compileCode();

    this.streamNode = this.audioContext.createMediaStreamSource(stream);

    this.jsProcessor = this.audioContext.createScriptProcessor(
      this.bufferSize,
      1,
      1
    );
    this.jsProcessor.onaudioprocess = (audioProcessingEvent) => {
      self.executeCode(audioProcessingEvent);
    };

    analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3;

    this.jsProcessor.connect(analyser);

    analyser.connect(this.audioContext.destination);
    analyser.getByteFrequencyData(new Uint8Array(analyser.frequencyBinCount));

    this.analyser = analyser;

    this.analyserView.initByteBuffer();

    this.mainLoop();
  },

  /**
   *
   *
   * @return {*} 
   */
  compileCode: function () {
    var code = this.editor.getValue();
    var memberDefs = [];
    for (var i = 0; i < this.apiFunctionNames.length; ++i) {
      var fname = this.apiFunctionNames[i];
      memberDefs.push(
        fname + ":(typeof " + fname + "=='function'?" + fname + ":null)"
      );
    }
    var appendix = "\nreturn {" + memberDefs.join(",") + " };";
    code += appendix;
    this.lastCompilationTime = Date.now();
    var pack = null;
    try {
      pack = new Function(code)();
    } catch (ex) {
      console.log("Compilation failed: " + ex.message + "\n" + ex.stack);
      return false;
    }
    this.compiledCode = pack;
    return true;
  },

  /**
   *
   *
   * @param {*} buffer
   * @return {*} 
   */
  executeCode: function (buffer) {
    if (buffer === null) return;
    buffer = this.compiledCode.process(buffer);
  },

  /**
   *
   *
   */
  mainLoop: function () {
    var self = this;

    requestAnimationFrame(function () {
      self.mainLoop();
    });

    if (
      Date.now() - this.lastCodeChangeTime > this.compilationDelay &&
      this.lastCodeChangeTime > this.lastCompilationTime
    ) {
      this.compileCode();
    } else if (this.compiledCode.onGui) {
      this.compiledCode.onGui();
    }

    this.analyserView.doFrequencyAnalysis(this.analyser);
    //this.renderWave();
  },
};