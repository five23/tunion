"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commonVertex = void 0;
var commonVertex = "\nattribute vec3 gPosition;\nattribute vec2 gTexCoord0;\n\nvarying vec2 texCoord;\n\nvoid main()\n{\n  gl_Position = vec4(gPosition.x, gPosition.y, gPosition.z, 1.0);\n  texCoord = gTexCoord0;\n}";
exports.commonVertex = commonVertex;