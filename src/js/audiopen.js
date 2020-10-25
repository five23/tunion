/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ uni0nsongbook
/*----------------------------------*/

var freqByteData;

function kMath() {
  const self = this;

  this.EPSILON = 2.2204460492503130808472633361816e-16;

  this.PHI = 1.6180339887498948482045868343656; // @constant {Number} (1+sqrt(5))/2
  this.PI = 3.1415926535897932384626433832795; // @constant {Number} pi
  this.TAU = 6.283185307179586476925286766559; // @constant {Number} 2*pi
  this.PI2 = 1.5707963267948966192313216916397; // @constant {Number} pi/2
  this.GAMMA = 0.5772156649015328606065120900824; // @constant {Number} lim_(n->infty)(H_n-lnn)
  this.ZETA2 = 1.644934066848226436472415166646; // @constant {Number} zeta(2)
  this.LOG2P = 0.9189385332046727417803297364056; // @constant {Number} 1/2 (log(2)+log(\[Pi]))
  this.SQRT2PI = 2.506628274631000502415765284811; // @constant {Number} sqrt(2 pi)
  this.SQRT2 = 1.4142135623730950488016887242097; // @constant {Number} sqrt(2)

  this.F2 = 0.36602540378443864676372317075294; // @constant {Number} 1/(1 + sqrt(3))
  this.F3 = 0.33333333333333333333333333333333; // @constant {Number} 1/3
  this.F4 = 0.30901699437494742410229341718282; // @constant {Number} 1/(1 + sqrt(5))
  this.G2 = 0.21132486540518711774542560974902; // @constant {Number} 1/(3 + sqrt(3))
  this.G3 = 0.16666666666666666666666666666667; // @constant {Number} 1/6
  this.G4 = 0.13819660112501051517954131656344; // @constant {Number} 1/(5 + sqrt(5))
  this.H2 = 0.57735026918962576450914878050196; // @constant {Number} 1/(sqrt(3))

  /*
   * csc
   *
   * @param {Number} x
   * @returns {x}
   */
  this.csc = (x) => 1.0 / Math.sin(x);

  /*
   * sinh
   *
   * @param {Number} x
   * @returns {x}
   */
  this.cosh = (x) => 0.5 * (Math.exp(x) + Math.exp(-x));

  /*
   * sinh
   *
   * @param {Number} x
   * @returns {x}
   */
  this.sinh = (c) => {
    let d;
    let b;
    let h;
    let e;
    let f;
    let g;
    if (0 === c) return 0;
    if (((d = Math.abs(c)), 0.12 > d)) {
      d = self.b / 10;
      h = c * c;
      e = b = g = 1;
      for (f = 0; b > d; ) {
        f += 8 * g - 2;
        g++;
        b *= h / f;
        e += b;
      }
      return c * e;
    }
    return 0.36 > d
      ? ((b = self.sinh(c / 3)), b * (3 + 4 * b * b))
      : ((b = Math.exp(c)), (b - 1 / b) / 2);
  };

  /*
   * tanh
   *
   * @param {Number} x
   * @returns {x}
   */
  this.tanh = (x) =>
    (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));

  /*
   * csch
   *
   * @param {Number} x
   * @returns {x}
   */
  this.csch = (x) => 2 / (Math.exp(x) - Math.exp(-x));

  /*
   * acoth
   *
   * @param {Number} x
   * @returns {x}
   */
  this.coth = (x) => 1 / self.tanh(x);

  /*
   * acosh
   *
   * @param {Number} x
   * @returns {x}
   */
  this.acosh = (x) => Math.log(x + Math.sqrt(x * x - 1));

  /*
   * asinh
   *
   * @param {Number} x
   * @returns {x}
   */
  this.asinh = (x) => Math.log(x + Math.sqrt(x * x + 1));

  /*
   * atanh
   *
   * @param {Number} x
   * @returns {x}
   */
  this.atanh = (x) => 0.5 * Math.log((1 + x) / (1 - x));

  /*
   * Fast Sine Approximation
   *
   * @param {Number} x
   * @returns {x}
   */
  this.fsin = (x) => {
    let b;
    let c;
    return (
      (x *= 5214),
      (c = x << 17),
      (x -= 8192),
      (x <<= 18),
      (x >>= 18),
      (x = (x * x) >> 12),
      (b = 19900 - ((3516 * x) >> 14)),
      (b = 4096 - ((x * b) >> 16)),
      0 > c && (b = -b),
      2.44e-4 * b
    );
  };

  /*
   * Fast Cosine Approximation
   *
   * @param {Number} x
   * @returns {x}
   */
  this.fcos = (a, b) => {
    (a = 8192 - 5215.19 * a),
      (b = a << 17),
      (a = ((a - 8192) << 18) >> 18),
      (a =
        4096 -
        ((((a * a) >> 12) * (19900 - ((3516 * ((a * a) >> 12)) >> 14))) >> 16));
    return 0.0 > b && (a = -a), 2.44e-4 * a;
  };

  /*
   * Unit Step
   *
   * @param {Number} x
   * @returns {x}
   */
  this.unitstep = (x) => (x >= 0 ? (x ? 1 : 0.5) : 0);

  /*
   * Dirac Delta
   *
   * @param {Number} x
   * @returns {x}
   */
  this.diracdelta = (x) => (x === 0 ? Infinity : 0);

  /*
   * Kronecker Delta
   *
   * @param {Number} i
   * @param {Number} j
   * @returns {x}
   */
  this.kroneckerdelta = (i, j) => (i === j ? 1 : 0);

  /*
   * Sgn
   *
   * @param {Number} x
   * @returns {x}
   */
  this.sgn = (x) =>
    typeof x === "number" ? (x ? (x < 0 ? -1 : 1) : x === x ? 0 : NaN) : NaN;

  /*
   * Sinc
   *
   * @param {Number} x
   * @returns {x}
   */
  this.sinc = (x) => (x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x));

  /*
   * Triangle (naive)
   *
   * @param {Number} x
   * @returns {x}
   */
  this.triangle = (x) => x - Math.floor(x);

  /*
   * Mod
   *
   * @param {Number} x
   * @param {Number} y
   * @returns {x}
   */
  this.mod = (x, y) => x - Math.floor(x / y) * y;

  /*
   * Square Wave Approximation
   *
   * @param {Number} x
   * @param {Number} m Partials
   * @returns {x}
   */
  this.square = (a, b) => {
    b *= self.TAU;
    a = (440 * a * self.TAU) / 48000;
    return (
      0.5 *
      (Math.cos(self.TAU * b * Math.cos(a)) *
        ((self.digamma(0.75 - b * Math.cos(a)) -
          self.digamma(0.25 - b * Math.cos(a))) /
          Math.PI) -
        1)
    );
  };

  /*
   * Factorial
   *
   * @param {Number} x
   * @returns {x}
   */
  this.factorial = (x) => {
    // Empty product
    if (x === 0) {
      return 1;
    }
    // Complex Infinity
    else if (x > 170 || x < 0) {
      return Infinity;
    }
    // Factor
    else {
      let v = x;
      while (x > 1) {
        v *= --x;
      }
      return v;
    }
  };

  /*
   * Log Gamma
   *
   * @param {Number} x
   * @returns {x}
   */
  this.lngamma = (x) => {
    let v = 0;
    let signum = 1;

    // Integer values reduce to simple factorial
    if (x % 1 === 0) {
      return Math.log(self.factorial(x - 1));
    }

    // The gamma function alternates sign between poles,
    // with the forward recurrence product containing an
    // odd/even number of factors corresponding to the number
    // of poles between x and 1-x. Thus, Euler's reflection formula
    // can be understood in the literal sense as a type of
    // inverse sync function, or -- nascently -- a delta.
    //
    // Half integer values
    else if (x < 0.5) {
      // When x is negative and the floor is even
      if (x < 0 && ~~x % 2 === 0) {
        // Central binomial coefficient (n=2)
        signum = -1;

        // TODO: Inverting the sign returns the real part of the
        // reciprocal gamma function. Complex values
        // should be computed here.
      }

      // Compute the logarithm of the product
      v = Math.log((signum * Math.PI) / Math.sin(Math.PI * x));

      // Euler's reflection formula
      return v - self.lngamma(1 - x);
    }
    // Approximation for all other values
    else {
      // Lancsoz approximation, numerator
      const n =
        3.409662655323161e6 +
        x *
          (4.1623878911888916e6 +
            x *
              (2.222880419448303e6 +
                x *
                  (678289.7014752217 +
                    x *
                      (129347.25852000745 +
                        x *
                          (15784.880455151022 +
                            x *
                              (1203.8342012464082 +
                                x * (52.458333328046045 + x)))))));

      // Denominator
      const d =
        x *
        (5040 +
          x *
            (13068 +
              x *
                (13132 + x * (6769 + x * (1960 + x * (322 + x * (28 + x)))))));

      // (1/2)*log(2*pi) ...
      v =
        self.LOG2P -
        (6.5 + x) -
        0.5 * Math.log(6.5 + x) +
        x * Math.log(6.5 + x);

      return v + Math.log(n / d);
    }
  };

  /*
   * Gamma Function
   *
   * @param {Number} x
   * @returns {x}
   */
  this.gamma = (x) => {
    // Integer values reduce to simple factorial
    if (x % 1 === 0) {
      return self.factorial(x - 1);
    } else if (x < 0) {
      return -Math.PI / (x * Math.sin(Math.PI * x) * self.gamma(-x));
    } else {
      // Lancsoz approximation, numerator
      const n =
        3.4096626553343013e6 +
        x *
          (4.1623878912255694e6 +
            x *
              (2.2228804194936445e6 +
                x *
                  (678289.7015023368 +
                    x *
                      (129347.25852873185 +
                        x *
                          (15784.880456697823 +
                            x *
                              (1203.8342013887075 +
                                x * (52.458333333333336 + x)))))));

      // denominator ...
      const d =
        x *
        (5040 +
          x *
            (13068 +
              x *
                (13132 + x * (6769 + x * (1960 + x * (322 + x * (28 + x)))))));

      return (
        (Math.sqrt(Math.PI * 2) *
          Math.exp(-x - 6.5 + (x - 0.5) * Math.log(x + 6.5)) *
          n) /
        d
      );
    }
  };

  /*
   * Digamma Function
   *
   * @param {Number} x
   * @returns {x}
   */
  // Input 0
  this.digamma = (b) => {
    let c = 0;
    if (0 >= b && b === Math.round(b)) {
      return Infinity;
    }
    if (0 > b) {
      return self.digamma(1.0 - b) + Math.PI / Math.tan(-Math.PI * b);
    }
    if (b <= Number.EPSILON) {
      return (
        1.64493406684822643647241516664603 * b -
        1.0 / b +
        0.5772156649015328606065120900824
      );
    }
    for (; 8.0 > b; b += 1) {
      c -= 1.0 / b;
    }
    return (c +=
      Math.log(b) -
      0.5 / (b *= b) -
      (0.08333333333333333 -
        (0.008333333333333333 -
          (0.0039682539682539 - (0.004166666666666 - 1 / (132 * b)) / b) / b) /
          b) /
        b);
  };

  /*
   * Harmonic Number
   *
   * @param {Number} x
   * @returns {x}
   */
  this.H = (x) => self.digamma(++x) + self.GAMMA;

  /*
   * Phi Distribution
   *
   * @param {Number} x
   * @returns {x}
   */
  this.phi = (x) => {
    const signum = x < 0 ? -1 : 1;

    x = Math.abs(x) / self.SQRT2;

    return (
      0.5 *
      (1 +
        signum *
          (1 -
            ((((1.061405429 * (1 / (1 + 0.3275911 * x)) - 1.453152027) *
              (1 / (1 + 0.3275911 * x)) +
              1.421413741) *
              (1 / (1 + 0.3275911 * x)) -
              0.284496736) *
              (1 / (1 + 0.3275911 * x)) +
              0.254829592) *
              (1 / (1 + 0.3275911 * x)) *
              Math.exp(-x * x)))
    );
  };

  /*
   * Fresnel C Function
   *
   * @param {Number} x
   * @returns {x}
   */
  this.fresnelc = (d) => {
    d *= self.SQRT2PI / 2;

    const a = d * d;
    const e = a * a;
    let b = 0;
    let c = 0;

    if (0.1 > a) {
      c = ((2 * a * d) / 3) * Math.exp(-e / 14);
    } else if (15 > a) {
      b = 2 * ~~(6 + 1.2 * a);
      do {
        c = 1 / (2 * b - 5) - (e * c) / (b * (b + 1));
        b -= 2;
      } while (0 < b);
      c = -(Math.sin(a) / a + 2 * Math.cos(a) + 3 * c) / (2 * d);
    } else {
      b = 2 * ~~(4 + 60 / a);
      c = 1;
      do {
        c = 1 - (c * (b - 0.5) * (b - 1.5)) / e;
        b -= 2;
      } while (0 < b);
      c =
        (-c * Math.cos(a) -
          Math.sin(a) / 2 / a +
          Math.sqrt((Math.PI * a) / 2)) /
        d;
    }
    return c / self.SQRT2PI;
  };

  /*
   * Riemann Zeta Function
   *
   * @param {Number} x
   * @returns {x}
   */
  this.zeta = (b) => {
    let a;
    let c = Math.PI;
    if (0 === b) {
      return -0.5;
    }
    if (1 == b) {
      return Infinity;
    }
    if (2 == b) {
      return (a * a) / 6;
    }
    if (4 == b) {
      return (a * a * a * a) / 90;
    }
    if (1 > b) {
      return Infinity;
    }
    for (a = 4.4 * b ** -5.1, c = 1; 10 > c; c++) {
      a += c ** -b;
    }
    return a;
  };

  /*
   * Error function
   *
   * @param {Number} x
   * @returns {x}
   */
  this.erf = (a) => {
    const b = 0 > a ? -1 : 1;

    a = Math.abs(a);

    a =
      1 -
      (1 / (1 + 0.3275911 * a)) *
        ((1 / (1 + 0.3275911 * a)) *
          ((1 / (1 + 0.3275911 * a)) *
            ((1 / (1 + 0.3275911 * a)) *
              ((1 / (1 + 0.3275911 * a)) * 1.061405429 - 1.453152027) +
              1.421413741) -
            0.284496736) +
          0.254829592) *
        Math.exp(-a * a);

    return b * a;
  };

  /*
   * Machine epsilon
   *
   * @returns {x}
   */
  this.epsilon = () => {
    let a = 1;
    let b;
    let c;
    do {
      c = a;
      a /= 2;
      b = 1 + a;
    } while (b > 1);
    return c;
  };

  /*
   * Cantor "Devil's Staircase" Function
   *
   * @param {Number} x
   * @returns {x}
   */
  this.cantor = (x) => {
    if (x <= 0) {
      return 0;
    }
    if (x >= 1) {
      return 1;
    }

    let a = 0;
    let b = 0.5;
    let c;

    do {
      c = Math.floor((x *= 3));
      x %= 1;

      if (c) {
        a += b;
      }
      b /= 2;
    } while (c != 1 && x && b + a != a);
    return a;
  };

  /*
   * Convert float to int
   *
   * @param {Number} x
   * @returns {x} Integer
   */
  this.int = (x) => x | 0;

  /*
   * Fast floor function
   *
   * @param {Number} x
   * @returns {x}
   */
  this.floor32 = (x) => (x < 0 ? (x | 0) - 1 : x | 0);

  /*
   * Calculates a number between two numbers at a specific increment.
   *
   * @param {Number} x
   * @param {Number} v0
   * @param {Number} v1
   * @returns {Number}
   */
  this.lerp = (x, v0, v1) => v0 + (v1 - v0) * x;

  /*
   * Clamp a value to an interval
   *
   * @param {Number} x The value to clamp
   * @param {Number} v0 The lower clamp threshold
   * @param {Number} v1 The upper clamp threshold
   * @returns {Number} The clamped value
   */
  this.clamp = (x, v0, v1) => (x < v0 ? v0 : x > v1 ? v1 : x);

  /*
   * Normalizes a value from a given range (min, max) into a value between -1.0 and 1.0
   *
   * @param {Number} x The value to normalize
   * @param {Number} v0 The minimum value of the normalization
   * @param {Number} v1 The maximum value of the normalization
   * @returns {Number} The normalized value
   */
  this.normalize = function (x, v0, v1) {
    return this.clamp((x - v0) / (v1 - v0), -1.0, 1.0);
  };

  /*
   * Re-maps a value from one range to another
   *
   * @param {Number} x The value to re-map
   * @param {Number} v0 The minimum input value
   * @param {Number} v1 The maximum input value
   * @param {Number} vx0 The minimum output value
   * @param {Number} vx1 The maximum output value
   * @param {Boolean} clamp Results if True
   * @returns {Number} The re-mapped value
   */
  this.map = (x, v0, v1, vx0, vx1, clamp) => {
    if (Math.abs(v0 - v1) < 1e-15) {
      return vx0;
    } else {
      let _x = ((x - v0) / (v1 - v0)) * (vx1 - vx0) + vx0;
      if (clamp) {
        if (vx1 < vx0) {
          if (_x < vx1) {
            _x = vx1;
          } else if (_x > vx0) {
            _x = vx0;
          }
        } else {
          if (_x > vx1) {
            _x = vx1;
          } else if (_x < vx0) {
            _x = vx0;
          }
        }
      }
      return _x;
    }
  };

  /*
   * Calculates distance between two points (Pythagorean Theorem)
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Number}
   */
  this.dist = (x1, y1, x2, y2) =>
    Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

  /*
   * Calculates the distances between two points, as in dist()
   * but doesn't take the sqrt() of the result, which is a faster
   * operation if you need to calculate and compare multiple distances.
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @returns {Number}
   */
  this.distSquared = (x1, y1, x2, y2) =>
    (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

  /*
   * Random float
   *
   * @param {Number} min
   * @param {Number} max
   * @param {Number} precision
   * @returns {Number}
   */
  this.randomFloat = (min, max, precision) => {
    if (typeof precision === "undefined") {
      precision = 2;
    }

    return parseFloat(
      Math.min(min + Math.random() * (max - min), max).toFixed(precision)
    );
  };

  /*
   * Random integer
   *
   * @param {Number} min
   * @param {Number} max
   * @returns {Number}
   */
  this.randomInt = function (min, max) {
    return this.floor32(Math.random() * (max - min + 1) + min);
  };

  /*
   * Random permutation
   *
   * @param {Number} index
   * @returns {Array}
   */
  this.randomPerm = function (index) {
    const perm = new Float32Array(index);

    for (let n = index; n >= 0; n -= 1) {
      const z = perm[n];
      const x = this.floor32(Math.random() * (index + 1));

      perm[n] = perm[x];
      perm[x] = z;
    }

    return perm;
  };

  /*
   * Bit Divisor
   *
   * @param {Number} bits
   * @returns {Number}
   */
  this.bitDivisor = (bits) => 1 << (bits - 1);

  /*
   * Bit Mask
   *
   * @param {Number} bits
   * @returns {Number}
   */
  this.bitMask = (bits) => (1 << bits) - 1;

  /*
   * Bit Shift
   *
   * @param {Number} x
   * @param {Number} bits
   * @returns {Number}
   */
  this.bitShift = (x, bits) => (self.bitMask(bits) & x) / self.bitDivisor(bits);

  /*
   * Permutation table
   *
   * @constant {Float32Array}
   */
  this.permutation = new Float32Array([
    151,
    160,
    137,
    91,
    90,
    15,
    131,
    13,
    201,
    95,
    96,
    53,
    194,
    233,
    7,
    225,
    140,
    36,
    103,
    30,
    69,
    142,
    8,
    99,
    37,
    240,
    21,
    10,
    23,
    190,
    6,
    148,
    247,
    120,
    234,
    75,
    0,
    26,
    197,
    62,
    94,
    252,
    219,
    203,
    117,
    35,
    11,
    32,
    57,
    177,
    33,
    88,
    237,
    149,
    56,
    87,
    174,
    20,
    125,
    136,
    171,
    168,
    68,
    175,
    74,
    165,
    71,
    134,
    139,
    48,
    27,
    166,
    77,
    146,
    158,
    231,
    83,
    111,
    229,
    122,
    60,
    211,
    133,
    230,
    220,
    105,
    92,
    41,
    55,
    46,
    245,
    40,
    244,
    102,
    143,
    54,
    65,
    25,
    63,
    161,
    1,
    216,
    80,
    73,
    209,
    76,
    132,
    187,
    208,
    89,
    18,
    169,
    200,
    196,
    135,
    130,
    116,
    188,
    159,
    86,
    164,
    100,
    109,
    198,
    173,
    186,
    3,
    64,
    52,
    217,
    226,
    250,
    124,
    123,
    5,
    202,
    38,
    147,
    118,
    126,
    255,
    82,
    85,
    212,
    207,
    206,
    59,
    227,
    47,
    16,
    58,
    17,
    182,
    189,
    28,
    42,
    223,
    183,
    170,
    213,
    119,
    248,
    152,
    2,
    44,
    154,
    163,
    70,
    221,
    153,
    101,
    155,
    167,
    43,
    172,
    9,
    129,
    22,
    39,
    253,
    19,
    98,
    108,
    110,
    79,
    113,
    224,
    232,
    178,
    185,
    112,
    104,
    218,
    246,
    97,
    228,
    251,
    34,
    242,
    193,
    238,
    210,
    144,
    12,
    191,
    179,
    162,
    241,
    81,
    51,
    145,
    235,
    249,
    14,
    239,
    107,
    49,
    192,
    214,
    31,
    181,
    199,
    106,
    157,
    184,
    84,
    204,
    176,
    115,
    121,
    50,
    45,
    127,
    4,
    150,
    254,
    138,
    236,
    205,
    93,
    222,
    114,
    67,
    29,
    24,
    72,
    243,
    141,
    128,
    195,
    78,
    66,
    215,
    61,
    156,
    180,
  ]);

  /*
   * Permutation table modulo 12
   *
   * @constant {Float32Array}
   */
  this.permMod12 = new Float32Array([
    7,
    4,
    5,
    7,
    6,
    3,
    11,
    1,
    9,
    11,
    0,
    5,
    2,
    5,
    7,
    9,
    8,
    0,
    7,
    6,
    9,
    10,
    8,
    3,
    1,
    0,
    9,
    10,
    11,
    10,
    6,
    4,
    7,
    0,
    6,
    3,
    0,
    2,
    5,
    2,
    10,
    0,
    3,
    11,
    9,
    11,
    11,
    8,
    9,
    9,
    9,
    4,
    9,
    5,
    8,
    3,
    6,
    8,
    5,
    4,
    3,
    0,
    8,
    7,
    2,
    9,
    11,
    2,
    7,
    0,
    3,
    10,
    5,
    2,
    2,
    3,
    11,
    3,
    1,
    2,
    0,
    7,
    1,
    2,
    4,
    9,
    8,
    5,
    7,
    10,
    5,
    4,
    4,
    6,
    11,
    6,
    5,
    1,
    3,
    5,
    1,
    0,
    8,
    1,
    5,
    4,
    0,
    7,
    4,
    5,
    6,
    1,
    8,
    4,
    3,
    10,
    8,
    8,
    3,
    2,
    8,
    4,
    1,
    6,
    5,
    6,
    3,
    4,
    4,
    1,
    10,
    10,
    4,
    3,
    5,
    10,
    2,
    3,
    10,
    6,
    3,
    10,
    1,
    8,
    3,
    2,
    11,
    11,
    11,
    4,
    10,
    5,
    2,
    9,
    4,
    6,
    7,
    3,
    2,
    9,
    11,
    8,
    8,
    2,
    8,
    10,
    7,
    10,
    5,
    9,
    5,
    11,
    11,
    7,
    4,
    9,
    9,
    10,
    3,
    1,
    7,
    2,
    0,
    2,
    7,
    5,
    8,
    4,
    10,
    5,
    4,
    8,
    2,
    6,
    1,
    0,
    11,
    10,
    2,
    1,
    10,
    6,
    0,
    0,
    11,
    11,
    6,
    1,
    9,
    3,
    1,
    7,
    9,
    2,
    11,
    11,
    1,
    0,
    10,
    7,
    1,
    7,
    10,
    1,
    4,
    0,
    0,
    8,
    7,
    1,
    2,
    9,
    7,
    4,
    6,
    2,
    6,
    8,
    1,
    9,
    6,
    6,
    7,
    5,
    0,
    0,
    3,
    9,
    8,
    3,
    6,
    6,
    11,
    1,
    0,
    0,
    7,
    4,
    5,
    7,
    6,
    3,
    11,
    1,
    9,
    11,
    0,
    5,
    2,
    5,
    7,
    9,
    8,
    0,
    7,
    6,
    9,
    10,
    8,
    3,
    1,
    0,
    9,
    10,
    11,
    10,
    6,
    4,
    7,
    0,
    6,
    3,
    0,
    2,
    5,
    2,
    10,
    0,
    3,
    11,
    9,
    11,
    11,
    8,
    9,
    9,
    9,
    4,
    9,
    5,
    8,
    3,
    6,
    8,
    5,
    4,
    3,
    0,
    8,
    7,
    2,
    9,
    11,
    2,
    7,
    0,
    3,
    10,
    5,
    2,
    2,
    3,
    11,
    3,
    1,
    2,
    0,
    7,
    1,
    2,
    4,
    9,
    8,
    5,
    7,
    10,
    5,
    4,
    4,
    6,
    11,
    6,
    5,
    1,
    3,
    5,
    1,
    0,
    8,
    1,
    5,
    4,
    0,
    7,
    4,
    5,
    6,
    1,
    8,
    4,
    3,
    10,
    8,
    8,
    3,
    2,
    8,
    4,
    1,
    6,
    5,
    6,
    3,
    4,
    4,
    1,
    10,
    10,
    4,
    3,
    5,
    10,
    2,
    3,
    10,
    6,
    3,
    10,
    1,
    8,
    3,
    2,
    11,
    11,
    11,
    4,
    10,
    5,
    2,
    9,
    4,
    6,
    7,
    3,
    2,
    9,
    11,
    8,
    8,
    2,
    8,
    10,
    7,
    10,
    5,
    9,
    5,
    11,
    11,
    7,
    4,
    9,
    9,
    10,
    3,
    1,
    7,
    2,
    0,
    2,
    7,
    5,
    8,
    4,
    10,
    5,
    4,
    8,
    2,
    6,
    1,
    0,
    11,
    10,
    2,
    1,
    10,
    6,
    0,
    0,
    11,
    11,
    6,
    1,
    9,
    3,
    1,
    7,
    9,
    2,
    11,
    11,
    1,
    0,
    10,
    7,
    1,
    7,
    10,
    1,
    4,
    0,
    0,
    8,
    7,
    1,
    2,
    9,
    7,
    4,
    6,
    2,
    6,
    8,
    1,
    9,
    6,
    6,
    7,
    5,
    0,
    0,
    3,
    9,
    8,
    3,
    6,
    6,
    11,
    1,
    0,
    0,
  ]);

  /*
   * A lookup table to traverse the simplex around a given point in 4D.
   *
   * @constant {Float32Array}
   */
  this.simplexLookup = new Float32Array([
    [0, 1, 2, 3],
    [0, 1, 3, 2],
    [0, 0, 0, 0],
    [0, 2, 3, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 2, 3, 0],
    [0, 2, 1, 3],
    [0, 0, 0, 0],
    [0, 3, 1, 2],
    [0, 3, 2, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 3, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 2, 0, 3],
    [0, 0, 0, 0],
    [1, 3, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 3, 0, 1],
    [2, 3, 1, 0],
    [1, 0, 2, 3],
    [1, 0, 3, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 3, 1],
    [0, 0, 0, 0],
    [2, 1, 3, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 1, 3],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [3, 0, 1, 2],
    [3, 0, 2, 1],
    [0, 0, 0, 0],
    [3, 1, 2, 0],
    [2, 1, 0, 3],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [3, 1, 0, 2],
    [0, 0, 0, 0],
    [3, 2, 0, 1],
    [3, 2, 1, 0],
  ]);

  /*
   * Compute 1d Gradients
   *
   * @param {Number} hash
   * @param {Number} x
   * @returns {Number}
   */
  this.gradient1d = (hash, x) => {
    const h = (hash & 15) | 0;

    // Gradient value 1.0, 2.0, ..., 8.0
    let grad = 1.0 + (h & 7);

    // Set a random sign for the gradient
    if (h & 8) {
      grad = -grad;
    }

    // Multiply the gradient with the distance
    return grad * x;
  };

  /*
   * Compute 2d Gradients
   *
   * @param {Number} hash
   * @param {Number} x
   * @param {Number} y
   * @returns {Number}
   */
  this.gradient2d = (hash, x, y) => {
    // Convert low 3 bits of hash code into 8 simple
    // gradient directions, and compute dot product

    const h = (hash & 7) | 0;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;

    return (h & 1 ? -u : u) + (h & 2 ? -2.0 * v : 2.0 * v);
  };

  /*
   * Compute 3d Gradients
   *
   * @param {Number} hash
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @returns {Number}
   */
  this.gradient3d = (hash, x, y, z) => {
    // Convert low 4 bits of hash code into 12 simple
    // gradient directions, and compute dot product.

    const h = (hash & 15) | 0;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  };

  /*
   * Compute 4d Gradients
   *
   * @param {Number} hash
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @param {Number} t
   * @returns {Number}
   */
  this.gradient4d = (hash, x, y, z, t) => {
    // Convert low 5 bits of hash code into 32 simple
    // gradient directions, and compute dot product.

    const h = (hash & 31) | 0;
    const u = h < 24 ? x : y;
    const v = h < 16 ? y : z;
    const w = h < 8 ? z : t;

    return (h & 1 ? -u : u) + (h & 2 ? -v : v) + (h & 4 ? -w : w);
  };

  /*
   * 1d Signed Simplex Noise
   *
   * @param {Number} x
   * @returns {Number}
   */
  this.signedNoise1d = (x) => {
    const i0 = self.floor32(x);
    const i1 = i0 + 1;

    const x0 = x - i0;
    const x1 = x0 - 1.0;

    let t1 = 1.0 - x1 * x1;
    let t0 = 1.0 - x0 * x0;

    const n0 =
      (t0 *= t0) * t0 * self.gradient1d(self.permutation[i0 & 0xff], x0);
    const n1 =
      (t1 *= t1) * t1 * self.gradient1d(self.permutation[i1 & 0xff], x1);

    // The maximum value of this noise is 8*(3/4)^4 = 2.53125
    // A factor of 0.395 would scale to fit exactly within [-1,1], but
    // we want to match PRMan's 1D noise, so we scale it down some more.
    return 0.25 * (n0 + n1);
  };

  /*
   * 2d Signed ofSimplex Noise
   *
   * @param {Number} x
   * @param {Number} y
   * @returns {Number}
   */
  this.signedNoise2d = (x, y) => {
    // Skew the input space to determine which simplexLookup cell we're in
    let i = self.floor32(x + (x + y) * self.F2);
    let j = self.floor32(y + (x + y) * self.F2);

    // The x,y distances from the cell origin
    const x0 = x - i + (i + j) * self.G2;
    const y0 = y - j + (i + j) * self.G2;

    let i1 = 0;
    let j1 = 1;

    // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    }

    // Offsets for middle corner in (x,y) unskewed coords
    const x1 = x0 - i1 + self.G2;
    const y1 = y0 - j1 + self.G2;

    // Offsets for last corner in (x,y) unskewed coords
    const x2 = x0 - self.H2;
    const y2 = y0 - self.H2;

    i = i % 256;
    j = j % 256;

    const t0 = 0.5 - x0 * x0 - y0 * y0;
    const t1 = 0.5 - x1 * x1 - y1 * y1;
    const t2 = 0.5 - x2 * x2 - y2 * y2;

    const n0 =
      t0 *
      t0 *
      t0 *
      t0 *
      self.gradient2d(self.permutation[i + self.permutation[j]], x0, y0);
    const n1 =
      t1 *
      t1 *
      t1 *
      t1 *
      self.gradient2d(
        self.permutation[i + i1 + self.permutation[j + j1]],
        x1,
        y1
      );
    const n2 =
      t2 *
      t2 *
      t2 *
      t2 *
      self.gradient2d(
        self.permutation[i + 1 + self.permutation[j + 1]],
        x2,
        y2
      );

    return 40.0 * (n0 + n1 + n2);
  };

  /*
   * 3d Signed ofSimplex Noise
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @returns {Number}
   */
  this.signedNoise3d = (x, y, z) => {
    // Skew the input space to determine which simplexLookup cell we're in
    const s = (x + y + z) * self.F3;

    const i = self.floor32(x + s);
    const j = self.floor32(y + s);
    const k = self.floor32(z + s);

    const t = (i + j + k) * self.G3;

    // The x,y,z distances from the cell origin
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);

    let i1;
    let j1;
    let k1;
    let i2;
    let j2;
    let k2;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // X Y Z order
      else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // X Z Y order
      else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // Z X Y order
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Z Y X order
      else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Y Z X order
      else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // Y X Z order
    }

    // Offsets for second corner in (x,y,z) coords
    const x1 = x0 - i1 + self.G3;
    const y1 = y0 - j1 + self.G3;
    const z1 = z0 - k1 + self.G3;

    // Offsets for third corner in (x,y,z) coords
    const x2 = x0 - i2 + self.F3;
    const y2 = y0 - j2 + self.F3;
    const z2 = z0 - k2 + self.F3;

    // Offsets for last corner in (x,y,z) coords
    const x3 = x0 - 0.5;
    const y3 = y0 - 0.5;
    const z3 = z0 - 0.5;

    // Calculate the contribution from the four corners
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;

    const n0 =
      t0 < 0.0
        ? 0.0
        : (t0 *= t0) *
          t0 *
          self.gradient3d(
            self.permMod12[i + self.permutation[j + self.permutation[k]]],
            x0,
            y0,
            z0
          );
    const n1 =
      t1 < 0.0
        ? 0.0
        : (t1 *= t1) *
          t1 *
          self.gradient3d(
            self.permMod12[
              i + i1 + self.permutation[j + j1 + self.permutation[k + k1]]
            ],
            x1,
            y1,
            z1
          );
    const n2 =
      t2 < 0.0
        ? 0.0
        : (t2 *= t2) *
          t2 *
          self.gradient3d(
            self.permMod12[
              i + i2 + self.permutation[j + j2 + self.permutation[k + k2]]
            ],
            x2,
            y2,
            z2
          );
    const n3 =
      t3 < 0.0
        ? 0.0
        : (t3 *= t3) *
          t3 *
          self.gradient3d(
            self.permMod12[
              i + 1 + self.permutation[j + 1 + self.permutation[k + 1]]
            ],
            x3,
            y3,
            z3
          );

    return 32.0 * (n0 + n1 + n2 + n3);
  };

  /*
   * 4d Signed ofSimplex Noise
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @param {Number} w
   * @returns {Number}
   */
  this.signedNoise4d = (x, y, z, w) => {
    let n0;
    let n1;
    let n2;
    let n3;
    let n4;
    /* Noise contributions from the five corners */

    /* Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in */
    const s = (x + y + z + w) * self.F4; /* Factor for 4D skewing */
    const xs = x + s;
    const ys = y + s;
    const zs = z + s;
    const ws = w + s;
    let i = self.floor32(xs);
    let j = self.floor32(ys);
    let k = self.floor32(zs);
    const l = self.floor32(ws);

    const t = (i + j + k + l) * self.G4; /* Factor for 4D unskewing */
    const X0 = i - t; /* Unskew the cell origin back to (x,y,z,w) space */
    const Y0 = j - t;
    const Z0 = k - t;
    const W0 = l - t;

    const x0 = x - X0; /* The x,y,z,w distances from the cell origin */
    const y0 = y - Y0;
    const z0 = z - Z0;
    const w0 = w - W0;

    /* For the 4D case, the simplexLookup is a 4D shape I won't even try to describe. */
    /* To find out which of the 24 possible simplices we're in, we need to */
    /* determine the magnitude ordering of x0, y0, z0 and w0. */
    /* The method below is a good way of finding the ordering of x,y,z,w and */
    /* then find the correct traversal order for the simplexLookup we're in. */
    /* First, six pair-wise comparisons are performed between each possible pair */
    /* of the four coordinates, and the results are used to add up binary bits */
    /* for an integer index. */
    const c1 = self.int(x0 > y0 ? 32 : 0);
    const c2 = self.int(x0 > z0 ? 16 : 0);
    const c3 = self.int(y0 > z0 ? 8 : 0);
    const c4 = self.int(x0 > w0 ? 4 : 0);
    const c5 = self.int(y0 > w0 ? 2 : 0);
    const c6 = self.int(z0 > w0 ? 1 : 0);
    const c = c1 + c2 + c3 + c4 + c5 + c6;

    let i1;
    let j1;
    let k1;
    let l1;

    /* The integer offsets for the second simplexLookup corner */
    let i2;

    let j2;
    let k2;
    let l2;

    /* The integer offsets for the third simplexLookup corner */
    let i3;

    let j3;
    let k3;
    let l3;

    /* The integer offsets for the fourth simplexLookup corner */

    let x1;

    let y1;
    let z1;
    let w1;
    let x2;
    let y2;
    let z2;
    let w2;
    let x3;
    let y3;
    let z3;
    let w3;
    let x4;
    let y4;
    let z4;
    let w4;
    let ll;
    let t0;
    let t1;
    let t2;
    let t3;
    let t4;

    /* simplexLookup[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order. */
    /* Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w */
    /* impossible. Only the 24 indices which have non-zero entries make any sense. */
    /* The number 3 in the "simplexLookup" array is at the position of the largest coordinate. */
    i1 = self.simplexLookup[c][0] >= 3 ? 1 : 0;
    j1 = self.simplexLookup[c][1] >= 3 ? 1 : 0;
    k1 = self.simplexLookup[c][2] >= 3 ? 1 : 0;
    l1 = self.simplexLookup[c][3] >= 3 ? 1 : 0;
    /* The number 2 in the "simplexLookup" array is at the second largest coordinate. */
    i2 = self.simplexLookup[c][0] >= 2 ? 1 : 0;
    j2 = self.simplexLookup[c][1] >= 2 ? 1 : 0;
    k2 = self.simplexLookup[c][2] >= 2 ? 1 : 0;
    l2 = self.simplexLookup[c][3] >= 2 ? 1 : 0;
    /* The number 1 in the "simplexLookup" array is at the second smallest coordinate. */
    i3 = self.simplexLookup[c][0] >= 1 ? 1 : 0;
    j3 = self.simplexLookup[c][1] >= 1 ? 1 : 0;
    k3 = self.simplexLookup[c][2] >= 1 ? 1 : 0;
    l3 = self.simplexLookup[c][3] >= 1 ? 1 : 0;
    /* The fifth corner has all coordinate offsets = 1, so no need to look that up. */

    x1 = x0 - i1 + self.G4; /* Offsets for second corner in (x,y,z,w) coords */
    y1 = y0 - j1 + self.G4;
    z1 = z0 - k1 + self.G4;
    w1 = w0 - l1 + self.G4;
    x2 =
      x0 -
      i2 +
      2.0 * self.G4; /* Offsets for third corner in (x,y,z,w) coords */
    y2 = y0 - j2 + 2.0 * self.G4;
    z2 = z0 - k2 + 2.0 * self.G4;
    w2 = w0 - l2 + 2.0 * self.G4;
    x3 =
      x0 -
      i3 +
      3.0 * self.G4; /* Offsets for fourth corner in (x,y,z,w) coords */
    y3 = y0 - j3 + 3.0 * self.G4;
    z3 = z0 - k3 + 3.0 * self.G4;
    w3 = w0 - l3 + 3.0 * self.G4;
    x4 =
      x0 -
      1.0 +
      4.0 * self.G4; /* Offsets for last corner in (x,y,z,w) coords */
    y4 = y0 - 1.0 + 4.0 * self.G4;
    z4 = z0 - 1.0 + 4.0 * self.G4;
    w4 = w0 - 1.0 + 4.0 * self.G4;

    /* Wrap the integer indices at 256, to avoid indexing permutation[] out of bounds */
    i = i % 256;
    j = j % 256;
    k = k % 256;
    ll = l % 256;

    /* Calculate the contribution from the five corners */
    t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    if (t0 < 0.0) {
      n0 = 0.0;
    } else {
      t0 *= t0;
      n0 =
        t0 *
        t0 *
        self.gradient4d(
          self.permutation[
            i + self.permutation[j + self.permutation[k + self.permutation[ll]]]
          ],
          x0,
          y0,
          z0,
          w0
        );
    }

    t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    if (t1 < 0.0) {
      n1 = 0.0;
    } else {
      t1 *= t1;
      n1 =
        t1 *
        t1 *
        self.gradient4d(
          self.permutation[
            i +
              i1 +
              self.permutation[
                j + j1 + self.permutation[k + k1 + self.permutation[ll + l1]]
              ]
          ],
          x1,
          y1,
          z1,
          w1
        );
    }

    t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    if (t2 < 0.0) {
      n2 = 0.0;
    } else {
      t2 *= t2;
      n2 =
        t2 *
        t2 *
        self.gradient4d(
          self.permutation[
            i +
              i2 +
              self.permutation[
                j + j2 + self.permutation[k + k2 + self.permutation[ll + l2]]
              ]
          ],
          x2,
          y2,
          z2,
          w2
        );
    }

    t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    if (t3 < 0.0) {
      n3 = 0.0;
    } else {
      t3 *= t3;
      n3 =
        t3 *
        t3 *
        self.gradient4d(
          self.permutation[
            i +
              i3 +
              self.permutation[
                j + j3 + self.permutation[k + k3 + self.permutation[ll + l3]]
              ]
          ],
          x3,
          y3,
          z3,
          w3
        );
    }

    t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    if (t4 < 0.0) {
      n4 = 0.0;
    } else {
      t4 *= t4;
      n4 =
        t4 *
        t4 *
        self.gradient4d(
          self.permutation[
            i +
              1 +
              self.permutation[
                j + 1 + self.permutation[k + 1 + self.permutation[ll + 1]]
              ]
          ],
          x4,
          y4,
          z4,
          w4
        );
    }

    /* Sum up and scale the result to cover the range [-1,1] */
    return (
      27.0 * (n0 + n1 + n2 + n3 + n4)
    ); /* TODO: The scale factor is preliminary! */
  };

  /*
   * 1d ofSimplex Noise
   *
   * @param {Number} x
   * @returns {Number}
   */
  this.simplexNoise1d = (x) => self.signedNoise1d(x) * 0.5 + 0.5;

  /*
   * 2d ofSimplex Noise
   *
   * @param {Number} x
   * @param {Number} y
   * @returns {Number}
   */
  this.simplexNoise2d = (x, y) => self.signedNoise2d(x, y) * 0.5 + 0.5;

  /*
   * 3d ofSimplex Noise
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @returns {Number}
   */
  this.simplexNoise3d = (x, y, z) => self.signedNoise3d(x, y, z) * 0.5 + 0.5;

  /*
   * 4d ofSimplex Noise
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @param {Number} w
   * @returns {Number}
   */
  this.simplexNoise4d = (x, y, z, w) =>
    self.signedNoise4d(x, y, z, w) * 0.5 + 0.5;

  this.fBm1d = (x, octaves, H) => {
    let output = 0.0;
    for (let i = 0; i < octaves; i++) {
      const f = Math.pow(2.0, i);
      const a = Math.pow(f, H);
      output += a * self.signedNoise1d(f * x);
    }
    return output;
  };
}

