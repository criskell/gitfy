export interface Message {
  headers: Map<string, string>;
  body: string;
}

export const parseMessage = (raw: string): Message => {
  const lines = raw.split(/\n(?! )/);

  const headers = new Map<string, string>();

  let currentLine;

  while ((currentLine = lines.shift()) !== "") {
    const spaceIndex = currentLine.indexOf(" ");
    const key = currentLine.slice(0, spaceIndex);
    const value = currentLine.slice(spaceIndex + 1).replaceAll("\n ", "\n");

    headers.set(key, value);
  }

  const body = lines.join("\n");

  return {
    headers,
    body,
  };
};

export const serializeMessage = (message: Message) => {
  return (
    Array.from(message.headers)
      .map(([key, value]) => {
        const serializedValue = value.replaceAll("\n", "\n ");

        return `${key} ${serializedValue}`;
      })
      .join("\n") +
    "\n\n" +
    message.body
  );
};
