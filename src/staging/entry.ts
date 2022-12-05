export class IndexEntry {
  public objectId: string;

  public file: {
    mode: number,
    path: string,
    size: number,
    inodeNumber: number,
    device: number,
  };

  public timestamps: {
    metadataChanged: [seconds: number, nanoseconds: number],
    dataChanged: [seconds: number, nanoseconds: number],
  };

  public flags: {
    assumeValid: boolean,
    extendedFlag: boolean
  };

  public stage: number;

  public userId: number;
  public groupId: number;

  constructor({ file, timestamps, userId, groupId, stage, flags }: { [prop in keyof IndexEntry]: IndexEntry[prop] }) {
    this.objectId = objectId;
    this.file = file;
    this.timestamps = timestamps;
    this.userId = userId;
    this.groupId = groupId;
    this.stage = stage;
    this.flags = flags;
  }
}