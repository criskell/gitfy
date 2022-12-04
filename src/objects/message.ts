export class Message {
  public headers: Map<string, string> = new Map();
  public body: string = "";

  public static from(raw: string): Message {
    const lines = raw.split(/\n(?! )/);

    const message = new Message;

    let currentLine;

    while ((currentLine = lines.shift()) !== "") {
      const spaceIndex = currentLine.indexOf(" ");
      const key = currentLine.slice(0, spaceIndex);
      const value = currentLine.slice(spaceIndex + 1).replaceAll("\n ", "\n");

      message.headers.set(key, value);
    }

    message.body = lines.join("\n");

    return message;
  }

  public serialize(): string {
    return Array.from(this.headers).map(([key, value]) => {
      const serializedValue = value.replaceAll("\n", "\n ");

      return `${key} ${serializedValue}`;
    }).join("\n") + "\n\n" + this.body;
  }
}