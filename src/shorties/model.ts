﻿export class Shortie {
  constructor(public slug: string, public url: string, public type: ShortieType = ShortieType.Unknown) { }
}

export enum ShortieType {
  Unknown,
  Generated,
  Manual
}