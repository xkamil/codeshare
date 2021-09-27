const fs = require('fs');

const snippetsFile = __dirname +"/snippets.json";
const snippetsFileEncoding = 'utf-8';

let snippets = {};
let snippetsChanged = false;

function updateSnippet(snippetName, content) {
  snippets[snippetName] = {
    content,
    updatedAt: new Date()
  };
  snippetsChanged = true;
}

function getSnippet(snippetName) {
  return snippets[snippetName]
}

function getAllSnippets() {
  return snippets;
}

function loadSnippetsFromDisc() {
  try {
    const snippetsRaw= fs.readFileSync(snippetsFile, snippetsFileEncoding);
    snippets =  JSON.parse(snippetsRaw);
  } catch (e) {
    console.log(e.message);
  }

}

function saveSnippetsOnDisc() {
  if (snippetsChanged) {
    fs.writeFile(snippetsFile, JSON.stringify(snippets),  (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    snippetsChanged = false;
  }
}

module.exports = {
  getSnippet,
  getAllSnippets,
  updateSnippet,
  loadSnippetsFromDisc,
  saveSnippetsOnDisc
}