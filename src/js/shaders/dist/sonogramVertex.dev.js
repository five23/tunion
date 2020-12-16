"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sonogramVertex = void 0;
var sonogramVertex = "\nattribute vec3 gPosition;\nattribute vec2 gTexCoord0;\nuniform sampler2D vertexFrequencyData;\nuniform float vertexYOffset;\nuniform mat4 worldViewProjection;\nuniform float verticalScale;\n\nvarying vec2 texCoord;\n\nvoid main()\n{\n    float x = pow(256.0, gTexCoord0.x - 1.0);\n    vec4 sample = texture2D(vertexFrequencyData, vec2(x, gTexCoord0.y + vertexYOffset));\n    vec4 newPosition = vec4(gPosition.x, gPosition.y + verticalScale * sample.a, gPosition.z, 1.0);\n    gl_Position = worldViewProjection * newPosition;\n    texCoord = gTexCoord0;\n}\n";
exports.sonogramVertex = sonogramVertex;