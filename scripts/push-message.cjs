#!/usr/bin/env node
/**
 * Push a message to the dashboard notification feed.
 *
 * Usage:
 *   node scripts/push-message.js --content "arXiv 抓取完成，新增 12 篇论文" --source awesome-vla-papers --type success
 *
 * Options:
 *   --content  (required) Message text
 *   --source   (optional) Source identifier, default "script"
 *   --type     (optional) info | success | warning | error, default "info"
 */

const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '..', 'data', 'messages.json')

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--') && i + 1 < argv.length) {
      args[argv[i].slice(2)] = argv[++i]
    }
  }
  return args
}

const args = parseArgs(process.argv)

if (!args.content) {
  console.error('Error: --content is required')
  console.error('Usage: node push-message.js --content "msg" [--source name] [--type info|success|warning|error]')
  process.exit(1)
}

const message = {
  id: generateId(),
  content: args.content,
  source: args.source || 'script',
  type: args.type || 'info',
  read: false,
  createdAt: new Date().toISOString(),
}

let messages = []
try {
  messages = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
} catch {
  // file doesn't exist or invalid, start fresh
}

messages.unshift(message)
fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2), 'utf-8')

console.log(`Message pushed: [${message.type}] ${message.content} (from ${message.source})`)
