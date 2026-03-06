const fs = require('fs');
const path = require('path');

const backup = JSON.parse(fs.readFileSync(path.join(__dirname, 'backup', 'kindergartens.json'), 'utf8'));

// All entries with l-d in name
const ldEntries = backup.filter(k => /\bl-d\b/i.test(k.name));
console.log(`Total l-d entries in backup: ${ldEntries.length}`);

// Check which ones have city in parentheses (AI-generated duplicates)
const withParens = ldEntries.filter(k => /\(.*\)\s*$/.test(k.name));
console.log(`l-d with city in parens: ${withParens.length}`);
withParens.slice(0, 5).forEach(k => console.log(`  ${k.name} | ${k.city}`));

// l-d without parens
const noParens = ldEntries.filter(k => !/\(.*\)\s*$/.test(k.name));
console.log(`\nl-d without parens: ${noParens.length}`);

// Check which of these have Nr. numbering (AI)
const withNr = noParens.filter(k => /Nr\.\s*\d+/.test(k.name));
console.log(`l-d with Nr. numbering: ${withNr.length}`);

// Clean l-d entries (no parens, no Nr.)
const clean = noParens.filter(k => !/Nr\.\s*\d+/.test(k.name));
console.log(`\nClean l-d entries (no parens, no Nr.): ${clean.length}`);

// Check prefixes of clean entries
const prefixes = {};
clean.forEach(k => {
  const words = k.name.split(/\s+/);
  const prefix = words[0];
  prefixes[prefix] = (prefixes[prefix] || 0) + 1;
});
console.log('\nFirst word distribution:');
Object.entries(prefixes).sort((a, b) => b[1] - a[1]).forEach(([p, cnt]) => console.log(`  ${p}: ${cnt}`));

// Similarly check lopšelis-darželis entries
const lopselisEntries = backup.filter(k => /lopšelis/i.test(k.name) && !/\bl-d\b/i.test(k.name));
console.log(`\n\nTotal lopšelis (not l-d) entries: ${lopselisEntries.length}`);
const lopNoParens = lopselisEntries.filter(k => !/\(.*\)\s*$/.test(k.name));
const lopNoParensNoNr = lopNoParens.filter(k => !/Nr\.\s*\d+/.test(k.name));
console.log(`lopšelis without parens: ${lopNoParens.length}`);
console.log(`lopšelis without parens or Nr.: ${lopNoParensNoNr.length}`);

// Check prefixes
const lopPrefixes = {};
lopNoParensNoNr.forEach(k => {
  const words = k.name.split(/\s+/);
  const prefix = words[0];
  lopPrefixes[prefix] = (lopPrefixes[prefix] || 0) + 1;
});
console.log('\nlopšelis first word distribution:');
Object.entries(lopPrefixes).sort((a, b) => b[1] - a[1]).forEach(([p, cnt]) => console.log(`  ${p}: ${cnt}`));

// Show sample lopšelis entries that DON'T start with a city
const lopNonCity = lopNoParensNoNr.filter(k => {
  return k.name.startsWith('Lopšelis') || k.name.startsWith('Privatus');
});
console.log(`\nlopšelis starting with "Lopšelis" or "Privatus": ${lopNonCity.length}`);
lopNonCity.slice(0, 10).forEach(k => console.log(`  ${k.name} | ${k.city}`));

// lopšelis starting with city name
const lopWithCity = lopNoParensNoNr.filter(k => !k.name.startsWith('Lopšelis') && !k.name.startsWith('Privatus'));
console.log(`\nlopšelis starting with city name: ${lopWithCity.length}`);
lopWithCity.slice(0, 10).forEach(k => console.log(`  ${k.name} | ${k.city}`));
