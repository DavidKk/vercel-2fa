export function guid() {
  return (Math.floor(Math.random() * 10e12) + Date.now()).toString(36)
}
