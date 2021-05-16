export default (path: string[], message: string, type: string) => {
  throw {
    details: [
      {path, message, type}
    ]
  };
};
