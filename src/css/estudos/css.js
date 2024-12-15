import plugin from '../plugin.json';

const fs = acode.require("fs");
const fileList = acode.require("fileList");
const { editor } = editorManager;

class CssIntellisense {
 constructor() {
  this.cssClasses = []; // Armazena as classes CSS encontradas

  this.init();
  this.cssCompletions.getCompletions = this.cssCompletions.getCompletions.bind(this);
 }

 // Inicializar o plugin
 async init() {
  editor.completers.unshift(this.cssCompletions);

  // Carrega e analisa arquivos CSS no projeto
  await this.loadCssFiles();

  // Escuta o evento de troca de arquivo
  editorManager.on("switch-file", async () => {
   await this.loadCssFiles(); // Reanalisar arquivos CSS ao trocar de arquivo
  });
 }

 // Verificar se há arquivos CSS no projeto e extrair classes
 async loadCssFiles() {
  try {
   const list = await fileList();
   const cssFiles = list.filter(item => item.name.endsWith('.css'));

   if (!cssFiles.length) {
    throw new Error("Nenhum arquivo CSS encontrado.");
   }

   this.cssClasses = []; // Limpa as classes CSS antes de reanalisar

   for (const cssFile of cssFiles) {
    const fileContent = await this.getFileContent(cssFile.url);
    const classes = this.extractCssClasses(fileContent);
    this.cssClasses.push(...classes);
   }

   console.log('Classes CSS encontradas:', this.cssClasses);

  } catch (error) {
   console.error('Erro ao carregar arquivos CSS:', error);
  }
 }

 // Obter o conteúdo de um arquivo no projeto
 async getFileContent(url) {
  return await fs(url).readFile('utf-8');
 }

 // Extrair classes CSS do conteúdo de um arquivo
 extractCssClasses(content) {
  const classRegex = /\.([a-zA-Z0-9_-]+)\s*\{/g;
  const classes = [];
  let match;

  while ((match = classRegex.exec(content)) !== null) {
   classes.push(match[1]);
  }

  return classes;
 }

 // Autocompletar com as classes CSS encontradas
 cssCompletions = {
  getCompletions(editor, session, pos, prefix, callback) {
   const suggestions = this.cssClasses.map(className => ({
    caption: className,
    value: className,
    score: 1000,
    meta: "class",
    icon: "ace_completion-icon ace_css"
   }));

   callback(null, suggestions);
  }
 };

 // Remover o plugin e autocompleter
 async destroy() {
  editor.completers = editor.completers.filter(completer => completer !== this.cssCompletions);
  console.log('Plugin CSS Intellisense destruído');
 }
}

// Inicializar o plugin
if (window.acode) {
 const acodePlugin = new CssIntellisense();

 acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
  if (!baseUrl.endsWith('/')) {
   baseUrl += '/';
  }
  acodePlugin.baseUrl = baseUrl;
 });

 acode.setPluginUnmount(plugin.id, () => {
  acodePlugin.destroy();
 });
}