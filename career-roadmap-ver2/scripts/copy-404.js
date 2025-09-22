import fs from 'fs'
import path from 'path'
const dist = path.resolve('dist')
const index = path.join(dist, 'index.html')
const four = path.join(dist, '404.html')
if (fs.existsSync(index)) fs.copyFileSync(index, four)
