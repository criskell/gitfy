interface Message {
  headers: Map<string, string>;
  body: string;
}

export const serialize = (message: Message): string => {
  return Array.from(message.headers).map(([key, value]) => {
    const serializedValue = value.replaceAll("\n", "\n ");

    return `${key} ${serializedValue}`;
  }).join("\n") + "\n\n" + message.body;
};

export const deserialize = (serialized: string): Message => {
  const lines = serialized.split(/\n(?! )/);

  const message: Message = {
    headers: new Map(),
    body: "",
  };

  let currentLine;

  while ((currentLine = lines.shift()) !== "") {
    const spaceIndex = currentLine.indexOf(" ");
    const key = currentLine.slice(0, spaceIndex);
    const value = currentLine.slice(spaceIndex + 1).replaceAll("\n ", "\n");

    message.headers.set(key, value);
  }

  message.body = lines.join("\n");

  return message;
};