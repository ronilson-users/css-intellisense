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
  editorManager.on("save-file", debouncedLoadCssFiles);



  editorManager.on("save-file", file => this.loadCssFiles(file)

  );


  editorManager.on("remove-file", file => {
   if (this.fileCache.has(file.url)) {
    this.fileCache.delete(file.url);
    console.log(`Cache removido para o arquivo: ${file.url}`);
   }
  });


  editorManager.on("save-file", this.debounce(async file => {
   // Remove do cache
   if (this.fileCache.has(file.url)) {
    this.fileCache.delete(file.url);
   }

   // Recarrega o conteúdo
   await this.loadCssFiles(file);
  }, 500));

 }

 // Verificar se há arquivos CSS no projeto e extrair classes e IDs
 async loadCssFiles(updatedFile = null) {
  try {
   if (updatedFile) {
    // Atualiza somente o arquivo específico
    const fileContent = await this.getFileContent(updatedFile.url);
    const classes = this.extractCssClasses(fileContent);

   
    const ids = this.extractCssIds(fileContent);

    classes.forEach(cls => this.cssClasses.add(cls));
    ids.forEach(id => this.cssIds.add(id));
    return;
   }

   // Carrega todos os arquivos na inicialização
   const list = await fileList();
   const cssFiles = list.filter(item => item.name.endsWith('.css') || item.name.endsWith('.scss'));

  

   this.cssClasses.clear();
   this.cssIds.clear();

   await Promise.all(cssFiles.map(async cssFile => {
    const fileContent = await this.getFileContent(cssFile.url);
    if (!fileContent.trim()) return;

    const classes = this.extractCssClasses(fileContent);
    const ids = this.extractCssIds(fileContent);

    classes.forEach(cls => this.cssClasses.add(cls));
    ids.forEach(id => this.cssIds.add(id));
   }));

  } catch (error) {
   console.error('Erro ao carregar arquivos CSS:', error);
  }
 }


 // Função para extrair classes CSS
 extractCssClasses(cssContent) {
  const classRegex = /(?:^|\s)\.([a-zA-Z0-9_-]+)|&\.([a-zA-Z0-9_-]+)/gm;
  const classes = [];

  for (const match of cssContent.matchAll(classRegex)) {
   if (match[1]) classes.push(match[1]); // Classes normais
   if (match[2]) classes.push(match[2]); // Classes nested
  }

  return [...new Set(classes)]; // Remove duplicatas
 }

 // Função para extrair IDs CSS
 extractCssIds(cssContent) {
  const idRegex = /#([a-zA-Z0-9_-]+)(?=\s*\{|\s)/gm;

  

  return [...cssContent.matchAll(idRegex)].map(match => match[1]);
 }

 
 // Obter o conteúdo de um arquivo no projeto
 async getFileContent(url) {
  if (!url) {
   
  
   console.error("Erro: URL do arquivo não foi fornecida.");
   return '';
  }

  try {
   const content = await fs(url).readFile('utf-8');
   this.fileCache.set(url, content); // Atualiza o cache
   return content;
  } catch (error) {
 
   return ''; // Retorna uma string vazia em caso de falha
  }
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