import NexusUI from "nexusui";

var audiopen = null;
var analyser = null;
var K = new kMath();

function Matrix4x4() {
  this.elements = Array(16);
  this.loadIdentity();
}

Matrix4x4.prototype = {
  scale: function (sx, sy, sz) {
    this.elements[0 * 4 + 0] *= sx;
    this.elements[0 * 4 + 1] *= sx;
    this.elements[0 * 4 + 2] *= sx;
    this.elements[0 * 4 + 3] *= sx;

    this.elements[1 * 4 + 0] *= sy;
    this.elements[1 * 4 + 1] *= sy;
    this.elements[1 * 4 + 2] *= sy;
    this.elements[1 * 4 + 3] *= sy;

    this.elements[2 * 4 + 0] *= sz;
    this.elements[2 * 4 + 1] *= sz;
    this.elements[2 * 4 + 2] *= sz;
    this.elements[2 * 4 + 3] *= sz;

    return this;
  },

  translate: function (tx, ty, tz) {
    this.elements[3 * 4 + 0] +=
      this.elements[0 * 4 + 0] * tx +
      this.elements[1 * 4 + 0] * ty +
      this.elements[2 * 4 + 0] * tz;
    this.elements[3 * 4 + 1] +=
      this.elements[0 * 4 + 1] * tx +
      this.elements[1 * 4 + 1] * ty +
      this.elements[2 * 4 + 1] * tz;
    this.elements[3 * 4 + 2] +=
      this.elements[0 * 4 + 2] * tx +
      this.elements[1 * 4 + 2] * ty +
      this.elements[2 * 4 + 2] * tz;
    this.elements[3 * 4 + 3] +=
      this.elements[0 * 4 + 3] * tx +
      this.elements[1 * 4 + 3] * ty +
      this.elements[2 * 4 + 3] * tz;

    return this;
  },

  rotate: function (angle, x, y, z) {
    var mag = Math.sqrt(x * x + y * y + z * z);
    var sinAngle = Math.sin((angle * Math.PI) / 180.0);
    var cosAngle = Math.cos((angle * Math.PI) / 180.0);

    if (mag > 0) {
      var xx, yy, zz, xy, yz, zx, xs, ys, zs;
      var oneMinusCos;
      var rotMat;

      x /= mag;
      y /= mag;
      z /= mag;

      xx = x * x;
      yy = y * y;
      zz = z * z;
      xy = x * y;
      yz = y * z;
      zx = z * x;
      xs = x * sinAngle;
      ys = y * sinAngle;
      zs = z * sinAngle;
      oneMinusCos = 1.0 - cosAngle;

      rotMat = new Matrix4x4();

      rotMat.elements[0 * 4 + 0] = oneMinusCos * xx + cosAngle;
      rotMat.elements[0 * 4 + 1] = oneMinusCos * xy - zs;
      rotMat.elements[0 * 4 + 2] = oneMinusCos * zx + ys;
      rotMat.elements[0 * 4 + 3] = 0.0;

      rotMat.elements[1 * 4 + 0] = oneMinusCos * xy + zs;
      rotMat.elements[1 * 4 + 1] = oneMinusCos * yy + cosAngle;
      rotMat.elements[1 * 4 + 2] = oneMinusCos * yz - xs;
      rotMat.elements[1 * 4 + 3] = 0.0;

      rotMat.elements[2 * 4 + 0] = oneMinusCos * zx - ys;
      rotMat.elements[2 * 4 + 1] = oneMinusCos * yz + xs;
      rotMat.elements[2 * 4 + 2] = oneMinusCos * zz + cosAngle;
      rotMat.elements[2 * 4 + 3] = 0.0;

      rotMat.elements[3 * 4 + 0] = 0.0;
      rotMat.elements[3 * 4 + 1] = 0.0;
      rotMat.elements[3 * 4 + 2] = 0.0;
      rotMat.elements[3 * 4 + 3] = 1.0;

      rotMat = rotMat.multiply(this);
      this.elements = rotMat.elements;
    }

    return this;
  },

  frustum: function (left, right, bottom, top, nearZ, farZ) {
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;
    var frust;

    if (
      nearZ <= 0.0 ||
      farZ <= 0.0 ||
      deltaX <= 0.0 ||
      deltaY <= 0.0 ||
      deltaZ <= 0.0
    )
      return this;

    frust = new Matrix4x4();

    frust.elements[0 * 4 + 0] = (2.0 * nearZ) / deltaX;
    frust.elements[0 * 4 + 1] = frust.elements[0 * 4 + 2] = frust.elements[
      0 * 4 + 3
    ] = 0.0;

    frust.elements[1 * 4 + 1] = (2.0 * nearZ) / deltaY;
    frust.elements[1 * 4 + 0] = frust.elements[1 * 4 + 2] = frust.elements[
      1 * 4 + 3
    ] = 0.0;

    frust.elements[2 * 4 + 0] = (right + left) / deltaX;
    frust.elements[2 * 4 + 1] = (top + bottom) / deltaY;
    frust.elements[2 * 4 + 2] = -(nearZ + farZ) / deltaZ;
    frust.elements[2 * 4 + 3] = -1.0;

    frust.elements[3 * 4 + 2] = (-2.0 * nearZ * farZ) / deltaZ;
    frust.elements[3 * 4 + 0] = frust.elements[3 * 4 + 1] = frust.elements[
      3 * 4 + 3
    ] = 0.0;

    frust = frust.multiply(this);
    this.elements = frust.elements;

    return this;
  },

  perspective: function (fovy, aspect, nearZ, farZ) {
    var frustumH = Math.tan((fovy / 360.0) * Math.PI) * nearZ;
    var frustumW = frustumH * aspect;

    return this.frustum(-frustumW, frustumW, -frustumH, frustumH, nearZ, farZ);
  },

  ortho: function (left, right, bottom, top, nearZ, farZ) {
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;

    var ortho = new Matrix4x4();

    if (deltaX == 0.0 || deltaY == 0.0 || deltaZ == 0.0) return this;

    ortho.elements[0 * 4 + 0] = 2.0 / deltaX;
    ortho.elements[3 * 4 + 0] = -(right + left) / deltaX;
    ortho.elements[1 * 4 + 1] = 2.0 / deltaY;
    ortho.elements[3 * 4 + 1] = -(top + bottom) / deltaY;
    ortho.elements[2 * 4 + 2] = -2.0 / deltaZ;
    ortho.elements[3 * 4 + 2] = -(nearZ + farZ) / deltaZ;

    ortho = ortho.multiply(this);
    this.elements = ortho.elements;

    return this;
  },

  multiply: function (right) {
    var tmp = new Matrix4x4();

    for (var i = 0; i < 4; i++) {
      tmp.elements[i * 4 + 0] =
        this.elements[i * 4 + 0] * right.elements[0 * 4 + 0] +
        this.elements[i * 4 + 1] * right.elements[1 * 4 + 0] +
        this.elements[i * 4 + 2] * right.elements[2 * 4 + 0] +
        this.elements[i * 4 + 3] * right.elements[3 * 4 + 0];

      tmp.elements[i * 4 + 1] =
        this.elements[i * 4 + 0] * right.elements[0 * 4 + 1] +
        this.elements[i * 4 + 1] * right.elements[1 * 4 + 1] +
        this.elements[i * 4 + 2] * right.elements[2 * 4 + 1] +
        this.elements[i * 4 + 3] * right.elements[3 * 4 + 1];

      tmp.elements[i * 4 + 2] =
        this.elements[i * 4 + 0] * right.elements[0 * 4 + 2] +
        this.elements[i * 4 + 1] * right.elements[1 * 4 + 2] +
        this.elements[i * 4 + 2] * right.elements[2 * 4 + 2] +
        this.elements[i * 4 + 3] * right.elements[3 * 4 + 2];

      tmp.elements[i * 4 + 3] =
        this.elements[i * 4 + 0] * right.elements[0 * 4 + 3] +
        this.elements[i * 4 + 1] * right.elements[1 * 4 + 3] +
        this.elements[i * 4 + 2] * right.elements[2 * 4 + 3] +
        this.elements[i * 4 + 3] * right.elements[3 * 4 + 3];
    }

    this.elements = tmp.elements;
    return this;
  },

  copy: function () {
    var tmp = new Matrix4x4();
    for (var i = 0; i < 16; i++) {
      tmp.elements[i] = this.elements[i];
    }
    return tmp;
  },

  get: function (row, col) {
    return this.elements[4 * row + col];
  },

  // In-place inversion
  invert: function () {
    var tmp_0 = this.get(2, 2) * this.get(3, 3);
    var tmp_1 = this.get(3, 2) * this.get(2, 3);
    var tmp_2 = this.get(1, 2) * this.get(3, 3);
    var tmp_3 = this.get(3, 2) * this.get(1, 3);
    var tmp_4 = this.get(1, 2) * this.get(2, 3);
    var tmp_5 = this.get(2, 2) * this.get(1, 3);
    var tmp_6 = this.get(0, 2) * this.get(3, 3);
    var tmp_7 = this.get(3, 2) * this.get(0, 3);
    var tmp_8 = this.get(0, 2) * this.get(2, 3);
    var tmp_9 = this.get(2, 2) * this.get(0, 3);
    var tmp_10 = this.get(0, 2) * this.get(1, 3);
    var tmp_11 = this.get(1, 2) * this.get(0, 3);
    var tmp_12 = this.get(2, 0) * this.get(3, 1);
    var tmp_13 = this.get(3, 0) * this.get(2, 1);
    var tmp_14 = this.get(1, 0) * this.get(3, 1);
    var tmp_15 = this.get(3, 0) * this.get(1, 1);
    var tmp_16 = this.get(1, 0) * this.get(2, 1);
    var tmp_17 = this.get(2, 0) * this.get(1, 1);
    var tmp_18 = this.get(0, 0) * this.get(3, 1);
    var tmp_19 = this.get(3, 0) * this.get(0, 1);
    var tmp_20 = this.get(0, 0) * this.get(2, 1);
    var tmp_21 = this.get(2, 0) * this.get(0, 1);
    var tmp_22 = this.get(0, 0) * this.get(1, 1);
    var tmp_23 = this.get(1, 0) * this.get(0, 1);

    var t0 =
      tmp_0 * this.get(1, 1) +
      tmp_3 * this.get(2, 1) +
      tmp_4 * this.get(3, 1) -
      (tmp_1 * this.get(1, 1) +
        tmp_2 * this.get(2, 1) +
        tmp_5 * this.get(3, 1));
    var t1 =
      tmp_1 * this.get(0, 1) +
      tmp_6 * this.get(2, 1) +
      tmp_9 * this.get(3, 1) -
      (tmp_0 * this.get(0, 1) +
        tmp_7 * this.get(2, 1) +
        tmp_8 * this.get(3, 1));
    var t2 =
      tmp_2 * this.get(0, 1) +
      tmp_7 * this.get(1, 1) +
      tmp_10 * this.get(3, 1) -
      (tmp_3 * this.get(0, 1) +
        tmp_6 * this.get(1, 1) +
        tmp_11 * this.get(3, 1));
    var t3 =
      tmp_5 * this.get(0, 1) +
      tmp_8 * this.get(1, 1) +
      tmp_11 * this.get(2, 1) -
      (tmp_4 * this.get(0, 1) +
        tmp_9 * this.get(1, 1) +
        tmp_10 * this.get(2, 1));

    var d =
      1.0 /
      (this.get(0, 0) * t0 +
        this.get(1, 0) * t1 +
        this.get(2, 0) * t2 +
        this.get(3, 0) * t3);

    var out_00 = d * t0;
    var out_01 = d * t1;
    var out_02 = d * t2;
    var out_03 = d * t3;

    var out_10 =
      d *
      (tmp_1 * this.get(1, 0) +
        tmp_2 * this.get(2, 0) +
        tmp_5 * this.get(3, 0) -
        (tmp_0 * this.get(1, 0) +
          tmp_3 * this.get(2, 0) +
          tmp_4 * this.get(3, 0)));
    var out_11 =
      d *
      (tmp_0 * this.get(0, 0) +
        tmp_7 * this.get(2, 0) +
        tmp_8 * this.get(3, 0) -
        (tmp_1 * this.get(0, 0) +
          tmp_6 * this.get(2, 0) +
          tmp_9 * this.get(3, 0)));
    var out_12 =
      d *
      (tmp_3 * this.get(0, 0) +
        tmp_6 * this.get(1, 0) +
        tmp_11 * this.get(3, 0) -
        (tmp_2 * this.get(0, 0) +
          tmp_7 * this.get(1, 0) +
          tmp_10 * this.get(3, 0)));
    var out_13 =
      d *
      (tmp_4 * this.get(0, 0) +
        tmp_9 * this.get(1, 0) +
        tmp_10 * this.get(2, 0) -
        (tmp_5 * this.get(0, 0) +
          tmp_8 * this.get(1, 0) +
          tmp_11 * this.get(2, 0)));

    var out_20 =
      d *
      (tmp_12 * this.get(1, 3) +
        tmp_15 * this.get(2, 3) +
        tmp_16 * this.get(3, 3) -
        (tmp_13 * this.get(1, 3) +
          tmp_14 * this.get(2, 3) +
          tmp_17 * this.get(3, 3)));
    var out_21 =
      d *
      (tmp_13 * this.get(0, 3) +
        tmp_18 * this.get(2, 3) +
        tmp_21 * this.get(3, 3) -
        (tmp_12 * this.get(0, 3) +
          tmp_19 * this.get(2, 3) +
          tmp_20 * this.get(3, 3)));
    var out_22 =
      d *
      (tmp_14 * this.get(0, 3) +
        tmp_19 * this.get(1, 3) +
        tmp_22 * this.get(3, 3) -
        (tmp_15 * this.get(0, 3) +
          tmp_18 * this.get(1, 3) +
          tmp_23 * this.get(3, 3)));
    var out_23 =
      d *
      (tmp_17 * this.get(0, 3) +
        tmp_20 * this.get(1, 3) +
        tmp_23 * this.get(2, 3) -
        (tmp_16 * this.get(0, 3) +
          tmp_21 * this.get(1, 3) +
          tmp_22 * this.get(2, 3)));

    var out_30 =
      d *
      (tmp_14 * this.get(2, 2) +
        tmp_17 * this.get(3, 2) +
        tmp_13 * this.get(1, 2) -
        (tmp_16 * this.get(3, 2) +
          tmp_12 * this.get(1, 2) +
          tmp_15 * this.get(2, 2)));
    var out_31 =
      d *
      (tmp_20 * this.get(3, 2) +
        tmp_12 * this.get(0, 2) +
        tmp_19 * this.get(2, 2) -
        (tmp_18 * this.get(2, 2) +
          tmp_21 * this.get(3, 2) +
          tmp_13 * this.get(0, 2)));
    var out_32 =
      d *
      (tmp_18 * this.get(1, 2) +
        tmp_23 * this.get(3, 2) +
        tmp_15 * this.get(0, 2) -
        (tmp_22 * this.get(3, 2) +
          tmp_14 * this.get(0, 2) +
          tmp_19 * this.get(1, 2)));
    var out_33 =
      d *
      (tmp_22 * this.get(2, 2) +
        tmp_16 * this.get(0, 2) +
        tmp_21 * this.get(1, 2) -
        (tmp_20 * this.get(1, 2) +
          tmp_23 * this.get(2, 2) +
          tmp_17 * this.get(0, 2)));

    this.elements[0 * 4 + 0] = out_00;
    this.elements[0 * 4 + 1] = out_01;
    this.elements[0 * 4 + 2] = out_02;
    this.elements[0 * 4 + 3] = out_03;
    this.elements[1 * 4 + 0] = out_10;
    this.elements[1 * 4 + 1] = out_11;
    this.elements[1 * 4 + 2] = out_12;
    this.elements[1 * 4 + 3] = out_13;
    this.elements[2 * 4 + 0] = out_20;
    this.elements[2 * 4 + 1] = out_21;
    this.elements[2 * 4 + 2] = out_22;
    this.elements[2 * 4 + 3] = out_23;
    this.elements[3 * 4 + 0] = out_30;
    this.elements[3 * 4 + 1] = out_31;
    this.elements[3 * 4 + 2] = out_32;
    this.elements[3 * 4 + 3] = out_33;
    return this;
  },

  // Returns new matrix which is the inverse of this
  inverse: function () {
    var tmp = this.copy();
    return tmp.invert();
  },

  // In-place transpose
  transpose: function () {
    var tmp = this.elements[0 * 4 + 1];
    this.elements[0 * 4 + 1] = this.elements[1 * 4 + 0];
    this.elements[1 * 4 + 0] = tmp;

    tmp = this.elements[0 * 4 + 2];
    this.elements[0 * 4 + 2] = this.elements[2 * 4 + 0];
    this.elements[2 * 4 + 0] = tmp;

    tmp = this.elements[0 * 4 + 3];
    this.elements[0 * 4 + 3] = this.elements[3 * 4 + 0];
    this.elements[3 * 4 + 0] = tmp;

    tmp = this.elements[1 * 4 + 2];
    this.elements[1 * 4 + 2] = this.elements[2 * 4 + 1];
    this.elements[2 * 4 + 1] = tmp;

    tmp = this.elements[1 * 4 + 3];
    this.elements[1 * 4 + 3] = this.elements[3 * 4 + 1];
    this.elements[3 * 4 + 1] = tmp;

    tmp = this.elements[2 * 4 + 3];
    this.elements[2 * 4 + 3] = this.elements[3 * 4 + 2];
    this.elements[3 * 4 + 2] = tmp;

    return this;
  },

  loadIdentity: function () {
    for (var i = 0; i < 16; i++) this.elements[i] = 0;
    this.elements[0 * 4 + 0] = 1.0;
    this.elements[1 * 4 + 1] = 1.0;
    this.elements[2 * 4 + 2] = 1.0;
    this.elements[3 * 4 + 3] = 1.0;
    return this;
  },
};

