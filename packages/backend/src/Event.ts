export abstract class Event<TSender> {
  constructor(public readonly sender: TSender) {}
}
