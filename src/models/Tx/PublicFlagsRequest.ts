export default class PublicFlagsProps {
  publicStrategist: boolean;
  publicStewards: boolean;

  constructor(publicStrategist: boolean, publicStewards: boolean) {
    this.publicStrategist = publicStrategist;
    this.publicStewards = publicStewards;
  }

  getProps() {
    return [this.publicStrategist, this.publicStewards];
  }
}
