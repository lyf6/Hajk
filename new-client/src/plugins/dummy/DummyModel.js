class DummyModel {
  constructor(settings) {
    this.map = settings.map;
    this.app = settings.app;
    this.localObserver = settings.localObserver;
  }

  getMap() {
    return this.map;
  }
}

export default DummyModel;