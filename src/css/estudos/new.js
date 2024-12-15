// main.js
import plugin from '../plugin.json';

const fs = acode.require("fs");
const fileList = acode.require("fileList");
const { editor } = editorManager;



class NpmIntellisense {
constructor() {
this.dependencies = [];

this.existingModules = [];
this.foundModules = [];
this.init();
this.checkForUpdates();
this.npmCompletions.getCompletions = this.npmCompletions.getCompletions.bind(this);
}

// Inicialização do plugin

async init() {
const { commands } = editorManager.editor;

// Comando para limpar cache
commands.addCommand({
name: 'reset-cache',
bindKey: { win: 'Ctrl-Shift-R', mac: 'Command-Shift-R' },
exec: () => {
console.log('Resetando cache...');
localStorage.removeItem('npmIntellisenseCache-dependencies');
localStorage.removeItem('npmIntellisenseCache-hash');
},
});

// Comando para limpar dados
commands.addCommand({
name: 'clear-data',
bindKey: { win: 'Ctrl-Shift-C', mac: 'Command-Shift-C' },
exec: () => {
console.log('Limpando dados...');
this.dependencies = [];

localStorage.removeItem('npmIntellisenseCache-dependencies');
localStorage.removeItem('npmIntellisenseCache-hash');
},
});


try {
// Encontrar o package.json
const packagePath = await this.getPackagePath();
console.log('Caminho do package.json:', packagePath);

// Carregar dependências
await this.loadDependencies();
console.log("loadDependencies");

// Analisar o arquivo atual
await this.analyzeCurrentFile();
console.log('analyzeCurrentFile');


// Configurar autocompletar
editor.completers.unshift(this.npmCompletions);

// Observar mudanças de arquivo
editorManager.on("switch-file", async () => {
await this.analyzeCurrentFile();

});
} catch (error) {
console.log('Erro ao inicializar NpmIntellisense', { error });
}
}
// Analisar o arquivo atual para encontrar imports e requires

// Obter o conteúdo do arquivo atual no editor
async analyzeCurrentFile() {
try {
const currentFileContent = await this.getCurrentFileContent();
const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
const requireRegex = /require\(['"](.*)['"]\)/g;

let match;
while ((match = importRegex.exec(currentFileContent)) !== null) {
this.existingModules.push(match[1]);
}

while ((match = requireRegex.exec(currentFileContent)) !== null) {
this.existingModules.push(match[1]);
}

this.existingModules = this.filterValidModules(this.existingModules);
console.log('Módulos encontrados:', this.existingModules);

} catch (error) {
console.error('Erro ao analisar arquivo atual:', error);
}
}

async getCurrentFileContent() {
const activeFile = editorManager.activeFile;
if (!activeFile.uri) return;

return await fs(activeFile.uri).readFile('utf-8');
}

filterValidModules(modules) {
const uniqueModules = Array.from(new Set(modules));
return uniqueModules.filter(module => (
!module.startsWith('./') && !module.startsWith('../') && !module.endsWith('.json')
));
}

// Obter o caminho do arquivo package.json
async getPackagePath() {
try {
const list = await fileList();
const packageFile = list.find((item) => item.name === "package.json");

if (!packageFile || !packageFile.url) {
throw new Error("Arquivo package.json não encontrado.");
}

return packageFile.url;
} catch (error) {
console.log('Erro ao obter caminho do package.json', { error });
throw error;
}
}

// Carregar dependências e armazená-las em cache
async loadDependencies() {
try {
const packagePath = await this.getPackagePath();
const packageJsonContent = await fs(packagePath).readFile('utf-8');
const currentHash = this.hash(packageJsonContent);

const cachedHash = localStorage.getItem('npmIntellisenseCache-hash');
if (currentHash !== cachedHash) {
const packageJson = JSON.parse(packageJsonContent);
this.dependencies = Object.keys(packageJson.dependencies || {}).concat(
Object.keys(packageJson.devDependencies || {})
);
localStorage.setItem('npmIntellisenseCache-dependencies', JSON.stringify(this.dependencies));
localStorage.setItem('npmIntellisenseCache-hash', currentHash);

console.log('Dependências carregadas e armazenadas em cache:', this.dependencies);
} else {
this.dependencies = JSON.parse(localStorage.getItem('npmIntellisenseCache-dependencies')) || [];
console.log('Usando dependências em cache');
}
} catch (error) {
console.error('Erro ao carregar dependências:', error);
}
}

// Verificar atualizações no package.json
async checkForUpdates() {
const interval = 60000; // Verifica a cada 60 segundos
setInterval(async () => {
try {
await this.loadDependencies();
} catch (error) {
console.error('Erro ao verificar atualizações:', error);
}
}, interval);
}

// Gerar hash para o conteúdo do package.json
hash(content) {
return content.split('').reduce((a, b) => {
a = ((a << 5) - a) + b.charCodeAt(0);
return a & a;
}, 0);
}
// Extrair o input atual da linha do editor
getCurrentInput(line, column) {
let input = "";
let i = column - 1;
while (i >= 0 && /[a-zA-Z0-9/.+_-\s$@:]/.test(line[i])) {
input = line[i] + input;
i--;
}
return input;
}

npmCompletions = {
getCompletions(editor, session, pos, prefix, callback) {
try {
const currentLine = session.getLine(pos.row);
const input = this.getCurrentInput(currentLine, pos.column);
let suggestions = [];

// Sugestões para dependências
if (input) {
const dependencySuggestions = this.dependencies
.filter((dep) => dep.startsWith(input))
.map((dep) => ({
caption: dep,
value: dep,
score: 1000,
meta: "Module",
icon: "ace_completion-icon ace_module"
}));
suggestions = suggestions.concat(dependencySuggestions);
}



callback(null, suggestions);
} catch (err) {
callback(null, []);
window.toast("NpmIntellisense Error: " + err.message, 3000);
console.error(err.message);
}
}
};

// Remover o plugin e autocompleter
async destroy() {
editorManager.editor.commands.removeCommand("NpmIntellisense");
editor.completers = editor.completers.filter((completer) => completer !== this.npmCompletions);
console.log('Plugin destruído');
}

}

// Plugin initialization
if (window.acode) {
const acodePlugin = new NpmIntellisense();

acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
if (!baseUrl.endsWith('/')) {
baseUrl += '/';
}
acodePlugin.baseUrl = baseUrl;
await acodePlugin.init($page, cacheFile, cacheFileUrl);
});

acode.setPluginUnmount(plugin.id, () => {
acodePlugin.destroy();
});
}