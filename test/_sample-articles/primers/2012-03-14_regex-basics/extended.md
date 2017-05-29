---
_Update 20160311: This article originally had been written for ActionScript and in this update all examples have been updated to use JavaScript code. In addition RegexTester app has been included to better visualise the examples._

---

There are two aspects to learn in order to effectively use regular expressions. We need to understand the basics of regular expressions themselves and we need to understand how to use them in code.

### 1. Creating regular expression

In order to create a regular expression we need to provide the pattern and set of flags. The pattern usually consists of characters (interpreted literally), metacharacters (like any character) and metasequences (special commands like \b matching word boundary). Flags define how regular expression engine should execute the pattern.

Regex can be created with the RegExp class constructor:

```js
// RegExp(pattern, flags)
var findHellos = new RegExp("hello", "gim");
```

or as the regular expression literal by wrapping the pattern between two forward slashes and providing flags right after the ending slash:

```js
// /pattern/flags
var findHellos = /hello/gim;
``` 

The regex constructor is compiled on runtime and it makes most sense to use it when the regex pattern is dynamic, for example when it depends on the user input or is loaded from an external source.

The regex literal is compiled when the script is loaded, therefore it has better performance. This form should be used when the regex isn't changing and is constant.

The following flags can be provided:

---

| Flag |  Name  | Meaning | Example |
|:-----|:-------|:--------|:--------|
| g  |  global  | Global search - matches more than one match |/hello/g matches all g's in the string, not only the first one. Regex must be run in the loop in order to get all matches. |
| i | ignore case | Case insensitive match | /helloHELLO/gi marks both |
| m | multiline | The start (^) and end ($) of string will match start and end of line. | /^hello/gm will match hello and \nhello (hello on the second line) |
---

There are more flags then this, for example x (extended) to allow spaces for better readiness or s (dot all) to allow the any character (.) match new lines as well.

### 2. Methods using regular expressions

Regular expressions can be used with methods available on the regex object by applying string or on the string object by applying regex.

**RegExp.test** Tests for a match in a string. Returns Boolean.

```js
var re = /bam/gi;
var tx = 'bimbambombimbambom';
re.test(tx);
// true
```

**String.search** Tests for a match in a string. Returns index of a match. Finds only the first match.

```js
var re = /bam/gi;
var tx = 'bimbambombimbambom';
tx.search(re);
// 3
tx.search(re);
// 3
```

**String.replace** Searches matches in a string and replaces them with a replacement string provided. The replacement string also can take special replacement codes that can make use of extracted pieces. Returns modifies string.

```js
var re = /bam/gi;
var tx = 'bimbambombimbambom';
tx.replace(re, '___');
// "bim___bombim___bom"
```

**String.split** Searches matches in a string and use them to split it into array of substrings. Returns an array of substrings.

```js
var re = /bam/gi;
var tx = 'bimbambombimbambom';
tx.split(re);
// ["bim", "bombim", "bom"]
```


**RegExp.exec / String.match** Searches matches in a string. Returns an array with results including index information and captured extractions or null when there is no match.

```js
var re = /bam/gi;
var tx = 'bimbambombimbambom';

re.exec(tx);
// ["bam"]
re.exec(tx);
// ["bam"]
re.exec(tx);
// null
```

```js
var re = /bam/gi;
var tx = 'bimbambombimbambom';

tx.match(re)
["bam", "bam"]

console.log(tx.match(re))
console.log(re.lastIndex);
// ["bam", "bam"]
// 0
```

If we inspect the objects return we will find it has properties as well:
```js
var re = /bam/gi;
var tx = 'bimbambombimbambom';

console.log(re.exec(tx));
// ["bam", index: 3, input: "bimbambombimbambom"]
console.log(re.lastIndex);
// 6
console.log(re.exec(tx));
// ["bam", index: 12, input: "bimbambombimbambom"]
console.log(re.lastIndex);
// [15
console.log(re.exec(tx));
// null
console.log(re.lastIndex);
// 0
```