function CameraController(element, opt_canvas, opt_context) {
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

var ANALYSISTYPE_FREQUENCY = 0;
var ANALYSISTYPE_SONOGRAM = 1;
var ANALYSISTYPE_3D_SONOGRAM = 2;
var ANALYSISTYPE_WAVEFORM = 3;

// The "model" matrix is the "world" matrix in Standard Annotations and Semantics
var model = 0;
var view = 0;
var projection = 0;

var shader = shader || {};

shader.loadFromScriptNodes = (gl, vertexScriptName, fragmentScriptName) => {
  const vertexScript = document.getElementById(vertexScriptName);
  const fragmentScript = document.getElementById(fragmentScriptName);
  if (!vertexScript || !fragmentScript) return null;
  return new shader.Shader(gl, vertexScript.text, fragmentScript.text);
};

shader.loadTextFileSynchronous = (url) => {
  const error = `loadTextFileSynchronous failed to load url "${url}"`;
  let request;

  request = new XMLHttpRequest();
  if (request.overrideMimeType) {
    request.overrideMimeType("text/plain");
  }

  request.open("GET", url, false);
  request.send(null);
  if (request.readyState != 4) {
    throw error;
  }
  return request.responseText;
};

shader.loadFromURL = (gl, vertexURL, fragmentURL) => {
  const vertexText = shader.loadTextFileSynchronous(vertexURL);
  const fragmentText = shader.loadTextFileSynchronous(fragmentURL);

  if (!vertexText || !fragmentText) return null;
  return new shader.Shader(gl, vertexText, fragmentText);
};

shader.glslNameToJs_ = (name) => {
  return name.replace(/_(.)/g, (_, p1) => {
    return p1.toUpperCase();
  });
};

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

function createGLErrorWrapper(context, fname) {
  return function () {
    var rv = context[fname].apply(context, arguments);
    var err = context.getError();
    if (err != 0) throw "GL error " + err + " in " + fname;
    return rv;
  };
}

function create3DDebugContext(context) {
  // Thanks to Ilmari Heikkinen for the idea on how to implement this so elegantly.
  var wrap = {};
  for (var i in context) {
    try {
      if (typeof context[i] == "function") {
        wrap[i] = createGLErrorWrapper(context, i);
      } else {
        wrap[i] = context[i];
      }
    } catch (e) {
      // console.log("create3DDebugContext: Error accessing " + i);
    }
  }
  wrap.getError = function () {
    return context.getError();
  };
  return wrap;
}

/**
 * Class AnalyserView
 */

var AnalyserView = function (canvasElementID) {
  this.canvasElementID = canvasElementID;

  // NOTE: the default value of this needs to match the selected radio button

  // This analysis type may be overriden later on if we discover we don't support the right shader features.
  this.analysisType = ANALYSISTYPE_3D_SONOGRAM;

  this.sonogram3DWidth = 256;
  this.sonogram3DHeight = 256;
  this.sonogram3DGeometrySize = 10;
  this.freqByteData = 0;
  this.texture = 0;
  this.TEXTURE_HEIGHT = 256;
  this.yoffset = 0;

  this.frequencyShader = 0;
  this.waveformShader = 0;
  this.sonogramShader = 0;
  this.sonogram3DShader = 0;

  // Background color
  this.backgroundColor = [191.0 / 255.0, 169.0 / 255.0, 135.0 / 255.0, 1.0];
  // Foreground color
  this.foregroundColor = [63.0 / 255.0, 39.0 / 255.0, 0.0 / 255.0, 1.0];

  this.initGL();
};

AnalyserView.prototype.initGL = function () {
  model = new Matrix4x4();
  view = new Matrix4x4();
  projection = new Matrix4x4();

  var sonogram3DWidth = this.sonogram3DWidth;
  var sonogram3DHeight = this.sonogram3DHeight;
  var sonogram3DGeometrySize = this.sonogram3DGeometrySize;
  var backgroundColor = this.backgroundColor;

  var canvas = document.getElementById(this.canvasElementID);
  this.canvas = canvas;

  // var gl = create3DDebugContext(canvas.getContext("experimental-webgl"));
  var gl = canvas.getContext("experimental-webgl");
  this.gl = gl;

  // If we're missing this shader feature, then we can't do the 3D visualization.
  this.has3DVisualizer = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;

  if (!this.has3DVisualizer && this.analysisType == ANALYSISTYPE_3D_SONOGRAM)
    this.analysisType = ANALYSISTYPE_FREQUENCY;

  var cameraController = new CameraController(canvas);
  this.cameraController = cameraController;

  cameraController.xRot = -45; //-55;
  cameraController.yRot = 0;
  gl.clearColor(
    backgroundColor[0],
    backgroundColor[1],
    backgroundColor[2],
    backgroundColor[3]
  );
  gl.enable(gl.DEPTH_TEST);

  // Initialization for the 2D visualizations
  var vertices = new Float32Array([
    1.0,
    1.0,
    0.0,
    -1.0,
    1.0,
    0.0,
    -1.0,
    -1.0,
    0.0,
    1.0,
    1.0,
    0.0,
    -1.0,
    -1.0,
    0.0,
    1.0,
    -1.0,
    0.0,
  ]);
  var texCoords = new Float32Array([
    1.0,
    1.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
  ]);

  var vboTexCoordOffset = vertices.byteLength;
  this.vboTexCoordOffset = vboTexCoordOffset;

  // Create the vertices and texture coordinates
  var vbo = gl.createBuffer();
  this.vbo = vbo;

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    vboTexCoordOffset + texCoords.byteLength,
    gl.STATIC_DRAW
  );
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
  gl.bufferSubData(gl.ARRAY_BUFFER, vboTexCoordOffset, texCoords);

  // Initialization for the 3D visualizations
  var numVertices = sonogram3DWidth * sonogram3DHeight;
  if (numVertices > 65536) {
    throw "Sonogram 3D resolution is too high: can only handle 65536 vertices max";
  }
  vertices = new Float32Array(numVertices * 3);
  texCoords = new Float32Array(numVertices * 2);

  for (var z = 0; z < sonogram3DHeight; z++) {
    for (var x = 0; x < sonogram3DWidth; x++) {
      // Generate a reasonably fine mesh in the X-Z plane
      vertices[3 * (sonogram3DWidth * z + x) + 0] =
        (sonogram3DGeometrySize * (x - sonogram3DWidth / 2)) / sonogram3DWidth;
      vertices[3 * (sonogram3DWidth * z + x) + 1] = 0;
      vertices[3 * (sonogram3DWidth * z + x) + 2] =
        (sonogram3DGeometrySize * (z - sonogram3DHeight / 2)) /
        sonogram3DHeight;

      texCoords[2 * (sonogram3DWidth * z + x) + 0] = x / (sonogram3DWidth - 1);
      texCoords[2 * (sonogram3DWidth * z + x) + 1] = z / (sonogram3DHeight - 1);
    }
  }

  var vbo3DTexCoordOffset = vertices.byteLength;
  this.vbo3DTexCoordOffset = vbo3DTexCoordOffset;

  // Create the vertices and texture coordinates
  var sonogram3DVBO = gl.createBuffer();
  this.sonogram3DVBO = sonogram3DVBO;

  gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    vbo3DTexCoordOffset + texCoords.byteLength,
    gl.STATIC_DRAW
  );
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
  gl.bufferSubData(gl.ARRAY_BUFFER, vbo3DTexCoordOffset, texCoords);

  // Now generate indices
  var sonogram3DNumIndices = (sonogram3DWidth - 1) * (sonogram3DHeight - 1) * 6;
  this.sonogram3DNumIndices = sonogram3DNumIndices;

  var indices = new Uint16Array(sonogram3DNumIndices);
  // We need to use TRIANGLES instead of for example TRIANGLE_STRIP
  // because we want to make one draw call instead of hundreds per
  // frame, and unless we produce degenerate triangles (which are very
  // ugly) we won't be able to split the rows.
  var idx = 0;
  for (var z = 0; z < sonogram3DHeight - 1; z++) {
    for (var x = 0; x < sonogram3DWidth - 1; x++) {
      indices[idx++] = z * sonogram3DWidth + x;
      indices[idx++] = z * sonogram3DWidth + x + 1;
      indices[idx++] = (z + 1) * sonogram3DWidth + x + 1;
      indices[idx++] = z * sonogram3DWidth + x;
      indices[idx++] = (z + 1) * sonogram3DWidth + x + 1;
      indices[idx++] = (z + 1) * sonogram3DWidth + x;
    }
  }

  var sonogram3DIBO = gl.createBuffer();
  this.sonogram3DIBO = sonogram3DIBO;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sonogram3DIBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  // Note we do not unbind this buffer -- not necessary

  // Load the shaders
  this.frequencyShader = shader.loadFromURL(
    gl,
    "shaders/common-vertex.shader",
    "shaders/frequency-fragment.shader"
  );
  this.waveformShader = shader.loadFromURL(
    gl,
    "shaders/common-vertex.shader",
    "shaders/waveform-fragment.shader"
  );
  this.sonogramShader = shader.loadFromURL(
    gl,
    "shaders/common-vertex.shader",
    "shaders/sonogram-fragment.shader"
  );

  if (this.has3DVisualizer)
    this.sonogram3DShader = shader.loadFromURL(
      gl,
      "shaders/sonogram-vertex.shader",
      "shaders/sonogram-fragment.shader"
    );
};

