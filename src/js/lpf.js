export class LPF {
  constructor(z) {
    if (!z) this.z = 0.998;
    else this.z = z;
    this.out = 0;
  }
  run(n, x) {
    return x + (n - x) * this.z;
  }
}
