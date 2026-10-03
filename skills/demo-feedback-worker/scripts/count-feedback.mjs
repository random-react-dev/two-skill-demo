#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const categories = ['bug', 'feature-request', 'praise', 'other'];

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--percentages') {
      if (options.percentages) throw new Error('Duplicate option --percentages');
      options.percentages = true;
    } else if (arg === '--input' || arg === '--output') {
      const key = arg.slice(2);
      if (options[key] !== undefined) throw new Error(`Duplicate option ${arg}`);
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
      options[key] = args[++i];
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (!options.input || !options.output) throw new Error('Required options: --input <file> --output <directory>');
  const inputPath = resolve(options.input);
  const outputDir = resolve(options.output);
  if (inputPath === join(outputDir, 'counts.json') || inputPath === join(outputDir, 'report.md')) {
    throw new Error('Input must not be an output report path');
  }
  const raw = await readFile(inputPath);
  const records = JSON.parse(raw.toString('utf8'));
  if (!Array.isArray(records)) throw new Error('Input must be a JSON array');
  const seen = new Set();
  const counts = Object.fromEntries(categories.map(category => [category, 0]));
  for (const [index, record] of records.entries()) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error(`Record ${index + 1}: expected an object`);
    if (typeof record.id !== 'string' || !record.id.trim()) throw new Error(`Record ${index + 1}: id must be a nonempty string`);
    if (seen.has(record.id)) throw new Error(`Record ${index + 1}: duplicate id ${record.id}`);
    if (!categories.includes(record.category)) throw new Error(`Record ${index + 1}: unknown category ${record.category}`);
    if (typeof record.text !== 'string') throw new Error(`Record ${index + 1}: text must be a string`);
    seen.add(record.id);
    counts[record.category]++;
  }
  const result = {
    schemaVersion: 1,
    status: 'DONE',
    input: { path: inputPath, sha256: createHash('sha256').update(raw).digest('hex') },
    installedSkillPath: resolve(dirname(fileURLToPath(import.meta.url)), '..', 'SKILL.md'),
    total: records.length,
    counts,
  };
  if (options.percentages) {
    result.percentages = Object.fromEntries(categories.map(category => [category,
      records.length ? Math.round(counts[category] / records.length * 10000) / 100 : 0]));
  }
  const report = [
    '# Product feedback demo',
    '',
    `Total records: **${result.total}**`,
    '',
    options.percentages ? '| Category | Count | Percent |' : '| Category | Count |',
    options.percentages ? '| --- | ---: | ---: |' : '| --- | ---: |',
    ...categories.map(category => options.percentages
      ? `| ${category} | ${counts[category]} | ${result.percentages[category]}% |`
      : `| ${category} | ${counts[category]} |`),
    '',
    'Counts use supplied category labels; feedback prose is not classified.',
    '',
    `Input SHA-256: \`${result.input.sha256}\``,
    '',
  ].join('\n');
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'counts.json'), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(join(outputDir, 'report.md'), report);
  process.stdout.write(`${JSON.stringify({ status: 'DONE', total: result.total, counts,
    jsonPath: join(outputDir, 'counts.json'), reportPath: join(outputDir, 'report.md') })}\n`);
}

main().catch(error => {
  process.stderr.write(`FAILED: ${error.message}\n`);
  process.exitCode = 1;
});