AnalyserView.prototype.initByteBuffer = function () {
  var gl = this.gl;
  var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;

  if (
    !this.freqByteData ||
    this.freqByteData.length != analyser.frequencyBinCount
  ) {
    freqByteData = new Uint8Array(analyser.frequencyBinCount);
    this.freqByteData = freqByteData;

    // (Re-)Allocate the texture object
    if (this.texture) {
      gl.deleteTexture(this.texture);
      this.texture = null;
    }
    var texture = gl.createTexture();
    this.texture = texture;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // TODO(kbr): WebGL needs to properly clear out the texture when null is specified
    var tmp = new Uint8Array(freqByteData.length * TEXTURE_HEIGHT);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.ALPHA,
      freqByteData.length,
      TEXTURE_HEIGHT,
      0,
      gl.ALPHA,
      gl.UNSIGNED_BYTE,
      tmp
    );
  }
};

AnalyserView.prototype.setAnalysisType = function (type) {
  // Check for read textures in vertex shaders.
  if (!this.has3DVisualizer && type == ANALYSISTYPE_3D_SONOGRAM) return;

  this.analysisType = type;
};

AnalyserView.prototype.analysisType = function () {
  return this.analysisType;
};

AnalyserView.prototype.doFrequencyAnalysis = function (event) {
  freqByteData = this.freqByteData;

  switch (this.analysisType) {
    case ANALYSISTYPE_FREQUENCY:
      analyser.smoothingTimeConstant = 0.75;
      analyser.getByteFrequencyData(freqByteData);
      break;

    case ANALYSISTYPE_SONOGRAM:
    case ANALYSISTYPE_3D_SONOGRAM:
      analyser.smoothingTimeConstant = 0.1;
      analyser.getByteFrequencyData(freqByteData);
      break;

    case ANALYSISTYPE_WAVEFORM:
      analyser.smoothingTimeConstant = 0.1;
      analyser.getByteTimeDomainData(freqByteData);
      break;
  }

  this.drawGL();
};

