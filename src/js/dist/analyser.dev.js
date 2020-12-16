"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnalyserView = AnalyserView;

var _matrix4x = require("./matrix4x4");

var _utils3d = require("./utils3d");

var _camera = require("./camera");

var _commonVertex = require("./shaders/commonVertex");

var _frequencyFragment = require("./shaders/frequencyFragment");

var _sonogramFragment = require("./shaders/sonogramFragment");

var _sonogramVertex = require("./shaders/sonogramVertex");

var _waveformFragment = require("./shaders/waveformFragment");

window.shader = _utils3d.shader;
var model = new _matrix4x.Matrix4x4();
var view = new _matrix4x.Matrix4x4();
var projection = new _matrix4x.Matrix4x4();
/**
 * AnalyserView
 *
 * @param {*} canvasElementID
 */

function AnalyserView(canvas) {
  var gl = canvas.getContext("webgl");
  this.gl = gl;
  this.has3DVisualizer = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;
  this.canvas = canvas;
  this.analysisType = 0;
  this.freqByteData = 0;
  this.texture = 0;
  this.camera = new _camera.Camera(canvas);
  this.camera.xRot = -45;
  this.camera.yRot = 0; // Background color

  this.backgroundColor = [238 / 255, 238 / 255, 238 / 255, 1]; // Foreground color

  this.foregroundColor = [34 / 255, 187 / 255, 187 / 255, 1];
  this.initGL();
}
/**
 * initGL
 */


AnalyserView.prototype.initGL = function () {
  var backgroundColor = this.backgroundColor;
  var gl = this.gl;
  gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
  gl.enable(gl.DEPTH_TEST);
  var vertices = new Float32Array([1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]);
  var texCoords = new Float32Array([1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]);
  var vboTexCoordOffset = vertices.byteLength;
  this.vboTexCoordOffset = vboTexCoordOffset;
  var vbo = gl.createBuffer();
  this.vbo = vbo;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vboTexCoordOffset + texCoords.byteLength, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
  gl.bufferSubData(gl.ARRAY_BUFFER, vboTexCoordOffset, texCoords);
  vertices = new Float32Array(65536 * 3);
  texCoords = new Float32Array(65536 * 2);

  for (var z = 0; z < 256; z++) {
    for (var x = 0; x < 256; x++) {
      var i = 256 * z + x,
          i2 = 2 * i,
          i3 = 3 * i;
      vertices[i3 + 0] = 3 * x / 64 - 6;
      vertices[i3 + 1] = 0;
      vertices[i3 + 2] = 3 * z / 64 - 6;
      texCoords[i2] = x / 255;
      texCoords[i2 + 1] = z / 255;
    }
  }

  var vbo3DTexCoordOffset = vertices.byteLength;
  this.vbo3DTexCoordOffset = vbo3DTexCoordOffset;
  var sonogram3DVBO = gl.createBuffer();
  this.sonogram3DVBO = sonogram3DVBO;
  gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO);
  gl.bufferData(gl.ARRAY_BUFFER, vbo3DTexCoordOffset + texCoords.byteLength, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
  gl.bufferSubData(gl.ARRAY_BUFFER, vbo3DTexCoordOffset, texCoords);
  var sonogram3DNumIndices = (256 - 1) * (256 - 1) * 6;
  this.sonogram3DNumIndices = sonogram3DNumIndices;
  var indices = new Uint16Array(sonogram3DNumIndices);
  var idx = 0;

  for (var z0 = 0; z0 < 256 - 1; z0++) {
    for (var x0 = 0; x0 < 256 - 1; x0++) {
      indices[idx++] = z0 * 256 + x0;
      indices[idx++] = z0 * 256 + x0 + 1;
      indices[idx++] = (z0 + 1) * 256 + x0 + 1;
      indices[idx++] = z0 * 256 + x0;
      indices[idx++] = (z0 + 1) * 256 + x0 + 1;
      indices[idx++] = (z0 + 1) * 256 + x0;
    }
  }

  var sonogram3DIBO = gl.createBuffer();
  this.sonogram3DIBO = sonogram3DIBO;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sonogram3DIBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  this.frequencyShader = new _utils3d.shader.Shader(gl, _commonVertex.commonVertex, _frequencyFragment.frequencyFragment);
  this.waveformShader = new _utils3d.shader.Shader(gl, _commonVertex.commonVertex, _waveformFragment.waveformFragment);
  this.sonogramShader = new _utils3d.shader.Shader(gl, _commonVertex.commonVertex, _sonogramFragment.sonogramFragment);

  if (this.has3DVisualizer) {
    this.sonogram3DShader = new _utils3d.shader.Shader(gl, _sonogramVertex.sonogramVertex, _sonogramFragment.sonogramFragment);
  }
};
/**
 * initByteBuffer
 *
 * @param {*} analyser
 */


