# CSS Intellisense Plugin

O **CSS Intellisense Plugin** é um plugin que oferece funcionalidades de autocompletar para classes e IDs CSS no editor de código. Ele analisa arquivos CSS e SCSS no projeto e fornece sugestões de autocompletar para classes e IDs ao trabalhar com arquivos HTML.

## Funcionalidades

### 1. Autocompletar de Classes e IDs
- O plugin captura automaticamente classes e IDs definidos em arquivos CSS e SCSS do projeto.
- Sugestões de autocompletar são exibidas ao digitar `class="` ou `id="` em arquivos HTML.

### 2. Suporte a Arquivos CSS e SCSS
- Suporte a arquivos `.css` e `.scss`.
- Reconhece classes aninhadas no SCSS, expandindo a funcionalidade de autocompletar.

#### Exemplo de classe aninhada no SCSS:
```scss
.btn {
  &-primary {
    background-color: blue;
  }
}