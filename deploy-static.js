import { build } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Create dist directory if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Build the frontend
console.log('Building frontend...');
await build({
  configFile: 'vite.config.ts',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});

// Copy the dictionary data for static serving
console.log('Copying dictionary data...');
const dictionaryData = readFileSync('attached_assets/dictionaryelif_1750946133727.json', 'utf8');
writeFileSync('dist/dictionary.json', dictionaryData);

// Create a simple API mock for static hosting
const apiMock = `
// Static data for GitHub Pages deployment
window.DICTIONARY_DATA = ${dictionaryData};

// Mock API responses for static hosting
window.mockApiResponse = function(endpoint) {
  const data = window.DICTIONARY_DATA;
  
  switch(endpoint) {
    case '/api/words':
      return Promise.resolve(data.map((item, index) => ({
        id: index + 1,
        ottoman: item.word || item.ottoman || '',
        pronunciation: item.transliteration || item.pronunciation || '',
        turkish: item.meaning || item.turkish || '',
        additionalMeanings: item.meanings || []
      })));
    case '/api/dashboard/stats':
      return Promise.resolve({
        learnedWords: 0,
        todayStudyTime: 0,
        accuracy: 0,
        streak: 0,
        pendingFlashcards: data.length,
        pendingReviews: 0,
        totalWords: data.length
      });
    default:
      return Promise.resolve([]);
  }
};
`;

writeFileSync('dist/api-mock.js', apiMock);

console.log('Static build completed! Ready for GitHub Pages deployment.');