For the example below:
```js
var tx = "his name is John and last name is Smith";
var re = /([A-Z]\w+)(.*)([A-Z]\w+)/g;
console.log(re.exec(tx));

// ["John and last name is Smith", "John", "Smith", index: 12, input: "his name is John and last name is Smith"]

console.log(re.lastIndex)
// 0

console.log(re.source)
// ([A-Z]\w+).*([A-Z]\w+)
```

The object returned by the exec method has the following properties:

---

| Property | Description | Example |
|:---------|:------------|:--------|
| [0] | The matched characters | "John and last name is Smith" |
| [n] | Any remembered characters using parantheses | "John", "Smith" |
| index | index of the match | 12  |
| input | The original string | "his name is John and last name is Smith" |

---
Both methods are returning list of all results, but the main difference between them is that **String's match** returns all results without information of their position, whereas **RegExp' exec** requires iteration and returns the index information as well. Because the exec iterates, the regex object itself can be examined to see what is the next index from which the engine will restart search.


### 3. Testing regular expression patterns
The best way to learn is to get hands dirty. As usually, the first steps are most difficult and it isn't always convenient to test things from command line or web console.
I created a simple regex tester that takes the input string, the regex pattern and flags and runs the RegExp's exec method to list all the indexes and captured extractions and also String replace to replace the found matches with them wrapped into span tags in order to visually highlight them. This is a very effective way to expand regex knowledge by practicing with a tool that visually presents results of matching process.