AnalyserView.prototype.drawGL = function () {
  var canvas = this.canvas;
  var gl = this.gl;
  var vbo = this.vbo;
  var vboTexCoordOffset = this.vboTexCoordOffset;
  var sonogram3DVBO = this.sonogram3DVBO;
  var vbo3DTexCoordOffset = this.vbo3DTexCoordOffset;
  var sonogram3DGeometrySize = this.sonogram3DGeometrySize;
  var sonogram3DNumIndices = this.sonogram3DNumIndices;
  var sonogram3DWidth = this.sonogram3DWidth;
  var sonogram3DHeight = this.sonogram3DHeight;
  var freqByteData = this.freqByteData;
  var texture = this.texture;
  var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;

  var frequencyShader = this.frequencyShader;
  var waveformShader = this.waveformShader;
  var sonogramShader = this.sonogramShader;
  var sonogram3DShader = this.sonogram3DShader;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  if (
    this.analysisType != ANALYSISTYPE_SONOGRAM &&
    this.analysisType != ANALYSISTYPE_3D_SONOGRAM
  ) {
    this.yoffset = 0;
  }

  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    0,
    this.yoffset,
    freqByteData.length,
    1,
    gl.ALPHA,
    gl.UNSIGNED_BYTE,
    freqByteData
  );

  if (
    this.analysisType == ANALYSISTYPE_SONOGRAM ||
    this.analysisType == ANALYSISTYPE_3D_SONOGRAM
  ) {
    this.yoffset = (this.yoffset + 1) % TEXTURE_HEIGHT;
  }
  var yoffset = this.yoffset;

  // Point the frequency data texture at texture unit 0 (the default),
  // which is what we're using since we haven't called activeTexture
  // in our program

  var vertexLoc;
  var texCoordLoc;
  var frequencyDataLoc;
  var foregroundColorLoc;
  var backgroundColorLoc;
  var texCoordOffset;

  var currentShader;

  switch (this.analysisType) {
    case ANALYSISTYPE_FREQUENCY:
    case ANALYSISTYPE_WAVEFORM:
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      currentShader =
        this.analysisType == ANALYSISTYPE_FREQUENCY
          ? frequencyShader
          : waveformShader;
      currentShader.bind();
      vertexLoc = currentShader.gPositionLoc;
      texCoordLoc = currentShader.gTexCoord0Loc;
      frequencyDataLoc = currentShader.frequencyDataLoc;
      foregroundColorLoc = currentShader.foregroundColorLoc;
      backgroundColorLoc = currentShader.backgroundColorLoc;
      gl.uniform1f(currentShader.yoffsetLoc, 0.5 / (TEXTURE_HEIGHT - 1));
      texCoordOffset = vboTexCoordOffset;
      break;

    case ANALYSISTYPE_SONOGRAM:
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      sonogramShader.bind();
      vertexLoc = sonogramShader.gPositionLoc;
      texCoordLoc = sonogramShader.gTexCoord0Loc;
      frequencyDataLoc = sonogramShader.frequencyDataLoc;
      foregroundColorLoc = sonogramShader.foregroundColorLoc;
      backgroundColorLoc = sonogramShader.backgroundColorLoc;
      gl.uniform1f(sonogramShader.yoffsetLoc, yoffset / (TEXTURE_HEIGHT - 1));
      texCoordOffset = vboTexCoordOffset;
      break;

    case ANALYSISTYPE_3D_SONOGRAM:
      gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO);
      sonogram3DShader.bind();
      vertexLoc = sonogram3DShader.gPositionLoc;
      texCoordLoc = sonogram3DShader.gTexCoord0Loc;
      frequencyDataLoc = sonogram3DShader.frequencyDataLoc;
      foregroundColorLoc = sonogram3DShader.foregroundColorLoc;
      backgroundColorLoc = sonogram3DShader.backgroundColorLoc;
      gl.uniform1i(sonogram3DShader.vertexFrequencyDataLoc, 0);
      var normalizedYOffset = this.yoffset / (TEXTURE_HEIGHT - 1);
      gl.uniform1f(sonogram3DShader.yoffsetLoc, normalizedYOffset);
      var discretizedYOffset =
        Math.floor(normalizedYOffset * (sonogram3DHeight - 1)) /
        (sonogram3DHeight - 1);
      gl.uniform1f(sonogram3DShader.vertexYOffsetLoc, discretizedYOffset);
      gl.uniform1f(
        sonogram3DShader.verticalScaleLoc,
        sonogram3DGeometrySize / 4.0
      );

      // Set up the model, view and projection matrices
      projection.loadIdentity();
      projection.perspective(55 /*35*/, canvas.width / canvas.height, 1, 100);
      view.loadIdentity();
      view.translate(0, 0, -10.0 /*-13.0*/);

      // Add in camera controller's rotation
      model.loadIdentity();
      model.rotate(this.cameraController.xRot, 1, 0, 0);
      model.rotate(this.cameraController.yRot, 0, 1, 0);

      // Compute necessary matrices
      var mvp = new Matrix4x4();
      mvp.multiply(model);
      mvp.multiply(view);
      mvp.multiply(projection);
      gl.uniformMatrix4fv(
        sonogram3DShader.worldViewProjectionLoc,
        gl.FALSE,
        mvp.elements
      );
      texCoordOffset = vbo3DTexCoordOffset;
      break;
  }

  if (frequencyDataLoc) {
    gl.uniform1i(frequencyDataLoc, 0);
  }
  if (foregroundColorLoc) {
    gl.uniform4fv(foregroundColorLoc, this.foregroundColor);
  }
  if (backgroundColorLoc) {
    gl.uniform4fv(backgroundColorLoc, this.backgroundColor);
  }

  // Set up the vertex attribute arrays
  gl.enableVertexAttribArray(vertexLoc);
  gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordLoc);
  gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, gl.FALSE, 0, texCoordOffset);

  // Clear the render area
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Actually draw
  if (
    this.analysisType == ANALYSISTYPE_FREQUENCY ||
    this.analysisType == ANALYSISTYPE_WAVEFORM ||
    this.analysisType == ANALYSISTYPE_SONOGRAM
  ) {
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  } else if (this.analysisType == ANALYSISTYPE_3D_SONOGRAM) {
    // Note: this expects the element array buffer to still be bound
    gl.drawElements(gl.TRIANGLES, sonogram3DNumIndices, gl.UNSIGNED_SHORT, 0);
  }

  // Disable the attribute arrays for cleanliness
  gl.disableVertexAttribArray(vertexLoc);
  gl.disableVertexAttribArray(texCoordLoc);
};

