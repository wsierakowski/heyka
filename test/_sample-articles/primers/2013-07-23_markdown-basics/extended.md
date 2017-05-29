### 1. Headings

There are two different ways of creating headings, with # symbol where number of instances corresponds to <h> type (1-6) or with underlines:

# H1
```
# H1
<h1 id="h1">H1</h1>
```

## H2
```
## H2
<h2 id="h2">H2</h2>
```

###### H6
```
###### H6
<h6 id="h6">H6</h6>
```

H1
======
```
H1
======
<h1 id="h1">H1</h1>
```

H2
------
```
H2
------
<h2 id="h2">H2</h2>
```

---
### 2. Text Attributes

Paragraphs are just lines.
```
Paragraphs are just lines.
<p>Paragraphs are just lines.</p>
```

Emphasis, aka italics, with *asterisks* or _underscores_.
```
Emphasis, aka italics, with *asterisks* or _underscores_.
<p>Emphasis, aka italics, with <em>asterisks</em> or <em>underscores</em>.
```

Strong emphasis, aka bold, with **asterisks** or __underscores__.
```
Strong emphasis, aka bold, with **asterisks** or __underscores__.
Strong emphasis, aka bold, with <strong>asterisks</strong> or <strong>underscores</strong>.
```

Combined emphasis with **asterisks and _underscores_**.
```
Combined emphasis with **asterisks and _underscores_**.
Combined emphasis with <strong>asterisks and <em>underscores</em></strong>.
```

Italics mixed with underscore one_two_three_four vs one_two*three*four.
```
Italics mixed with underscore one_two_three_four vs one_two*three*four.
Italics mixed with underscore one_two_three_four vs one_two<em>three</em>four.
```

Strikethrough uses two tildes. ~~Mistaken text.~~
```
Strikethrough uses two tildes. ~~Mistaken text.~~
Strikethrough uses two tildes. <del>Mistaken text.</del>
```

Monospace uses backticks. `monospace` example.
```
Monospace uses backticks. `monospace` example.
Monospace uses backticks. <code>monospace</code> example.
```

---
### 3. Quotes

> Always remember that you are absolutely unique. Just like everyone else.

```
> Always remember that you are absolutely unique. Just like everyone else.

<blockquote>
   <p>Always remember that you are absolutely unique. Just like everyone else.</p>
</blockquote>
```

---
### 4. Horizontal lines

Three or more hyphens, asterisks or underscores

---

```
---
***
___
<hr>
```

---
### 5. Links

This is a link example inside of a paragraph [Visit sigman.pl now!](https://sigman.pl).
```
This is a link example inside of a paragraph [Visit sigman.pl now!](https://sigman.pl).
This is a link example inside of a paragraph <a href="https://sigman.pl">Visit sigman.pl now!</a>.
```

or just in the text like that <http://sigman.pl>.
```
or just in the text like that <http://sigman.pl>.
or just in the text like that <a href="http://sigman.pl">http://sigman.pl</a>.
```

To create anchor links place an anchor `<a name="lesson1"></a>` where you want to link to and refer to it on the same page by `[lesson one](#lesson1)`. Markdown headers are also anchors: `## lesson1`


---
### 6. Images

![sigman logo alt](http://blog.sigman.pl/images/sigman.pl.png "Sigman Logo Title")
```
![sigman logo alt](http://blog.sigman.pl/images/sigman.pl.png "Sigman Logo Title")
<img src="http://blog.sigman.pl/images/sigman.pl.png" alt="sigman logo alt" title="Sigman Logo Title">
```

---
### 7. Lists

Unordered list:
* one
* two
* three

```
* one
* two
* three

<ul>
<li>one</li>
<li>two</li>
<li>three</li>
</ul>
```

Ordered list:
1. one
2. two
3. three

```
1. one
2. two
3. three

<ol>
<li>one</li>
<li>two</li>
<li>three</li>
</ol>
```


Mixed:
1. one
2. two
  * item1
  * item2
3. three

```
1. one
2. two
  * item1
  * item2
3. three

<ol>
  <li>one</li>
  <li>two
    <ul>
      <li>item1</li>
      <li>item2</li>
   </ul>
  </li>
  <li>three</li>
</ol>
```

---
### 8. Tables

Colons under the head row can be used to text-align columns.

| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

```
| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

<table>
  <thead>
    <tr>
      <th style="text-align:left">Left-Aligned</th>
      <th style="text-align:center">Center Aligned</th>
      <th style="text-align:right">Right Aligned</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">col 3 is</td>
      <td style="text-align:center">some wordy text</td>
      <td style="text-align:right">$1600</td>
    </tr>
    <tr>
      <td style="text-align:left">col 2 is</td>
      <td style="text-align:center">centered</td>
      <td style="text-align:right">$12</td>
    </tr>
    <tr>
      <td style="text-align:left">zebra stripes</td>
      <td style="text-align:center">are neat</td>
      <td style="text-align:right">$1</td>
    </tr>
  </tbody>
</table>
```

---
### 9. Code syntax
Use single backticks for inline code (previous monospace example) or three backticks as the first and last line around the code. Optionally specify the language name.

```javascript
alert('hello world');
```

```
`` `javascript
alert('hello world');
`` `


<pre>alert('hello world');</pre>
```

---
### 10. Escaping

To escape special character, like in example if you want to have a list with a dash as a first character:
`* - (dash): regular file`
You would get an unexpected result:
* - (dash): regular file

By escaping with backslash:
`* \- (dash): regular file`
We can avoid this:
* \- (dash): regular file

### Read more:

* Markdown cheatsheet: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet
* Github Markdown: https://guides.github.com/features/mastering-markdown/
