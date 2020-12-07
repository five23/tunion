export const shader = shader || {};

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


/**
 *
 *
 * @param {*} name
 * @return {*}
 */
shader.glslNameToJs_ = name => name.replace(/_(.)/g, (_, p1) => p1.toUpperCase());


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
    console.log(`Error linking program:\n${infoLog}`);
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
    console.log(`Error compiling shader:\n${infoLog}`);
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
