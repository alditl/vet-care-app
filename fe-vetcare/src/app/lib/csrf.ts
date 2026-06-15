export function getCsrfToken(): string {
  const name = "csrftoken";
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=", 2);
    if (key === name) return decodeURIComponent(value);
  }
  return "";
}
