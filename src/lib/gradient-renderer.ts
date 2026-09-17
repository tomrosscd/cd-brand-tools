import { hexToOklab } from './colour-space'
import { gradientHexes, gradientPoints, type GradientState } from './gradient'

const MAX_COLOURS = 5
const TILE = 2048

const vertexSource = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`

const fragmentSource = `
precision highp float;
uniform vec2 u_frame;
uniform vec2 u_offset;
uniform vec2 u_tile;
uniform int u_count;
uniform vec3 u_lab[${MAX_COLOURS}];
uniform vec2 u_point[${MAX_COLOURS}];
uniform float u_weight[${MAX_COLOURS}];
uniform float u_chaos;
uniform float u_grain;
uniform float u_seed;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + 17.17;
    amplitude *= 0.5;
  }
  return value;
}

vec3 oklabToSrgb(vec3 c) {
  float l = pow(c.x + 0.3963377774 * c.y + 0.2158037573 * c.z, 3.0);
  float m = pow(c.x - 0.1055613458 * c.y - 0.0638541728 * c.z, 3.0);
  float s = pow(c.x - 0.0894841775 * c.y - 1.2914855480 * c.z, 3.0);
  vec3 linear = vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
  linear = clamp(linear, 0.0, 1.0);
  vec3 low = linear * 12.92;
  vec3 high = 1.055 * pow(linear, vec3(1.0 / 2.4)) - 0.055;
  return mix(low, high, step(vec3(0.0031308), linear));
}

void main() {
  // Pixel position in the whole frame, top-left origin, so tiles join without seams.
  vec2 pixel = vec2(gl_FragCoord.x, u_tile.y - gl_FragCoord.y) + u_offset;
  vec2 uv = pixel / u_frame;
  float aspect = u_frame.x / u_frame.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  vec2 s = vec2(mod(u_seed, 997.0) * 0.731, mod(u_seed, 991.0) * 0.419);
  vec2 q = vec2(fbm(p * 1.4 + s), fbm(p * 1.4 + s + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p * 1.4 + 3.5 * q + s + vec2(1.7, 9.2)), fbm(p * 1.4 + 3.5 * q + s + vec2(8.3, 2.8)));
  vec2 warped = p + u_chaos * 0.9 * (r - 0.5) * 2.0;

  vec3 lab = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < ${MAX_COLOURS}; i++) {
    if (i >= u_count) break;
    vec2 centre = vec2(u_point[i].x * aspect, u_point[i].y);
    vec2 delta = warped - centre;
    float influence = u_weight[i] / pow(dot(delta, delta) + 0.015, 1.7);
    lab += u_lab[i] * influence;
    total += influence;
  }
  vec3 colour = oklabToSrgb(lab / total);

  float grain = hash(pixel + mod(u_seed, 1000.0)) - 0.5;
  colour += grain * u_grain * 0.3;
  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Could not create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader failed to compile: ${log}`)
  }
  return shader
}

export class GradientRenderer {
  readonly canvas: HTMLCanvasElement
  private readonly gl: WebGLRenderingContext
  private readonly program: WebGLProgram

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false })
    if (!gl) throw new Error('WebGL is not available in this browser.')
    this.gl = gl
    const program = gl.createProgram()
    if (!program) throw new Error('Could not create WebGL program')
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('WebGL program failed to link')
    this.program = program
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  }

  private setUniforms(state: GradientState, frame: { width: number; height: number }) {
    const { gl, program } = this
    const u = (name: string) => gl.getUniformLocation(program, name)
    const labs = gradientHexes(state).map(hexToOklab)
    const points = gradientPoints(state.seed, labs.length)
    gl.uniform2f(u('u_frame'), frame.width, frame.height)
    gl.uniform1i(u('u_count'), labs.length)
    gl.uniform3fv(
      u('u_lab'),
      new Float32Array(Array.from({ length: MAX_COLOURS }, (_, i) => labs[i] ?? [0, 0, 0]).flat()),
    )
    gl.uniform2fv(
      u('u_point'),
      new Float32Array(Array.from({ length: MAX_COLOURS }, (_, i) => [points[i]?.x ?? 0, points[i]?.y ?? 0]).flat()),
    )
    gl.uniform1fv(
      u('u_weight'),
      new Float32Array(Array.from({ length: MAX_COLOURS }, (_, i) => points[i]?.weight ?? 0)),
    )
    gl.uniform1f(u('u_chaos'), state.chaos)
    gl.uniform1f(u('u_grain'), state.grain)
    gl.uniform1f(u('u_seed'), state.seed)
  }

  private drawTile(x: number, y: number, width: number, height: number) {
    const { gl, program } = this
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
    }
    gl.viewport(0, 0, width, height)
    gl.uniform2f(gl.getUniformLocation(program, 'u_offset'), x, y)
    gl.uniform2f(gl.getUniformLocation(program, 'u_tile'), width, height)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  /** Draws the state as if the frame were `width` by `height`, filling this canvas. */
  renderPreview(state: GradientState, width: number, height: number) {
    this.setUniforms(state, { width, height })
    this.drawTile(0, 0, width, height)
  }

  /** Renders the full export size in tiles onto a 2D canvas, avoiding GPU drawing buffer limits. */
  renderFull(state: GradientState): HTMLCanvasElement {
    const output = document.createElement('canvas')
    output.width = state.width
    output.height = state.height
    const context = output.getContext('2d')
    if (!context) throw new Error('Could not create a canvas for export')
    this.setUniforms(state, state)
    for (let y = 0; y < state.height; y += TILE) {
      for (let x = 0; x < state.width; x += TILE) {
        const w = Math.min(TILE, state.width - x)
        const h = Math.min(TILE, state.height - y)
        this.drawTile(x, y, w, h)
        context.drawImage(this.canvas, 0, 0, w, h, x, y, w, h)
      }
    }
    return output
  }

  dispose() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
