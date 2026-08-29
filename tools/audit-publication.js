"use strict"

const childProcess = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")

const root = path.resolve(__dirname, "..")
const output = childProcess.execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: root,
    encoding: "utf8",
})
const files = output.split("\0").filter(Boolean).sort()
const forbiddenPaths = [
    /^\.playwright-mcp\//,
    /^data\/(?!\.htaccess$)/,
    /^training\/output\//,
    /^node_modules\//,
    /(^|\/)\.env(?:\.|$)/,
    /(^|\/)(?:ai-trainer-key\.sha256|ai-policy-promotion-key\.sha256|ai-contribution-secret|ai-learning-global\.json)$/,
    /(^|\/)(?:btdb-offline-menu|btdbjs-.*-production|v.*-(?:local|production)-.*)\.png$/,
    /\.(?:p12|pfx|jks|keystore|kdb|kdbx|der|gpg|pgp|age)$/i,
]
const credentialPatterns = [
    { name: "private key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
    { name: "GitHub token", regex: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
    { name: "AWS access key", regex: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
    { name: "credential URL", regex: /\b(?:https?|ftps?):\/\/[^\s/:@]+:[^\s/@]+@/i },
]
const findings = []
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".avif"])

function decodeUtf16BigEndian(contents) {
    const swapped = Buffer.allocUnsafe(contents.length - 2)
    for(let index = 2; index + 1 < contents.length; index += 2) {
        swapped[index - 2] = contents[index + 1]
        swapped[index - 1] = contents[index]
    }
    return swapped.toString("utf16le")
}

function decodeText(contents) {
    if(contents.length >= 2 && contents[0] == 0xff && contents[1] == 0xfe) return contents.subarray(2).toString("utf16le")
    if(contents.length >= 2 && contents[0] == 0xfe && contents[1] == 0xff) return decodeUtf16BigEndian(contents)
    if(!contents.includes(0)) return contents.toString("utf8")
    let evenNulls = 0
    let oddNulls = 0
    for(let index = 0; index < contents.length; index++) {
        if(contents[index] == 0) {
            if(index % 2) oddNulls++
            else evenNulls++
        }
    }
    const pairs = Math.max(1, Math.floor(contents.length / 2))
    if(oddNulls >= pairs / 4 && evenNulls <= pairs / 20) return contents.toString("utf16le")
    if(evenNulls >= pairs / 4 && oddNulls <= pairs / 20) {
        const padded = Buffer.concat([Buffer.from([0xfe, 0xff]), contents])
        return decodeUtf16BigEndian(padded)
    }
    return null
}

for(const relativePath of files) {
    const normalized = relativePath.replace(/\\/g, "/")
    if(forbiddenPaths.some(pattern => pattern.test(normalized))) {
        findings.push(`${normalized}: forbidden publication path`)
        continue
    }
    const absolutePath = path.join(root, relativePath)
    if(!fs.statSync(absolutePath).isFile()) continue
    const contents = fs.readFileSync(absolutePath)
    if(imageExtensions.has(path.extname(normalized).toLowerCase())) continue
    const text = decodeText(contents)
    if(text === null) {
        findings.push(`${normalized}: unexpected NUL-containing non-image file`)
        continue
    }
    for(const pattern of credentialPatterns) {
        if(pattern.regex.test(text)) findings.push(`${normalized}: possible ${pattern.name}`)
    }
}

if(findings.length) {
    console.error("Publication audit failed:")
    for(const finding of findings) console.error(`- ${finding}`)
    process.exitCode = 1
} else {
    console.log(`Publication audit passed for ${files.length} publishable files.`)
}
