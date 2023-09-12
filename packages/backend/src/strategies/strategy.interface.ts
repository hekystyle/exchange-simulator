export interface IStrategy {
  readonly enabled: boolean;
  enable(): this;
  disable(): this;
}
