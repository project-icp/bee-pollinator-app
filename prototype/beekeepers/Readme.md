# Facade

A web prototype framework for Azavea projects.

---

## Installation and Use
`yarn install` to install required packages.

`yarn start` to watch for file changes and automatically open browser to
`localhost:8080`. (NOTE: HMR works for edits of existing files, but you must
restart the dev server when adding new file.)

`yarn build` to build, without dev server.

---

## Things to note

### SASS importing

Thanks to glob importing, you do not need to manually add each individual `.scss`
file to `main.scss`. You only need to edit `main.scss` if adding a new subfolder
to the `sass` directory, or editing the name of an existing subfolder.

### BEM
Please adhere to the [BEM methodology](http://getbem.com/introduction/) for authoring SCSS.


### Responsive

[include-media](http://include-media.com/) is used for handling breakpoints and
related media queries (eg, retina).

Some examples:

```css
@include media('>phone') { }
@include media('>phone', '<=tablet') { }
@include media('>=358px', '<850px') { }
@include media('>desktop', '<=1350px') { }
@include media('retina2x') { }
@include media('>=350px', '<tablet', 'retina3x') { }
```
