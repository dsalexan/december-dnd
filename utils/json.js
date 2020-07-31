import fs from 'fs'
import jsonfile from 'jsonfile'

export function read(file) {
  return jsonfile.readFile(file)
}

export function readSync(file, coding = 'utf-8') {
  return JSON.parse(fs.readFileSync(file, coding))
}

export function write(obj, file) {
  return jsonfile.writeFile(file, obj)
}

export default {
  read,
  readSync,
  write
}
