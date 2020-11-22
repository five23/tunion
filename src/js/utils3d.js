/**
 * CameraController
 *
 * @param {*} element
 * @param {*} opt_canvas
 * @param {*} opt_context
 */
export function CameraController(element, opt_canvas, opt_context) {
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
export var shader = shader || {};

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
