import { Matrix4x4 } from "./matrix4x4";
import { CameraController, shader } from "./utils3d";

window.shader = shader;

// The "model" matrix is the "world" matrix in Standard Annotations and Semantics
var model = new Matrix4x4();
var view = new Matrix4x4();
var projection = new Matrix4x4();

var ANALYSISTYPE_FREQUENCY = 0;
var ANALYSISTYPE_SONOGRAM = 1;
var ANALYSISTYPE_3D_SONOGRAM = 2;
var ANALYSISTYPE_WAVEFORM = 3;

var common_vertex_shader = `
attribute vec3 gPosition;
attribute vec2 gTexCoord0;

varying vec2 texCoord;

void main()
{
  gl_Position = vec4(gPosition.x, gPosition.y, gPosition.z, 1.0);
  texCoord = gTexCoord0;
}`;

var frequency_fragment_shader = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 texCoord;
uniform sampler2D frequencyData;
uniform vec4 foregroundColor;
uniform vec4 backgroundColor;
uniform float yoffset;

void main()
{
    vec4 sample = texture2D(frequencyData, vec2(texCoord.x, yoffset));
    if (texCoord.y > sample.a) {
        // if (texCoord.y > sample.a + 1 || texCoord.y < sample.a - 1) {
        discard;
    }
    float x = texCoord.y / sample.a;
    x = x * x * x;
    gl_FragColor = mix(foregroundColor, backgroundColor, x);
}
`;

var sonogram_fragment_shader = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 texCoord;

uniform sampler2D frequencyData;
uniform vec4 foregroundColor;
uniform vec4 backgroundColor;
uniform float yoffset;

void main()
{
    float x = pow(256.0, texCoord.x - 1.0);
    float y = texCoord.y + yoffset;

    vec4 sample = texture2D(frequencyData, vec2(x, y));
    float k = sample.a;

    // gl_FragColor = vec4(k, k, k, 1.0);
    // Fade out the mesh close to the edges
    float fade = pow(cos((1.0 - texCoord.y) * 0.5 * 3.1415926535), 0.5);
    k *= fade;
    vec4 color = k * vec4(0,0,0,1) + (1.0 - k) * backgroundColor;
    gl_FragColor = color;
}
`;

var sonogram_vertex_shader = `
attribute vec3 gPosition;
attribute vec2 gTexCoord0;
uniform sampler2D vertexFrequencyData;
uniform float vertexYOffset;
uniform mat4 worldViewProjection;
uniform float verticalScale;

varying vec2 texCoord;

void main()
{
    float x = pow(256.0, gTexCoord0.x - 1.0);
    vec4 sample = texture2D(vertexFrequencyData, vec2(x, gTexCoord0.y + vertexYOffset));
    vec4 newPosition = vec4(gPosition.x, gPosition.y + verticalScale * sample.a, gPosition.z, 1.0);
    gl_Position = worldViewProjection * newPosition;
    texCoord = gTexCoord0;
}
`;

var waveform_fragment_shader = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 texCoord;
uniform sampler2D frequencyData;
uniform vec4 foregroundColor;
uniform vec4 backgroundColor;
uniform float yoffset;

