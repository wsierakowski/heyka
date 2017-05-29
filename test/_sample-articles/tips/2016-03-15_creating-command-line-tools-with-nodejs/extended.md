---
## Background

Creating command line tools with Node was the initial reason that hooked me in when my journey as Node.JS developer started almost 4 years ago. I recently needed to create a module for converting/parsing tests written in plain text format to JSON, so that they could be imported to the database easily.

The module is available here on NPM:
[https://www.npmjs.com/package/tests2json](https://www.npmjs.com/package/tests2json) <br>
or on github:
[https://github.com/wsierakowski/tests2json](https://github.com/wsierakowski/tests2json)

---
I wanted this module to have the following features:

---
##### 1. **Import as a Node module**
When installed with:
```
npm install tests2json
```
I should be able to import it in a standard way with the require:
```
var t2j = require('tests2json')
```

---
##### 2. **Use as command line tool**
When installed globally
```
npm install tests2json -g
```
I should be able to run it from command line interface (CLI) as any other program available from bash.

---
##### 3. **Accept parameters in CLI**
When run from CLI it should take both short:
```
$ tests2json -h
```
and long parameters:
```
$ tests2json --help
```
and display verbose help to the user.
Two key parameters would be the `input` to specify a path where the text file with tests should be read from and the `output` for a path which the json output should be saved to.

---
##### 4. **Accept piped streams**
When run from CLI accept output of other programs as input and output tests as JSON so that other programs could consume it:
```
$ cat tests.txt | tests2json >> tests.json
```

---
## Solution

---
### Folder Structure

The [folder structure](https://github.com/wsierakowski/tests2json) is fairly standard, skipping the obvious things like .gitignore, LICENSE, README.md and package.json, the entry point for the module working as the command line tool is the `tests2json.js` file. The script internally loads the `lib/tests2json.js` module that is the actual logic that parses raw tests text. The test folder contains [mocha](https://mochajs.org/) test runner tests that use [chai](http://chaijs.com/) as the assertion library.

```bash
.
├── .gitignore
├── LICENSE
├── README.md
├── lib
│   └── tests2json.js
├── package.json
├── test
│   ├── convert.js
│   ├── get_options.js
│   ├── get_question.js
│   └── split_raw_tests.js
└── tests2json.js
```

---
### Package.json
The [package.json](https://github.com/wsierakowski/tests2json/blob/master/package.json) file contents reveals that the only core dependency is the [commander](https://www.npmjs.com/package/commander) module that facilitates creating command-line interfaces:

```json
{
  "name": "tests2json",
  "version": "1.0.1",
  "description": "Converts plain text tests to json",
  "main": "lib/tests2json.js",
  "bin": {
    "tests2json": "./tests2json.js"
  },
  "scripts": {
    "test": "./node_modules/.bin/mocha --reporter spec test",
    "start": "node tests2json.js"
  },
  "author": "sigman.pl <wojciech@sierakowski.eu>",
  "license": "MIT",
  "devDependencies": {
    "chai": "^3.5.0",
    "mocha": "^2.4.5"
  },
  "dependencies": {
    "commander": "^2.9.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/wsierakowski/tests2json.git"
  }
}
```

The `main` property provides the entry point for the case the script is **loaded as the module with the require function**. When the user requires the module with `require('tests2json')`, the file specified as the value in this property is going to be loaded.

The [`bin` property](https://docs.npmjs.com/files/package.json#bin) on the other hand is used to make the script available from the command line. The 'tests2json' key tells the name of the tool and the value is a path to the entry point which in this case is the tests2json.js in the project root folder. What actually happens during the `npm install` of the module is npm will add an entry to the *PATH* environmental variable's and will create a symlink from the ./tests2json.js to usr/local/bin/tests2json (for global install with -g) or ./node_modules/.bin/tests2json (for local install).

Another thing worth mentioning here is the `scripts` entry that enables the users to start the script using:
```bash
$ npm start
```

and run the tests using:
```bash
$npm tests
```

---
### The command line entry point [./tests2json.js](https://github.com/wsierakowski/tests2json/blob/master/tests2json.js)

---
#### Make module command line executable

To let the Node script run as any other script like bash, perl or python, we need to add the Node.js [shebang](https://en.wikipedia.org/wiki/Shebang_%28Unix%29) at the top of the script file to specify its environment.

The shebang `#!` tells the system to pass the rest of the line after shebang to the interpreter, in other words when we run the script from the console, the system will run the /usr/bin/env and feed the contents of the file to the node interpreter. Node itself, like other scripting languages will ignore (will not interpret) the line that starts with shebang. An example of shebang for Perl: `#!/usr/bin/perl`.

```js
#!/usr/bin/env node
```

Once we make the file executable by providing executable permissions with `chmod`...

```bash
$ chmod u+x tests2json
```

...we should be able to run is as a script:

```bash
$ ./tests2json --version
```

But since we populated the `bin` property in the package.json and installed the module with `npn install` what made npm create the symlink for us, we can run the script globally:

```bash
$ tests2json --version
```

---
#### Find out if input comes from pipe or from command line with params

We want our tool to support running in the two following ways:
1. With parameters: `tests2json --input testsfile.txt`
2. With pipe so that the input comes as stdin: `cat testsfile.txt | tests2json`

Node allows to recognise this is with the [`isTTY` property](https://nodejs.org/api/process.html#process_process_stdout) available in the process.stdin which essentially checks if the script is run in the [TTY](http://stackoverflow.com/questions/13388704/what-is-a-tty-and-how-can-i-enable-it-on-ubuntu) context:

```js
if (process.stdin.isTTY) {
  // Command line args - read args from process.argv
} else {
  // Pipe data - read from process.stdin
}
```

---
#### Read arguments and display help

There are quite many options for reading parameters and values passed from the shell when executing the script.

For the following execution:

```bash
$ tests2json -i tests.txt
```

we could read the parameters in the following way using the built in Node functions in the built-in `process` module:

```js
console.log(process.argv);

// returns:
// ['node', 'tests2json', '-i', 'tests.txt']

// Remove two first values: the 'node' and the file name of he executed script:
var args = process.argv.slice(2);
```

Since we want to be able to print tool help and also support short and long parameters, it might be easier to use one of the popular npm modules, my favourite is [commander](https://www.npmjs.com/package/commander).

```js
var program = require('commander');

program
  .version('1.0.1')
  .description('Converts tests in text format to json.')
  .option('-i, --input <value>', 'Input tests text file.')
  .option('-o, --output [value]', 'Output tests json file.')
  .on('--help', function(){
    console.log('  Alternatively you can pipe raw tests as input and output the json from the script.');
    console.log('');
    console.log('    $ cat tests.txt | tests2json >> tests.json');
    console.log('');
  })
  .parse(process.argv);
```

Purpose of each of the functions:
- `version` sets the application version number that will get printed when we execute the script with `-v`/`--version` (we could actually read it from package.json to have just one point of reference)
- `description` provides app description that will be printed at the top of the help (we could read that from package.json as well)
- `option` specifies the short and the long version for parameters, type of the values expected and the description for the help. The angle brackets denote this parameter is required, square brackets are for optional.
- `on` responds to event, in this case this is the custom help message when the user calls with `-h`/`--help`. In the callback we just use console.log to print the lines to terminal. If we didn't use that event handler, commander would still print help generated by default based on the options provided by us.

Here is how the help is generated using the above configuration:

```bash
$ tests2json --help

  Usage: tests2json [options]

  Converts tests in text format to json.

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -i, --input <value>   Input tests text file.
    -o, --output [value]  Output tests json file.

  Alternatively you can pipe raw tests as input and output the json from the script.

    $ cat tests.txt | tests2json >> tests.json
```

The script will expect the following parameters ( the output param is optional, if not provided, the results will be printed to console instead of saved to a file):

```bash
  $ tests2json -i tests.txt -o tests.json

  $ tests2json --input tests.txt --output tests.json
```

To print the error message when a required parameter is missing...

```bash
$ tests2json

Error: Providing input tests text file is required.
```

...I'm using the following code, where I'm checking if the input property isn't null, or alternatively in the same way I could check if the value provided is of the right data type or expected format with a regex value. In case the input isn't right, the script will printing the error message followed by the full help message printed again (for user's convenience) with the `program.outputHelp()` function and finally the script will exit with code 1 to indicate an error back to the shell.

```js
if (!program.input) {
    console.log('Error: Providing input tests text file is required.');
    program.outputHelp();
    process.exit(1);
  }
```
---
#### Read piped or redirected data

Piping data between scripts is in the core of any *nix system. We want to allow output from other scripts to be piped as input to tests2json and we want to be able to pass the result to other apps, like in the example below when we read the contests of the tests.txt file with the `cat` utility, pipe it to our script and then redirect the results to the tests.json file using `>>`:

```bash
$ cat tests.txt | tests2json >> tests.json
```

Or redirected input:

```bash
$ cat tests2json < tests.txt >> tests.json
```

In order to implement that in Node, first we need to ensure the standard input isn't in the TTY mode as mentioned earlier in this article. Then we need to start reading from the [process.stdin](https://nodejs.org/api/process.html) using the resume function, otherwise the script will exit without waiting for anything. After setting the utf8 encoding we are listening for the `data` event on the stdin to receive the piped data.

```js
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function(data){
  // process received data here...
}
```

---
#### Exit codes

A decent command line script should indicate whether there has been an error executing it or the process completed successfully. For this purpose we use the exit codes. You may have noticed earlier that we provided the exit code 1 when there has been an error condition (missing required input). When everything goes well, the process should finish execution with exit code 0.

```js
if (err) process.exit(1)

// When complete:
process.exit(0);
```

---
#### Signals

Node applications can also listen to signals sent by the operating system, the process or the user. For example a signal might be sent by the user hitting `ctrl+c` (SIGINT) or another process (like `kill -9 pid`) sending the kill signal (SIGKILL/SIGSTOP/SIGTERM). List of signals and information on which are supported on Windows can be found in the node docs: [https://nodejs.org/api/process.html](https://nodejs.org/api/process.html).

Listening to particular signals is done in the following way:

```js
process.on('SIGINT', function () {
  console.log('Received SIGINT!');
  process.exit(0);
});
```

If you find out the node's process ID, you can use it then to send the `SIGINT` signal:

```bash
$ ps aux | grep node

$ kill -s SIGINT node_process_id
```
