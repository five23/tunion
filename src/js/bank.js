
  /**
   * savePatch
   *
   * @memberof Audiopen
   */
  savePatch() {
    const self = this;

    let patchName = document.getElementById('patch-name').value;

    if (!patchName) {
      patchName = `patch_${Date.now()}`;
    }

    this.patchBank.push({
      name: patchName,
      vco1: {
        gain: self.vco1.gain,
        x: self.vco1._x.value,
        y: self.vco1._y.value,
        mat: self.vco1mat.values,
      },
      vco2: {
        gain: self.vco2.gain,
        x: self.vco2._x.value,
        y: self.vco2._y.value,
        mat: self.vco2mat.values,
      },
      vco3: {
        gain: self.vco3.gain,
        x: self.vco3._x.value,
        y: self.vco3._y.value,
        mat: self.vco3mat.values,
      },
      vco4: {
        gain: self.vco4.gain,
        x: self.vco4._x.value,
        y: self.vco4._y.value,
        mat: self.vco4mat.values,
      },
      effects: {
        delay: {
          gain: self.d0gain.value,
          feedback: self.d0feedback.value,
          time: self.d0time.value,
        },
      },
      editor: self.aceEditor.getValue(0),
    });

    if (this.patch) {
      const patchString = JSON.stringify(this.patch);
      const patchBankString = JSON.stringify(this.patchBank);

      console.log('audiopen: Saving patch');
      window.localStorage.setItem('patch', patchString);
      window.localStorage.setItem('patchBank', patchBankString);
    }
  }

  /**
   * loadPatch
   *
   * @memberof Audiopen
   */
  loadPatch(name) {
    this.patchBank.forEach((patch) => {
      if (patch.name == name) {
        this.vco1.x = patch.vco1.x;
        this.vco1.y = patch.vco1.y;

        this.vco2.x = patch.vco2.x;
        this.vco2.y = patch.vco2.y;

        this.vco3.x = patch.vco3.x;
        this.vco3.y = patch.vco3.y;

        this.vco4.x = patch.vco4.x;
        this.vco4.y = patch.vco4.y;

        this.vco1mat.setAllSliders(patch.vco1.mat);
        this.vco2mat.setAllSliders(patch.vco2.mat);
        this.vco3mat.setAllSliders(patch.vco3.mat);
        this.vco4mat.setAllSliders(patch.vco4.mat);

        this.d0gain.value = patch.effects.delay.gain;
        this.d0feedback.value = patch.effects.delay.feedback;
        this.d0time.value = patch.effects.delay.time;

        this.aceEditor.setValue(patch.editor, -1);

        this.compileCode();
      }
    });
  }

  /**
   * initPatch
   *
   * @memberof Audiopen
   */
  initNewPatch() {
    return {
      name: 'Default Patch',
      vco1: {
        gain: this.vco1.gain,
        x: this.vco1._x.value,
        y: this.vco1._y.value,
        mat: this.vco1mat.values,
      },
      vco2: {
        gain: this.vco2.gain,
        x: this.vco2._x.value,
        y: this.vco2._y.value,
        mat: this.vco2mat.values,
      },
      vco3: {
        gain: this.vco3.gain,
        x: this.vco3._x.value,
        y: this.vco3._y.value,
        mat: this.vco3mat.values,
      },
      vco4: {
        gain: this.vco4.gain,
        x: this.vco4._x.value,
        y: this.vco4._y.value,
        mat: this.vco4mat.values,
      },
      effects: {
        delay: {
          gain: this.d0gain.value,
          feedback: this.d0feedback.value,
          time: this.d0time.value,
        },
      },
      editor: this.aceEditor.getValue(0),
    };
  }

  /**
   * initPatchBankButtons
   *
   * @param {*} self
   * @memberof Audiopen
   */
  initPatchBankButtons(self) {
    const savePatch = new NexusUI.TextButton('#save-patch', {
      text: '▼',
      size: [32, 32],
      state: false,
    });

    savePatch.on('click', () => {
      self.savePatch();
    });

    const loadPatch = new NexusUI.TextButton('#load-patch', {
      text: '▲',
      size: [32, 32],
      state: false,
    });

    loadPatch.on('click', () => {
      self.loadPatch(self.patchBankSelect.value);
    });
  }

  /**
   * initPatchBank
   *
   * @memberof Audiopen
   */
  initPatchBank() {
    this.patch = this.initNewPatch();

    const patchBank = JSON.parse(window.localStorage.getItem('patchBank'));

    if (patchBank) {
      this.patchBank = patchBank;

      const patchNames = patchBank.map(({ name }) => name);

      if (patchNames) {
        this.patchBankSelect = new window.NexusUI.Select('#select-patch', {
          size: [256, 28],
          options: patchNames,
        });
      }
    } else {
      this.patchBank = [this.patch];
    }
  }
