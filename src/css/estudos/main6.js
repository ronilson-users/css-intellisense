import plugin from '../plugin.json';

const fs = acode.require("fs");
const fileList = acode.require("fileList");
const { editor } = editorManager;

class CssIntellisense {
 constructor() {
  this.cssClasses = new Set(); // Usar Set para evitar duplicatas
  this.cssIds = new Set(); // Usar Set para evitar duplicatas
  this.fileCache = new Map(); // Usar Map para cache de arquivos
  this.init();
  this.cssCompletions.getCompletions = this.cssCompletions.getCompletions.bind(this);
 }

 // Inicializar o plugin
 async init() {
  editor.completers.unshift(this.cssCompletions);

  // Carrega e analisa arquivos CSS no projeto
  await this.loadCssFiles();

  // Otimizar eventos frequentes com debounce
  const debouncedLoadCssFiles = this.debounce(async () => {
   await this.loadCssFiles();
  }, 500);

  // Escuta o evento de troca de arquivo
  editorManager.on("switch-file", debouncedLoadCssFiles);

  // Escuta o evento de salvar arquivo
  editorManager.on("save", debouncedLoadCssFiles);
 }

 // Verificar se há arquivos CSS no projeto e extrair classes e IDs
 async loadCssFiles() {
  try {
   const list = await fileList();
   const cssFiles = list.filter(item => item.name.endsWith('.css'));

   if (!cssFiles.length) {
    throw new Error("Nenhum arquivo CSS encontrado.");
   }

   // Limpa as classes e IDs antes de reanalisar
   this.cssClasses.clear();
   this.cssIds.clear();

   for (const cssFile of cssFiles) {
    const fileContent = await this.getFileContent(cssFile.url);

    // Extrai classes e IDs
    const classes = this.extractCssClasses(fileContent);
    const ids = this.extractCssIds(fileContent);

    // Adiciona as classes e IDs extraídos
    classes.forEach(cls => this.cssClasses.add(cls));
    ids.forEach(id => this.cssIds.add(id));
   }

   // Fornece sugestões de classes e IDs
   this.provideSuggestions(this.cssClasses, this.cssIds);

  } catch (error) {
   console.error('Erro ao carregar arquivos CSS:', error);
  }
 }

 // Função para extrair classes CSS
 extractCssClasses(cssContent) {
  const classRegex = /\.([a-zA-Z0-9_-]+)(?=\s*\{)/g;
  const matches = cssContent.match(classRegex) || [];
  return matches.map(match => match.slice(1)); // Remove o ponto inicial
 }

 // Função para extrair IDs CSS
 extractCssIds(cssContent) {
  const idRegex = /#([a-zA-Z0-9_-]+)(?=\s*\{)/g;
  const matches = cssContent.match(idRegex) || [];
  return matches.map(match => match.slice(1)); // Remove o hash inicial
 }

 // Função para fornecer sugestões (implementar conforme necessário)
 provideSuggestions(classes, ids) {
  console.log('Classes CSS disponíveis para sugestões:', [...classes]);
  console.log('IDs CSS disponíveis para sugestões:', [...ids]);
 }

 // Obter o conteúdo de um arquivo no projeto
 async getFileContent(url) {
  return await fs(url).readFile('utf-8');
 }

 // Autocompletar com as classes CSS encontradas
 cssCompletions = {
  getCompletions(editor, session, pos, prefix, callback) {
   const classSuggestions = [...this.cssClasses].map(className => ({
    caption: className,
    value: className,
    score: 1000,
    meta: "class",
    icon: "ace_completion-icon ace_class"
   }));

   const idSuggestions = [...this.cssIds].map(id => ({
    caption: id,
    value: id,
    score: 1000,
    meta: "id",
    icon: "ace_completion-icon ace_class"
   }));

   const suggestions = [
    ...classSuggestions,
    ...idSuggestions
   ];

   callback(null, suggestions);
  }
 };

 // Debounce para evitar múltiplas chamadas consecutivas
 debounce(func, wait) {
  let timeout;
  return (...args) => {
   clearTimeout(timeout);
   timeout = setTimeout(() => func.apply(this, args), wait);
  };
 }

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