function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else if (!el.matches("." + className)) {
    el.className += " " + className;
  }
}

function removeClass(el, className) {
  if (el.classList) el.classList.remove(className);
  else if (!el.matches("." + className)) {
    var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
    el.className = el.className.replace(reg, " ");
  }
}

window.onload = () => {
  console.log(window.editor);
  var editor = document.getElementById("editor");
  var editorToggle = NexusUI.Add.Toggle("#header-panel");

  editorToggle.on("change", function (v) {
    if (!editor.matches(".visible")) {
      removeClass(editor, "visible");
    } else {
      addClass(editor, "visible");
    }
  });

  var vizSelect = NexusUI.Add.RadioButton("#header-panel", {
    size: [120, 25],
    numberOfButtons: 4,
    active: -1,
  });

  audiopen = new AudioPen();

  if (navigator.mediaDevices) {
    console.log("getUserMedia supported.");
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .then((stream) => {
        audiopen.start(stream);
      })
      .catch((err) => {
        console.log(`The following gUM error occured: ${err}`);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
};

function AudioPen() {
  this.apiFunctionNames = ["process"];
  this.isPlaying = false;
  this.compiledCode = null;
  this.lastCodeChangeTime = 0;
  this.lastCompilationTime = 0;
  this.compilationDelay = 1e3;
  this.sampleRate = 44100;
  this.bufferSize = 2048;
  this.t = 0;
}

AudioPen.prototype = {
  start: function (stream) {
    var self = this;

    this.audioContext = new AudioContext();
    this.analyserView = new AnalyserView("view1");

    window.editor.on("change", () => {
      self.lastCodeChangeTime = Date.now();
    });

    this.compileCode();

    this.streamNode = this.audioContext.createMediaStreamSource(stream);

    this.jsProcessor = this.audioContext.createScriptProcessor(
      this.bufferSize,
      1,
      1
    );
    this.jsProcessor.onaudioprocess = (audioProcessingEvent) => {
      self.executeCode(audioProcessingEvent);
    };

    analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3;

    this.jsProcessor.connect(analyser);

    analyser.connect(this.audioContext.destination);
    analyser.getByteFrequencyData(new Uint8Array(analyser.frequencyBinCount));

    this.analyser = analyser;

    this.analyserView.initByteBuffer();

    this.mainLoop();
  },

  compileCode: function () {
    var code = window.editor.getValue();
    var memberDefs = [];
    for (var i = 0; i < this.apiFunctionNames.length; ++i) {
      var fname = this.apiFunctionNames[i];
      memberDefs.push(
        fname + ":(typeof " + fname + "=='function'?" + fname + ":null)"
      );
    }
    var appendix = "\nreturn {" + memberDefs.join(",") + " };";
    code += appendix;
    this.lastCompilationTime = Date.now();
    var pack = null;
    try {
      pack = new Function(code)();
    } catch (ex) {
      console.log("Compilation failed: " + ex.message + "\n" + ex.stack);
      return false;
    }
    this.compiledCode = pack;
    return true;
  },

  executeCode: function (buffer) {
    if (buffer === null) return;
    buffer = this.compiledCode.process(buffer);
  },

  mainLoop: function () {
    var self = this;

    requestAnimationFrame(function () {
      self.mainLoop();
    });

    if (
      Date.now() - this.lastCodeChangeTime > this.compilationDelay &&
      this.lastCodeChangeTime > this.lastCompilationTime
    ) {
      this.compileCode();
    } else if (this.compiledCode.onGui) {
      this.compiledCode.onGui();
    }

    this.analyserView.doFrequencyAnalysis(this.analyser);
    //this.renderWave();
  },
};

window.audiopen = audiopen;
