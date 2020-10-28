
var PRECISION = 32; /* Precision (in powers of 2) */

var GAMMA  = 0.5772156649015328606065120900824; /* @constant {Number} Euler-Mascheroni constant */
var TAU    = 6.2831853071795864769252867665590; /* @constant {Number} 2*pi */
var PI     = 3.1415926535897932384626433832795; /* @constant {Number} pi */
var ZETA2  = 1.6449340668482264364724151666460; /* @constant {Number} zeta(2) */
var TWOLN2 = 1.3862943611198906188344642429164; /* @constant {Number} 2*ln(2) */

/* abs(ζ(1 - floor(2 k))) | Mathematica: Table[Abs[Zeta[1 - Floor[2 k]]], {k, 1, 13}] */
var B2 = [1/12, 1/120, 1/252, 1/240, 1/132, 691/32760, 1/12, 3617/8160, 43867/14364, 174611/6600, 77683/276, 236364091/65520, 657931/12];

var fs = 44100; /* Sampling rate */
var fc = 440;   /* Center frequency */
var z1 = 0.998; /* Lowpass filter pole (for controller changes) */

var omega = (TAU*fc)/fs;

var a0, a1, aN, aX, aZ, b0, b1, bN, bX, bZ, c0, c1, cN, cX, cZ;

function process(a) {
  outL = a.outputBuffer.getChannelData(0);

  for (a = 0; a < outL.length; a++) {
    // Osc pre gain
    a1 = 0.5;
    b1 = 0.5;
    c1 = 0.5;

    // Osc post gain
    a0 = 0.5;
    b0 = 0.5;
    c0 = 0.5;

    // Osc N harmonics
    aN = 4;
    bN = 4;
    cN = 4;

    // Calculate phases
    aX += 4;
    bX += 44;
    cX += 440;

    aX *= 1.00000002616;
    bX *= 1.00000001323;
    cX *= 0.99999998524;

    aZ = 0.5 * a0 * sawtooth(omega * aX, aN);
    bZ = 0.5 * b0 * triangle(omega * bX, bN);
    cZ = 0.5 * c0 * square(omega * cX, cN);

    // Mix it!
    var out = 0.5 * (a1 * aZ + b1 * bZ + c1 * cZ);

    outL[a] = 0.5 * out;
  }  
}

function lowpass(x, n) {
  return x + (n - x) * z1;
}

function digamma(x) {
  var v = 0;
  
  /* If the absolute value of x is less than epsilon we assume zero */
  /* TODO: this should return Complex Infinity */   
  if (Math.abs(x) < Number.EPSILON) {      
    return Infinity;
  }
  /* For negative integers we return Infinity */
  /* TODO: this should return Complex Infinity */
  if (Number.isInteger(x) && x < 0) {
    return Infinity;
  }
  /* Special values (1) */
  if (x === 1) {
    return -GAMMA;
  }
  /* Special values (1/2) */
  if (x === 1/2) {
    return -GAMMA - TWOLOG2;
  }
  /* Small values (0.000001) */
  if (Math.abs(x) <= 1e-6) {
    /* Positive x */
    if (x > 0) {
        return GAMMA - 1 / x + ZETA2;
    }
    /* Negative x */
    if (x < 0) {
        return digamma(1 - x) + PI / Math.tan(-PI * x);
    }
  }

  for (; PRECISION > x; x += 1) {
    v -= 1.0 / x;
  }

  return (v +=
    Math.log(x) -
    0.5 / (x *= x) -
    (B2[0] -
      (B2[1] -
        (B2[2] -
          (B2[3] -
            (B2[4] -
              (B2[5] -
                (B2[6] -
                  (B2[7] -
                    (B2[8] -
                      (B2[9] - (B2[10] - (B2[11] - B2[12] / x) / x) / x) / x) /
                      x) /
                    x) /
                  x) /
                x) /
              x) /
            x) /
          x) /
        x) /
      x);
};

function square(x, m) {
  var a = TAU * m * Math.cos(x);
  var b = Math.cos(TAU * a);
  var c = digamma(0.75 - a) - digamma(0.25 - a);
  return 0.5 * (b * c - PI);
}

function sawtooth(x, m) {
  return Math.sin(x) * square(x, m);
}

function triangle(x, m) {
  return sawtooth(x, m) * square(x, m);
}  