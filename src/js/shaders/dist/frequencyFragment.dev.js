"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.frequencyFragment = void 0;
var frequencyFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 texCoord;\nuniform sampler2D frequencyData;\nuniform vec4 foregroundColor;\nuniform vec4 backgroundColor;\nuniform float yoffset;\n\nvoid main()\n{\n    vec4 sample = texture2D(frequencyData, vec2(texCoord.x, yoffset));\n    if (texCoord.y > sample.a) {\n        // if (texCoord.y > sample.a + 1 || texCoord.y < sample.a - 1) {\n        discard;\n    }\n    float x = texCoord.y / sample.a;\n    x = x * x * x;\n    gl_FragColor = mix(foregroundColor, backgroundColor, x);\n}\n";
exports.frequencyFragment = frequencyFragment;