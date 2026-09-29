import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = path.resolve('src')
const source = fs.readFileSync(path.join(root, 'lib/i18n.ts'), 'utf8')
const i18nFile = ts.createSourceFile('i18n.ts', source, ts.ScriptTarget.Latest, true)
const known = new Set()
const unchanged = new Set(['AaharaConnect', 'Anjali Mehta', 'English', 'ಕನ್ನಡ', 'Bengaluru'])
function readDictionary(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(i18nFile) === 'kannada' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
    for (const property of node.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.name)) known.add(property.name.text)
  }
  ts.forEachChild(node, readDictionary)
}
readDictionary(i18nFile)

const ignored = /^(\+?\d|[A-Z]{2,}\d|[\d .:·→/-]+$|—$)/
const visibleAttributes = new Set(['title', 'subtitle', 'placeholder', 'aria-label', 'description'])
const missing = new Set()
function inspect(file) {
  const content = fs.readFileSync(file, 'utf8')
  const ast = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  function visit(node) {
    let value
    if (ts.isJsxText(node)) value = node.text.trim().replace(/\s+/g, ' ')
    if (ts.isJsxAttribute(node) && visibleAttributes.has(node.name.text) && node.initializer && ts.isStringLiteral(node.initializer)) value = node.initializer.text.trim()
    if (value && value.length > 2 && !ignored.test(value) && !known.has(value) && !unchanged.has(value) && !/^STEP \d+ \/ \d+$/.test(value)) missing.add(`${path.relative(root, file)}: ${value}`)
    ts.forEachChild(node, visit)
  }
  visit(ast)
}
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes:true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (file.endsWith('.tsx')) inspect(file)
  }
}
walk(root)
if (missing.size) {
  for (const line of [...missing].sort()) console.error(line)
  process.exitCode = 1
} else console.log('Translation audit passed: visible static copy is covered.')
