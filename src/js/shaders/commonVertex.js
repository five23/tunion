export const commonVertex = `
attribute vec3 gPosition;
attribute vec2 gTexCoord0;

varying vec2 texCoord;

void main()
{
  gl_Position = vec4(gPosition.x, gPosition.y, gPosition.z, 1.0);
  texCoord = gTexCoord0;
}`;
