export const getBaseApiUrl = (): URL => {
  const url = new URL(window.location.href);
  url.port = '3000';
  return url;
};