void main()
{
    vec4 sample = texture2D(frequencyData, vec2(texCoord.x, yoffset));
    if (texCoord.y > sample.a + 0.005 || texCoord.y < sample.a - 0.005) {
        discard;
    }
    float x = (texCoord.y - sample.a) / 0.005;
    x = x * x * x;
    gl_FragColor = mix(foregroundColor, backgroundColor, x);
}
`;

/**
 *
 *
 * @param {*} context
 * @param {*} fname
 * @return {*}
 */
export function createGLErrorWrapper(context, fname) {
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
export function create3DDebugContext(context) {
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
export function AnalyserView(canvas) {
  this.canvas = canvas;
  this.analysisType = ANALYSISTYPE_FREQUENCY;
  this.freqByteData = 0;
  this.texture = 0;

  // Background color
  this.backgroundColor = [238 / 255, 238 / 255, 238 / 255, 1];

  // Foreground color
  this.foregroundColor = [34 / 255, 187 / 255, 187 / 255, 1];

  this.initGL();
}

/**
 *
 *
 */
AnalyserView.prototype.initGL = function () {
  var backgroundColor = this.backgroundColor;

  var canvas = this.canvas;

  var gl = canvas.getContext("webgl");
  this.gl = gl;

  this.has3DVisualizer = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;

  if (!this.has3DVisualizer && this.analysisType == ANALYSISTYPE_3D_SONOGRAM) {
    this.analysisType = ANALYSISTYPE_FREQUENCY;
  }

  var cameraController = new CameraController(canvas);
  this.cameraController = cameraController;

  cameraController.xRot = -45;
  cameraController.yRot = 0;

  gl.clearColor(
    backgroundColor[0],
    backgroundColor[1],
    backgroundColor[2],
    backgroundColor[3]
  );

  gl.enable(gl.DEPTH_TEST);

  var vertices = new Float32Array([
    1,
    1,
    0,
    -1,
    1,
    0,
    -1,
    -1,
    0,
    1,
    1,
    0,
    -1,
    -1,
    0,
    1,
    -1,
    0,
  ]);
  var texCoords = new Float32Array([1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]);

  var vboTexCoordOffset = vertices.byteLength;
  this.vboTexCoordOffset = vboTexCoordOffset;

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

  vertices = new Float32Array(65536 * 3);
  texCoords = new Float32Array(65536 * 2);

  for (let z = 0; z < 256; z++) {
    for (let x = 0; x < 256; x++) {
      let i = 256 * z + x,
        i2 = 2 * i,
        i3 = 3 * i;
      vertices[i3 + 0] = (3 * x) / 64 - 6;
      vertices[i3 + 1] = 0;
      vertices[i3 + 2] = (3 * z) / 64 - 6;
      texCoords[i2] = x / 255;
      texCoords[i2 + 1] = z / 255;
    }
  }

  var vbo3DTexCoordOffset = vertices.byteLength;
  this.vbo3DTexCoordOffset = vbo3DTexCoordOffset;

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

  this.frequencyShader = new shader.Shader(
    gl,
    common_vertex_shader,
    frequency_fragment_shader
  );
  this.waveformShader = new shader.Shader(
    gl,
    common_vertex_shader,
    waveform_fragment_shader
  );
  this.sonogramShader = new shader.Shader(
    gl,
    common_vertex_shader,
    sonogram_fragment_shader
  );

  if (this.has3DVisualizer) {
    this.sonogram3DShader = new shader.Shader(
      gl,
      sonogram_vertex_shader,
      sonogram_fragment_shader
    );
  }
};

AnalyserView.prototype.initByteBuffer = function (analyser) {
  var freqByteData;
  var gl = this.gl;

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
    var tmp = new Uint8Array(freqByteData.length * 256);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.ALPHA,
      freqByteData.length,
      256,
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
AnalyserView.prototype.doFrequencyAnalysis = function (analyser) {
  var freqByteData = this.freqByteData;

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
  var sonogram3DNumIndices = this.sonogram3DNumIndices;
  var freqByteData = this.freqByteData;
  var texture = this.texture;

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
    this.yoffset = (this.yoffset + 1) % 256;
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
      gl.uniform1f(currentShader.yoffsetLoc, 0.5 / (256 - 1));
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
      gl.uniform1f(sonogramShader.yoffsetLoc, yoffset / (256 - 1));
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
      var normalizedYOffset = this.yoffset / (256 - 1);
      gl.uniform1f(sonogram3DShader.yoffsetLoc, normalizedYOffset);
      var discretizedYOffset =
        Math.floor(normalizedYOffset * (256 - 1)) / (256 - 1);
      gl.uniform1f(sonogram3DShader.vertexYOffsetLoc, discretizedYOffset);
      gl.uniform1f(sonogram3DShader.verticalScaleLoc, 12 / 4.0);

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
