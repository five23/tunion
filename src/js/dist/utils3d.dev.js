"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shader = void 0;
var shader = shader || {};
/**
 * Shader stuff
 *
 * @param {*} gl
 * @param {*} vertexScriptName
 * @param {*} fragmentScriptName
 * @return {*}
 */

exports.shader = shader;

shader.loadFromScriptNodes = function (gl, vertexScriptName, fragmentScriptName) {
  /** @type {*} */
  var vertexScript = document.getElementById(vertexScriptName);
  var fragmentScript = document.getElementById(fragmentScriptName);
  if (!vertexScript || !fragmentScript) return null;
  return new shader.Shader(gl, vertexScript.text, fragmentScript.text);
};
/**
 *
 *
 * @param {*} name
 * @return {*}
 */


shader.glslNameToJs_ = function (name) {
  return name.replace(/_(.)/g, function (_, p1) {
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
  var vs = this.loadShader(this.gl.VERTEX_SHADER, vertex);

  if (vs == null) {
    return;
  }

  this.gl.attachShader(this.program, vs);
  this.gl.deleteShader(vs);
  var fs = this.loadShader(this.gl.FRAGMENT_SHADER, fragment);

  if (fs == null) {
    return;
  }

  this.gl.attachShader(this.program, fs);
  this.gl.deleteShader(fs);
  this.gl.linkProgram(this.program);
  this.gl.useProgram(this.program); // Check the link status

  var linked = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);

  if (!linked) {
    var infoLog = this.gl.getProgramInfoLog(this.program);
    console.log("Error linking program:\n".concat(infoLog));
    this.gl.deleteProgram(this.program);
    this.program = null;
    return;
  } // find uniforms and attributes


  var re = /(uniform|attribute)\s+\S+\s+(\S+)\s*;/g;
  var match = null;

  while ((match = re.exec("".concat(vertex, "\n").concat(fragment))) != null) {
    var glslName = match[2];
    var jsName = shader.glslNameToJs_(glslName);
    var loc = -1;

    if (match[1] == "uniform") {
      this["".concat(jsName, "Loc")] = this.getUniform(glslName);
    } else if (match[1] == "attribute") {
      this["".concat(jsName, "Loc")] = this.getAttribute(glslName);
    }

    if (loc >= 0) {
      this["".concat(jsName, "Loc")] = loc;
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
  var shader = this.gl.createShader(type);

  if (shader == null) {
    return null;
  } // Load the shader source


  this.gl.shaderSource(shader, shaderSrc); // Compile the shader

  this.gl.compileShader(shader); // Check the compile status

  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    var infoLog = this.gl.getShaderInfoLog(shader);
    console.log("Error compiling shader:\n".concat(infoLog));
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