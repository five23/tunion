"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Camera = Camera;

/**
 * Camera
 *
 * @param {*} element
 * @param {*} opt_canvas
 * @param {*} opt_context
 */
function Camera(element, opt_canvas, opt_context) {
  var controller = this;
  this.onchange = null;
  this.xRot = 0;
  this.yRot = 0;
  this.scaleFactor = 3.0;
  this.dragging = false;
  this.curX = 0;
  this.curY = 0;
  if (opt_canvas) this.canvas_ = opt_canvas;
  if (opt_context) this.context_ = opt_context; // Assign a mouse down handler to the HTML element.

  element.onmousedown = function (_ref) {
    var clientX = _ref.clientX,
        clientY = _ref.clientY,
        pageX = _ref.pageX,
        pageY = _ref.pageY;
    controller.curX = clientX;
    controller.curY = clientY;
    var dragging = false;

    if (controller.canvas_ && controller.context_) {
      var rect = controller.canvas_.getBoundingClientRect(); // Transform the event's x and y coordinates into the coordinate
      // space of the canvas

      var canvasRelativeX = pageX - rect.left;
      var canvasRelativeY = pageY - rect.top;
      var canvasWidth = controller.canvas_.width;
      var canvasHeight = controller.canvas_.height; // Read back a small portion of the frame buffer around this point

      if (canvasRelativeX > 0 && canvasRelativeX < canvasWidth && canvasRelativeY > 0 && canvasRelativeY < canvasHeight) {
        var pixels = controller.context_.readPixels(canvasRelativeX, canvasHeight - canvasRelativeY, 1, 1, controller.context_.RGBA, controller.context_.UNSIGNED_BYTE);

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
  }; // Assign a mouse up handler to the HTML element.


  element.onmouseup = function () {
    controller.dragging = false;
  }; // Assign a mouse move handler to the HTML element.


  element.onmousemove = function (_ref2) {
    var clientX = _ref2.clientX,
        clientY = _ref2.clientY;

    if (controller.dragging) {
      // Determine how far we have moved since the last mouse move
      // event.
      var curX = clientX;
      var curY = clientY;
      var deltaX = (controller.curX - curX) / controller.scaleFactor;
      var deltaY = (controller.curY - curY) / controller.scaleFactor;
      controller.curX = curX;
      controller.curY = curY; // Update the X and Y rotation angles based on the mouse motion.

      controller.yRot = (controller.yRot + deltaX) % 360;
      controller.xRot = controller.xRot + deltaY; // Clamp the X rotation to prevent the camera from going upside
      // down.

      if (controller.xRot < -90) {
        controller.xRot = -90;
      } else if (controller.xRot > 90) {
        controller.xRot = 90;
      } // Send the onchange event to any listener.


      if (controller.onchange != null) {
        controller.onchange(controller.xRot, controller.yRot);
      }
    }
  };
}