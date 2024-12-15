import plugin from '../plugin.json';

const fs = acode.require("fs");
const fileList = acode.require("fileList");
const { editor } = editorManager;

class CssIntellisense {
 constructor() {
    this.cssClasses = new Set(); // Usar Set para evitar duplicatas
    this.idCss = new Set(); // Usar Set para evitar duplicatas
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
      const cssFiles = list.filter(item => item.name.toLowerCase().endsWith('.css')); // Ignorar maiúsculas/minúsculas

      if (!cssFiles.length) {
        console.warn("Nenhum arquivo CSS encontrado.");
        return;
      }

      // Limpar classes e IDs antes de reanalisar
      this.cssClasses.clear();
      this.idCss.clear();

      for (const cssFile of cssFiles) {
        const fileContent = await this.getFileContent(cssFile.url);

        // Evitar reanálise se o conteúdo não mudou
        if (this.fileCache.get(cssFile.url) === fileContent) {
          continue;
        }
        this.fileCache.set(cssFile.url, fileContent);

        // Extrair classes e IDs
        const classes = this.extractCssClasses(fileContent);
        const ids = this.extractCssIds(fileContent);

        classes.forEach(cls => this.cssClasses.add(cls));
        ids.forEach(id => this.idCss.add(id));
      }

      console.log('Classes CSS encontradas:', [...this.cssClasses]);
      console.log('IDs CSS encontrados:', [...this.idCss]);

    } catch (error) {
      console.error('Erro ao carregar arquivos CSS:', error);
    }
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
 
 
 // Extrair IDs CSS do conteúdo de um arquivo
 
extractCssIds(content) {
  const idRegex = /#([a-zA-Z0-9_-]+)\s*\{/g;
  const ids = new Set(); // Usar Set para evitar duplicatas diretamente
  let match;

  while ((match = idRegex.exec(content)) !== null) {
    ids.add(match[1]); // Adiciona somente o nome do ID
  }

  return ids;
}
 
 

 // Autocompletar com as classes CSS encontradas
 cssCompletions = {
  getCompletions(editor, session, pos, prefix, callback) {
   const classSuggestions = [...this.cssClasses].map(className => ({
    caption: className,
    value: className,
    score: 1000,
    meta: "class",
    icon: "ace_completion-icon ace_classe"
   }));  
   
   const idSuggestions = [...this.idCss].map(idCss => ({
    caption: idCss,
    value: idCss,
    score: 1000,
    meta: "Id",
    icon: "ace_completion-icon ace_classe"
   }));
   
  
   const suggestions = [
    ...classSuggestions, 
    ...idSuggestions];
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