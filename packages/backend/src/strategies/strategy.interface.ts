export interface Strategy {
  readonly enabled: boolean;
  enable(): this;
  disable(): this;
}
