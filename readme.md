# Acode Intellisense for CSS Classes and IDs in HTML

![logo](https://i.ibb.co/xSmW5qv/logo-css-intellisense.png)

**Intellisense** is a plugin that provides autocomplete functionality for CSS classes and IDs in your code editor. It analyzes CSS and SCSS files in your project and offers autocomplete suggestions for classes and IDs when editing HTML files.

---

## Features

### 1. Autocomplete for Classes and IDs
- The plugin automatically detects classes and IDs defined in CSS and SCSS files within your project.
- Autocomplete suggestions appear as you type `class="` or `id="` in HTML files.

### 2. Support for CSS and SCSS Files
- Compatible with `.css` and `.scss` files.
- Recognizes nested SCSS classes, ensuring accurate and expanded suggestions.

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

/* Example of nested SCSS classes: */

.btn {
&-primary {
background-color: blue;
}
}

```

--

## Contributions

You can request new features or contribute to the extension's development on the GitHub [repository]("https://github.com/ronilson-users/css-intellisense.git")
Find an issue you’d like to work on, comment to let me know you're taking it, and submit your pull request! :smile:

--


## Updates

<details>
 <summary>
  <strong>v1.0.1</strong>
 </summary>
 
- Initial release with support for CSS and SCSS files.  
- Autocomplete for classes and IDs in HTML.

</details>

<details>
 <summary>
  <strong>v1.0.2</strong>
 </summary>
 
- Fixed an issue where newly added CSS classes were not being updated in the suggestions.  
- Improved overall performance and accuracy of the autocomplete suggestions.

</details>

<details>
 <summary>
  <strong>v1.0.3</strong>
 </summary>
 
- Fixed minor bugs.  
- Removed unnecessary logs for a cleaner output.

</details>