You can check out the source code on github:
[http://github.com/wsierakowski/regextester](http://github.com/wsierakowski/regextester)

![RegEx Tester screenshot](/apps/regextester/regextester.png "RegEx Tester screenshot")

RegEx Tester takes optionally two query string parameters as input allowing launching it from this article with input string (intxt) and regex input (inrgx) text boxes populated:
[http://blog.sigman.pl/apps/regextester/?intxt=hello&inrgx=hello](http://blog.sigman.pl/apps/regextester/?intxt=hello&inrgx=hello)

---

### 4. Regular Expression patters

---

#### 4.1 List of most common **metacharacters**:

---  

| Exp | Meaning | Example | Test |
|:----|:--------|:--------|:-----|
| ? | 1. Matches the preceding character 0 or 1 time. Same as {0,1}.| 1. hell?o matches helo and hello | [try](/apps/regextester/?intxt=heo%0Ahelo%0Ahello%0Ahelllo%0Ahellllo%0Ahellllllo%0Alello%0Ahelio&inrgx=hel%3Fo) |
|   | 2. when used immediately after character repetition expressions (like + or {}), makes the quantifier non-greedy. | 2. applying \d? to 123 matches 1, without ? in greedy mode it would consume all | [try] |
|   | 3. Used in lookahead assertions | 3. x(?=y) matches x only if followed by y | [try] |
| * | Matches preceding character zero or more times | hel*o matches heo, helo, hello, helllo, hellllllo... | [try](/apps/regextester/?intxt=heo%0Ahelo%0Ahello%0Ahelllo%0Ahellllo%0Ahellllllo%0Alello%0Ahelio&inrgx=hel*o) |
| + | Matches the preceding character one or more times | hel+o matches helo, hello, hellllllllo... | [try](/apps/regextester/?intxt=heo%0Ahelo%0Ahello%0Ahelllo%0Ahellllo%0Ahellllllo%0Alello%0Ahelio&inrgx=hel%2Bo) |
| . | Matches any single character except newline | hel.o matches hello or helio | [try](/apps/regextester/?intxt=heo%0Ahelo%0Ahello%0Ahelllo%0Ahellllo%0Ahellllllo%0Alello%0Ahelio&inrgx=hel.o) |
| ^ | Matches the start of the string or a line if the m flag used | ^ello matches ello | [try](/apps/regextester/?intxt=heo%0Ahelo%0Ahello%0Ahelllo%0Ahellllo%0Ahellllllo%0Alello%0Ahelio&inrgx=hel%3Fo) |
| $ | Matches the end of the string or a line if the m flag used | hell$ doesn't matches hell | [try](/apps/regextester/?intxt=hell%0Aell&inrgx=hell%24) |
| \ | Escapes the special meaning of metacharacters that are followed with \ | \. matches period instead of any single character | [try](/apps/regextester/?intxt=127.0.0.1&inrgx=%5C.) |
| &#124; | Matches either sides of the pipe | (hello|hallo) matches hello or hallo | [try](/apps/regextester/?intxt=hello%0Ahallo%0Ahalo%0Ahelo%0Ahullo&inrgx=%28hello%7Challo%29) |
| (x) | Creates groups | | |
| | 1. used for pipes or {x,y} | 1. h(a|e)llo matches hello or hallo | [try](/apps/regextester/?intxt=hello%0Ahallo%0Ahalo%0Ahelo%0Ahullo&inrgx=h%28a%7Ce%29llo) |
| | 2. Used in metasequences | 2. he(l){1,2}o matches helo and hello and not heo | [try] |
| | 3. Used for extraction to remember the match | 3. he(l)\1o remembers l and therefore matches hello | [try] |
| [xyz] | Character classes and ranges | 1. h[ea]llo matches both hello and hallo | [try](/apps/regextester/?intxt=hello%0Ahallo%0Ahalo%0Ahelo%0Ahullo&inrgx=h%5Bae%5Dllo) |
|||2. [a-g] matches any character between 'a' and 'g'|[try]|
|||3. [A-z1-9.] or [A-Za-z0-9] (with case on) matches any character from alphabet and dot (literally)|[try]|
|||4. [+/-] matches plus and minus signs - notice we need to escape dash with backslash|[try]|
|||5. [^a-f] matches any character except for range from 'a' to 'f'|[try]|
| (?:x) | Matches x without extraction / remembering the match |||
| x(?=y) | Matches x if it is followed by y | h(?=e) would match h in hello | [try](/apps/regextester/?intxt=hello%0Ahallo%0Ahalo%0Ahelo%0Ahullo&inrgx=h%28%3F%3De%29) |
| x(?!y) | Matches x if it is NOT followed by y | h(?!e) would not match h in helo but would match in halo | [try](/apps/regextester/?intxt=hello%0Ahallo%0Ahalo%0Ahelo%0Ahullo&inrgx=h%28%3F!e%29) |

---  
#### 4.2 List of most common **metasequences**:
---

| Exp | Meaning | Example | Test |
|:----|:--------|:--------|:-----|
| {n} | Matches exactly n occurrences of the preceding char or group | hel{1}o matches helo only | [try] |
| {n,} | Matches at least n occurrences of the preceding char or group | hel{1,} mathes helo, hello, hellllo and so on | [try] |
| {n,m} | Matches at least n but no more than m and n <= m of the preceding char or group| hel{1,2}o matches only helo and hello | [try] |
| \w | Any word character, shortcut for [A-z0-9_] | hel\wo matches hello or helio but not helo | [try] |
| \W | Negation of the above, any non-word char, same as [^A-z0-9_] |  | [try] |
| \b | Matches a word boundary, where a word character is not followed or preceded by another word char. Match boundary is not include in the match! | \bh matches the 'h' in hello. o\b will match the 'o' in hello | [try] |
| \B | Negation of the above, any non-boundary char | TODO | [try] |
| \d | Matches any digit, shortcut for [0-9] | \dC matches 1C | [try] |
| \D | Negation of the above |  | [try] |
| \s | Matches single white space (space, tab, line and form feed) | \s\w+ matches the ' world' (with space) in hello world | [try] |
| \S | Negation of the above |  | [try] |
| \n | Matches new line char | hello\nworld matches "hello\nworld" | [try] |
| \r | Matches carriage return char | hello\rworld matches "hello\rworld" | [try] |
---
### 5. Extractions and replacements using patterns
If parts of the regular expression patter are wrapped into parentheses, they are going to be captured and remembered.

When using the RegExp.exec method we will see the remembered matches contained remembered in the results. In the example below we extract first and the last name at index 1 and 2:
```js
var tx = "his name is John and last name is Smith";
var re = /([A-Z]\w+).*([A-Z]\w+)/g;
console.log(re.exec(tx));

// ["John and last name is Smith", "John", "Smith", index: 12, input: "his name is John and last name is Smith"]
```

If we use the replace method, we can use the replacement codes in the replacement substring.

---

| Replacement Code | Replaced by |
|:-----------------|:------------|
|$$|The $ character ($escapes the second $)|
|$&|The whole matched substring|
|$`|Text in the string that precedes the matched substring|
|$'|Text in the string that follows the matched substring|
|$n|The n group remembered |
---
```js
var tx = "his name is John and last name is Smith";
var re = /([A-Z]\w+)(.*)([A-Z]\w+)/g;
console.log(tx.replace(re, "$3$2$1"));

// his name is Smith and last name is John
```

In the pattern above, the first group captures the first name, the second anything between the first and last name and the third group the last name. In the replace method we place the content of the last group (the last name) in the place of the first group (the first name).

### 6. Greedy and lazy

When executing a pattern containing character repetition metasequences like *, + or {n,m}, the pattern is going to consume as many characters as possible, therefore it is called "greedy". The most popular example of that is matching the html markup tags:

```js
var tx = "<p>his <i>name</i> is <b>John</b> and <i>last name</i> is <b>Smith</b></p>And here is some text outside.";
var re = /<.+>/g
tx.match(re);

// ["<p>his <i>name</i> is <b>John</b> and <i>last name</i> is <b>Smith</b></p>"]
```

This pattern matched the whole string until the last closing angle bracket - only the last part starting with "And" is outside of the match. The expectation might have been that the match should stop on the first b tag but as we see it hasn't happened. The engine finds the opening angle bracket and then follows with any character as per the "." metacharacter. It finds the p, then the closing angle bracket which still is matched by the ".". This process continues until the engine matches the end of the string, but since the pattern requires the closing angle bracket to be the last character, the engine moves back to find it.

There are two remedies to overcome the greedy patterns: use the character class (in example /<[^>]+>/g) or create a nongreedy "lazy" pattern by adding the question mark right after the metasequence character. In this case, when the engine uses the lazy mode, it tries to match as few characters as possible, so after the first "." any character match (we use + so one or more preceding chars) it checks if the next is not the closing angle bracket character that ends the pattern.

In our example this would be <.+?>:
```js
var tx = "<p>his <i>name</i> is <b>John</b> and <i>last name</i> is <b>Smith</b></p>And here is some text outside.";
var re = /<.+?>/g
tx.match(re);

// ["<p>", "<i>", "</i>", "<b>", "</b>", "<i>", "</i>", "<b>", "</b>", "</p>"]
```

### 7. Examples in JavaScript
---
#### 7.1 For the given string find all names where second character is 'a'

Input string:
```js
var tx = `April
Jennifer
Lana
Macie
Amaya
Melissa
Safa
Alexia
Scarlet
Mary
Rosa
Amelia-Rose
Emmie
Lily-Mae
Cara
Yasmin
Hallie
Ada`;
```

**Note:** I'm using ES6 template strings that allow me to use break lines. The ES5 alternative would be to split each line with the new line char "\n":
```js
var tx = "April\nJennifer\n...";
```

```
/^.a/gim
```

Using start of the string "^", any single character and finally the "a", gives the results. Using global, ignore case and multiline flags.

[>Try in RegEx Tester](/apps/regextester/?intxt=April%0AJennifer%0ALana%0AMacie%0AAmaya%0AMelissa%0ASafa%0AAlexia%0AScarlet%0AMary%0ARosa%0AAmelia-Rose%0AEmmie%0ALily-Mae%0ACara%0AYasmin%0AHallie%0AAda&inrgx=%5E.a)

#### 7.8 Find all urls in the string and wrap them into the HTML a tags.

```js
var tx = "Visit my blog http://sigman.pl or check out my github at http://github.com/wsierakowski";
var re = /(https?:\/\/[a-z0-9/.\-_]+)/g;
tx.replace(re, "<a href=\"$&\">$&</a>");
// "Visit my blog <a href="http://sigman.pl">http://sigman.pl</a> or check out my github at <a href="http://github.com/wsierakowski">http://github.com/wsierakowski</a>"
```

The pattern looks for patterns starting with http and optional s, followed by colon and two slashes (escaped with backslashes), then one or more characters from the range including alphabet, digits, dash (escaped), underscore and slash. In the replacement substring we refer to the remembered matches with the replacement code "$&" forming the "a" tag.

[> Try in TegEx Tester](/apps/regextester/?intxt=Visit%20my%20blog%20http%3A%2F%2Fsigman.pl%20or%20check%20out%20my%20github%20at%20http%3A%2F%2Fgithub.com%2Fwsierakowski&inrgx=%28https%3F%3A%5C%2F%5C%2F%5Ba-z0-9%2F.%5C-_%5D%2B%29)

### 8. Examples in `grep`
---
#### 8.1 Intro

Global Regular Expression Print (`grep`) is a tool that comes with practically every Unix system and is one of the most popular and widely used utilities by multiple category of users like administrators and developers.

Grep can be used on files in the following way:

```bash
$ grep args filename
```

or with input piped:

```bash
$ echo "abcdef" | grep args
```

---
#### 8.2 Find all lines in the file starting with the character 'p'

For the following input.txt file:

```
Amelia
Olivia
Isla
Emily
Poppy
Ava
Isabella
Jessica
Lily
Sophie
Grace
Sophia
Mia
Evie
Ruby
Ella
Scarlett
Isabelle
Chloe
Sienna
Freya
Phoebe
Charlotte
Daisy
Alice
```

find all names starting with 'a' or 'c' case insensitive:

```bash
$ grep -i '^[ac]' input.txt

Amelia
Ava
Chloe
Charlotte
Alice
```

---
#### 8.2 Achieve the same result as in the previous example using groups

If we tried to do this:

```bash
$ grep -i '^(a|c)' input.txt
```

we are not going to receive any matches as grep doesn't understand that expression. We need to use the extended version. As per the `man grep`:

> -E, --extended-regexp: Interpret pattern as an extended regular expression (i.e. force grep to behave as egrep).

```bash
$ grep -iE '^(a|c)' input.txt

Amelia
Ava
Chloe
Charlotte
Alice
```

---
#### 8.3 Find capital letters in a piped string and use color to highlight matches

```bash
echo 'aAbBcCdDeE' | grep --color [:upper:]
```

The above will highlight only small 'e' as it will use the definition in the brackets as a character set and only the 'e' letter matches. This will interpret it as a character class so all capital letters will be highlighted:

```bash
echo 'aAbBcCdDeE' | grep --color '[[:upper:]]'
```

---
### 9. Examples in `sed` (work in progress...)
---
#### 9.1 Intro

Stream Editor `sed` is as popular as `grep`. It's purpose is editing/applying transformations on the input string based on set of rules provided, that could be also regexes. As for grep, sed takes input either from a file or standard input (if file is omitted). What is unique about this tool is the program part that defines the manipulations.

```bash
$ sed <program> <file>
```

The program may look like that:

```
s/regex/replacement/params
```

Where each part separeted with slash has its purpose and meaning as below:
- 1st: `s` means that we are doing search and replace
- 2nd: `regex` which is used on the input string
- 3rd: `replacement` string that will replace matches
- 4th: `params` like global

---
#### 9.2 Replace vowels with the underscore characters

```bash
$ echo "hello world to the whole world" | sed s/[aeiou]/_/g

h_ll_ w_rld t_ th_ wh_l_ w_rld
```
