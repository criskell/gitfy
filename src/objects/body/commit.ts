import { ObjectType } from '..';
import { Message } from './message';

export class Commit {
  public readonly type = ObjectType.COMMIT;

  public static from(rawMessage: Buffer): Commit | null {
    const { headers, body } = Message.from(rawMessage.toString());

    if (
      !(
        headers.has('tree') &&
        headers.has('author') &&
        headers.has('committer')
      )
    )
      return null;

    return new Commit(
      body,
      headers.get('tree'),
      headers.get('author'),
      headers.has('parent') ? headers.get('parent').split(' ') : [],
      headers.get('committer'),
      headers.get('gpgsig')
    );
  }

  public constructor(
    public message: string,
    public treeId: string,
    public author: string,
    public parentIds: string[] = [],
    public committer: string = author,
    public gpgSignature?: string
  ) {
    //
  }

  public serialize() {
    const headers = new Map();

    headers.set('tree', this.treeId);
    headers.set('author', this.author);
    headers.set('committer', this.committer);

    if (this.parentIds.length) {
      headers.set('parent', this.parentIds.join(' '));
    }

    if (this.gpgSignature) {
      headers.set('gpgsig', this.gpgSignature);
    }

    const message = new Message();

    message.headers = headers;
    message.body = this.message;

    return Buffer.from(message.serialize());
  }
}