AnalyserView.prototype.initByteBuffer = function (analyser) {
  var freqByteData;
  var gl = this.gl;

  if (!this.freqByteData || this.freqByteData.length != analyser.frequencyBinCount) {
    freqByteData = new Uint8Array(analyser.frequencyBinCount);
    this.freqByteData = freqByteData;

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
    var tmp = new Uint8Array(freqByteData.length * 256);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, freqByteData.length, 256, 0, gl.ALPHA, gl.UNSIGNED_BYTE, tmp);
  }
};
/**
 * setAnalysisType
 *
 * @param {*} type
 * @return {*}
 */


AnalyserView.prototype.setAnalysisType = function (type) {
  if (!this.has3DVisualizer && type == 2) return;
  this.analysisType = type;
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
  var sonogram3DNumIndices = this.sonogram3DNumIndices;
  var freqByteData = this.freqByteData;
  var texture = this.texture;
  var frequencyShader = this.frequencyShader;
  var waveformShader = this.waveformShader;
  var sonogramShader = this.sonogramShader;
  var sonogram3DShader = this.sonogram3DShader;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  if (this.analysisType != 1 && this.analysisType != 2) {
    this.yoffset = 0;
  }

  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, this.yoffset, freqByteData.length, 1, gl.ALPHA, gl.UNSIGNED_BYTE, freqByteData);

  if (this.analysisType == 1 || this.analysisType == 2) {
    this.yoffset = (this.yoffset + 1) % 256;
  }

  var yoffset = this.yoffset;
  var vertexLoc;
  var texCoordLoc;
  var frequencyDataLoc;
  var foregroundColorLoc;
  var backgroundColorLoc;
  var texCoordOffset;
  var currentShader;

  switch (this.analysisType) {
    case 0:
    case 3:
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      currentShader = this.analysisType == 0 ? frequencyShader : waveformShader;
      currentShader.bind();
      vertexLoc = currentShader.gPositionLoc;
      texCoordLoc = currentShader.gTexCoord0Loc;
      frequencyDataLoc = currentShader.frequencyDataLoc;
      foregroundColorLoc = currentShader.foregroundColorLoc;
      backgroundColorLoc = currentShader.backgroundColorLoc;
      gl.uniform1f(currentShader.yoffsetLoc, 0.5 / (256 - 1));
      texCoordOffset = vboTexCoordOffset;
      break;

    case 1:
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      sonogramShader.bind();
      vertexLoc = sonogramShader.gPositionLoc;
      texCoordLoc = sonogramShader.gTexCoord0Loc;
      frequencyDataLoc = sonogramShader.frequencyDataLoc;
      foregroundColorLoc = sonogramShader.foregroundColorLoc;
      backgroundColorLoc = sonogramShader.backgroundColorLoc;
      gl.uniform1f(sonogramShader.yoffsetLoc, yoffset / (256 - 1));
      texCoordOffset = vboTexCoordOffset;
      break;

    case 2:
      gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO);
      sonogram3DShader.bind();
      vertexLoc = sonogram3DShader.gPositionLoc;
      texCoordLoc = sonogram3DShader.gTexCoord0Loc;
      frequencyDataLoc = sonogram3DShader.frequencyDataLoc;
      foregroundColorLoc = sonogram3DShader.foregroundColorLoc;
      backgroundColorLoc = sonogram3DShader.backgroundColorLoc;
      gl.uniform1i(sonogram3DShader.vertexFrequencyDataLoc, 0);
      var normalizedYOffset = this.yoffset / (256 - 1);
      gl.uniform1f(sonogram3DShader.yoffsetLoc, normalizedYOffset);
      var discretizedYOffset = Math.floor(normalizedYOffset * (256 - 1)) / (256 - 1);
      gl.uniform1f(sonogram3DShader.vertexYOffsetLoc, discretizedYOffset);
      gl.uniform1f(sonogram3DShader.verticalScaleLoc, 12 / 4.0);
      projection.loadIdentity();
      projection.perspective(55
      /*35*/
      , canvas.width / canvas.height, 1, 100);
      view.loadIdentity();
      view.translate(0, 0, -10.0
      /*-13.0*/
      );
      model.loadIdentity();
      model.rotate(this.camera.xRot, 1, 0, 0);
      model.rotate(this.camera.yRot, 0, 1, 0);
      var mvp = new _matrix4x.Matrix4x4();
      mvp.multiply(model);
      mvp.multiply(view);
      mvp.multiply(projection);
      gl.uniformMatrix4fv(sonogram3DShader.worldViewProjectionLoc, gl.FALSE, mvp.elements);
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

  gl.enableVertexAttribArray(vertexLoc);
  gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordLoc);
  gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, gl.FALSE, 0, texCoordOffset);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (this.analysisType == 0 || this.analysisType == 3 || this.analysisType == 1) {
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  } else if (this.analysisType == 2) {
    gl.drawElements(gl.TRIANGLES, sonogram3DNumIndices, gl.UNSIGNED_SHORT, 0);
  }

  gl.disableVertexAttribArray(vertexLoc);
  gl.disableVertexAttribArray(texCoordLoc);
};