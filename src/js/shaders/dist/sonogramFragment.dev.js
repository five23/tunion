"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sonogramFragment = void 0;
var sonogramFragment = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 texCoord;\n\nuniform sampler2D frequencyData;\nuniform vec4 foregroundColor;\nuniform vec4 backgroundColor;\nuniform float yoffset;\n\nvoid main()\n{\n    float x = pow(256.0, texCoord.x - 1.0);\n    float y = texCoord.y + yoffset;\n\n    vec4 sample = texture2D(frequencyData, vec2(x, y));\n    float k = sample.a;\n\n    // gl_FragColor = vec4(k, k, k, 1.0);\n    // Fade out the mesh close to the edges\n    float fade = pow(cos((1.0 - texCoord.y) * 0.5 * 3.1415926535), 0.5);\n    k *= fade;\n    vec4 color = k * vec4(0,0,0,1) + (1.0 - k) * backgroundColor;\n    gl_FragColor = color;\n}\n";
exports.sonogramFragment = sonogramFragment;