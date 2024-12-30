const fs = require('fs');

// Load NFT data
const nftData = JSON.parse(fs.readFileSync('NFTRarities.json', 'utf8'));

// Object to store all unique traits and their values
const traitCategories = {};

// Analyze all NFTs
nftData.forEach(nft => {
    if (nft.meta && nft.meta.meta && nft.meta.meta.attributes) {
        nft.meta.meta.attributes.forEach(attr => {
            // Initialize category if it doesn't exist
            if (!traitCategories[attr.key]) {
                traitCategories[attr.key] = new Set();
            }
            // Add the value to the set of possible values
            traitCategories[attr.key].add(attr.value);
        });
    }
});

// Convert to a more readable format and sort
const sortedTraits = {};
Object.keys(traitCategories).sort().forEach(category => {
    sortedTraits[category] = Array.from(traitCategories[category]).sort();
});

// Create output string
let output = '# ASC NFT Trait Analysis\n\n';
for (const [category, values] of Object.entries(sortedTraits)) {
    output += `## ${category}\n`;
    output += `Total unique values: ${values.length}\n\n`;
    output += 'Values:\n';
    values.forEach(value => {
        output += `- ${value}\n`;
    });
    output += '\n';
}

// Write to file
fs.writeFileSync('trait_analysis.md', output);

// Console output
console.log('Trait Categories Found:');
Object.keys(sortedTraits).forEach(category => {
    console.log(`\n${category}:`);
    console.log(`- ${sortedTraits[category].length} unique values`);
}); 