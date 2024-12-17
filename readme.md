# Intellisense for CSS Classes and IDs in HTML

![logo](https://i.ibb.co/xSmW5qv/logo-css-intellisense.png)

**Intellisense** is a plugin that provides autocomplete functionality for CSS classes and IDs in your code editor. It analyzes CSS and SCSS files in the project and offers autocomplete suggestions for classes and IDs when working with HTML files.

## Features

### 1. Autocomplete for Classes and IDs
- The plugin automatically captures classes and IDs defined in CSS and SCSS files within the project.
- Autocomplete suggestions are displayed when typing `class="` or `id="` in HTML files.

### 2. Support for CSS and SCSS Files
- Supports `.css` and `.scss` files.
- Recognizes nested classes in SCSS, expanding the autocomplete functionality.

---

## Examples

### Basic CSS Classes and IDs
Example of simple CSS classes and IDs for a button and a container:

```css
/* Basic CSS */
.button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

#main-title {
  font-size: 24px;
  color: #333;
}

/* Utility CSS */
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 16px; }

.text-center { text-align: center; }
.text-bold { font-weight: bold; }

/* Exemplo de classe aninhada no SCSS: */

.btn {
  &-primary {
    background-color: blue;
  }
}

```

### Contribuições
- Você pode solicitar novos recursos e contribuir para o desenvolvimento da extensão em [repository]("https://github.com/ronilson-users/css-intellisense.git") no GitHub . Procure um problema no qual você esteja interessado em trabalhar, comente sobre ele para me informar que você está trabalhando nele e envie sua solicitação de pull! :D

