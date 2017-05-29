[(!) Article updated on 21/11/2011.]

### 1. Intro
The prompt usually ends with the dollar sign ($), in example `username@hostname:path$`.

If you want to use multiple parameters, add them one by one, in example instead of running `ls -l -a -h`, run `ls -lah`.

Single letter parameters are passed after single dash, word parameters are passed after two dashed, in example ls `-r` or `ls --reverse'

### 2. Operations on files and directories
---
#### 2.1 Using wildcards (shell globbing)
Globing is the ability of the shell to match patterns to file and directory names. When glob is found as parameter to any command, the shell "expands" it and returns the filenames that match the pattern. If no files match glob, the shell returns the pattern itself to the command where the glob is used. Globbing is done before executing the command. The two most popular glob characters are `*` that matches any number or characters and `?` that matches one arbitrary character. To not use globbing, the pattern needs to be wrapped in single quotes. The best way to practice globs is by using the echo command, that is used to print its arguments as standard output:
```bash
$ echo *
afpovertcp.cfg aliases aliases.db apache2 asl asl.conf

$ echo *ap
openldap

$ echo ap*
apache2

$ echo *ap*
apache2 com.apple.screensharing.agent.launchd openldap

$ echo *ap?che*
apache2

$ echo '*ap?che*'
*ap?che*
```

---
#### 2.2 ls

Lists directory contests, by default in the current directory.

Running without params:
```bash
$ ls
api			argumentsProcessor.js	config.js		entities		maps			
```

Usually I want to know the detailed description so I use the following additional parameters:
* -l for long description
* -a for displaying also hidden files (beginning with dot)
* -h for displaying file sized in human readable format (shortened)

```bash
$ ls -lah
total 128
drwxr-xr-x  17 wojsierak  staff   578B  9 Jul 12:05 .
drwxr-xr-x  13 wojsierak  staff   442B 29 Jun 11:44 ..
-rw-r--r--@  1 wojsierak  staff   6.0K 27 May 20:32 .DS_Store
drwxr-xr-x  14 wojsierak  staff   476B 29 Jun 11:44 api
-rw-r--r--   1 wojsierak  staff   3.1K  6 Feb 16:03 argumentsMapper.js
-rw-r--r--   1 wojsierak  staff   4.1K 21 Nov  2011 argumentsProcessor.js
```

Running ls in another directory:
```bash
$ ls -lah /etc
```

Other useful parameters:
* -d: list only directories
* -I, --ignore: lists files not matching pattern, in example `ls --ignore='a*' would exclude files starting from letter 'a'.
* -R, --recursive: prints also content of subdirectories.

Sorting options:
* -r, --reverse: sorts files in the reverse order.
* -S, --sort=size
* -t, --sort=time: sorts by last modification time
* -u, --time=access: sorts by last access time
* -X, --sort=extension: sorts by extension names

Columns explanation:
```
1:            2: 3:       4:    5:      6:           7:
drwxr-xr-x    14 wsierak  staff 476B    29 Jun 11:44 api

?UUUGGGOOO    00  UUUUUU GGGGGG ####    ^-- date stamp and file name
^ ^  ^  ^      ^      ^      ^    ^
| |  |  |      |      |      |    \--- File Size
| |  |  |      |      |      \-------- Group Name (for example, Users, Administrators, etc)
| |  |  |      |      \--------------- Owner
| |  |  |      \---------------------- Links count
| \--\--\----------------------------- Read, Write and Special access modes for [U]ser, [G]roup, and [O]thers (everyone else)
\------------------------------------- File type flag
```

**Type and access:**

There are four parts that make this column.
```
| File |     Permissions      |
| Type | User | Group | Other |
-------------------------------
   d     rwx     r-x     r-x
```
File type:
* \- (dash): regular file
* d: directories
* l: symlink (symbolic link)
Less common:
* p: pipe
* s: socket

The permission sets are as follows:
* user: the user who owns the file
* group: the group a file belongs to, any user in that group takes advantage of these permissions
* other: everyone else in the system

Permissions types:
* r: read contents of file or read the contents of directory (view files and sub-directories in that directory)
* w: write to a file or writ to the directory (create files and sub-directories in that directory)
* x: execute programs or scripts for the files or enter into the directory
* \-: no permission

Examples:
* `-r-x------` means that the file can be only read and executed but not written to only by an owner
* `drwxr-xr-x` means the file is directory, can be read, written to and content can be accessed by the owner and can be read and accessed by users in a group and other users in the system

---
#### 2.3 Creating files
There are many ways to create a new file directly from the command line without using any text editor.

---
##### 2.3.1 Touch
The simplest way is by using the `touch` command that is used to update the modification time stamp, however when the file doesn't exist, it will create an empty one.

```bash
$ touch read.me
```

---
#### 2.3.2 Standard output from another command
Standard input and output are also called streams. Processes read and write commands from them. To send output of any command to a file instead of terminal use the redirection in one of the two following forms:

Below will create a new file or overwrite an existing file
```bash
$ echo 'hello world' > read.me
```

Below will create a new file or append to an existing file
```bash
$ echo 'hello world' >> read.me
```

---
#### 2.4 Reading files
There are many ways of reading the contents of a file without editor.

---
##### 2.4.1 Cat
Cat  simply prints contents of one or more file.

```bash
$ cat read.me lisez.moi
```

---
##### 2.4.2 Less
Less command is used to page through large files. It is also used by the `info` command that is used for reading manuals. By pressing the `space bar` to move forward and the `b` key to move backward the user can conveniently control pagination instead of reading just a portion of a text while the rest would be already gone. To quit press the 'q' button. To search for a word type `/searchword` for searching forward and `?searchword` for searching backward.

```bash
$ less read.me
```

Less can also read input from piped stream:
```bash
$ ls -lah | less
```

---
##### 2.4.3 Head and Tail
Both commands show n number of lines from a file or input stream, as the name suggests, the head command shows the first n lines and the tail n last lines. Default num of lines is 10, change num by using the -n parameter.

```bash
head -n3 /etc/passwd
##
# User Database
#

tail /etc/passwd
# ... will print the last 10 lines from the file.

```

---
#### 2.5 Copying, Moving, Renaming, Removing files

With all of the commands listed here, the file names or folder paths can be used as well as globs explained earlier.

---
##### 2.5.1 Copy files or folders

Copying file into another (cloning) with 'cp' command:
```bash
$ cp read.me readme.txt
```

Copying to another folder:
```bash
$ cp file1...filen foldernameorpath
```

---
##### 2.5.2 Move files or directories

Renaming files with 'mv' command:
```bash
$ mv read.me readme.txt
```

Moving files or directories to another places:
```bash
$ cp file1...filen foldernameorpath
```

---
##### 2.5.3 Remove files or directories

Removing files with the 'rm' command:

```bash
$ rm read.me
```

Removing directories with its contents that could be other directories and files is done with two parameters: `r` for recursive and `f` for forcing:
```bash
$ rm -rf myfolder
```

---
#### 2.6 Navigating directories

---
##### 2.6.1 Print current working directory
Use 'print working directory' command:

```bash
$ pwd
/Users/wojciechsierakowski/Documents
```

Use `-p` parameter to show the true full path with symbolic links. /*

---
##### 2.6.2 Change current working directory

Unix directory hierarchy starts at the root directory marked as `/`. There are two type of paths describing location of files or folders:
* absolute - starting with slash: /etc/tmp
* relative from the current position in the hierarchy - without the slash: applications/program

The single dot `.` refers to the current directory, if you are in the home/applications folders, then single dot refers to that folder. Most commands refer to the current folder anyway so this is not used very often.
The double dot `..` refers to the parent folder.

Changing current directory to the root folder:
```bash
$ cd /
```

Changing current directory to the applications directory placed in the users' home directory (`~` is a shortcut for home dir):
```bash
$ cd ~/home
```

---
##### 2.6.3 Create directory

```bash
$ mkdir mydirectory
```

##### 2.6.4 Remove directory

In most cases `rmdir` command is useless as if the directory contains files or subdirectories it will print the following error:

```bash
$ rmdir mydirectory
rmdir: mydirectory: Directory not empty
```

Instead use the `rm` command with `-r` recursive parameters as described earlier.

---
#### 2.7 More advanced file commands

---
##### 2.7.1 Search for lines in files containing search text

The `grep` command prints the lines from file or files or input stream matching an expression.

Printing lines containing word 'sigma' in the dictionary file /usr/share/dict/words:
```bash
$ grep sigma /usr/share/dict/words
sigma
sigmaspire
sigmate
sigmatic
```

Printing lines containing word 'http' in the /etc/apache2 .conf files:
```bash
$ grep server /etc/*.conf
/etc/dnsextd.conf:// you could choose to allow anyone with a DNS key on your server to
/etc/dnsextd.conf://	nameserver			address 127.0.0.1 port 5030;
/etc/resolv.conf:nameserver 37.8.214.2
```

The results contain the files containing the searched keywords as well as the lines themselves.

Most commonly used parameters are:
* /- v that inverts the search to display lines not matching
* /- i for case-insensitive matches

Grep used with the `-E` options enables the powerful regular expressions search

---
##### 2.7.2 Getting file format details
```bash
$ file IMAG2674.jpeg
IMAG2674.jpeg: JPEG image data, EXIF standard

$ file NBp3Stories.xlsx
NBp3Stories.xlsx: Zip archive data, at least v2.0 to extract
```

---
##### 2.7.3 File difference

The `find` commands shows differences between two files.

For the following two files:
```bash
$ cat readme1.txt
this
is
a sample
txt
file for showing differences

$ cat readme2.txt
this is
the sample
text
file for showing differences
in files

```

It will print the following output:
```bash
$ diff readme1.txt readme2.txt
1,4c1,3
< this
< is
< a sample
< txt
---
> this is
> the sample
> text
5a5
> in files
```

Notice the differences are only included.

Using the `-u` parameter prints the output in another format:
```bash
$ diff -u readme1.txt readme2.txt
--- readme1.txt	2015-07-27 18:10:18.000000000 +0100
+++ readme2.txt	2015-07-27 18:10:48.000000000 +0100
@@ -1,5 +1,5 @@
-this
-is
-a sample
-txt
+this is
+the sample
+text
 file for showing differences
+in files
```

---
##### 2.7.4 Finding files (*)
When using find's own pattern matching feature, wrap the search term in single quotes to prevent the shell from using its own globbing.
```bash
$ find dir -name file -print
```
An alternative to `find` is `locate` command, that uses the index that the operating system maintains and updates periodically. It is much faster than `find` but the results may not contain the files added recently.

---
##### 2.7.5 Sorting lines
Sorting in numerical order with `-n`, reversing `-r`.

---
##### 2.7.6 Changing file permissions

There are two main ways to change permission of a file with the `chmod` command.

The first method is to add or remove specific permissions to specific group:
* u for owner
* g for group
* o for others

```bash
# Adding read permissions to the group
$ chmod g+r file
# Removing write permissions from the world/others
$ chmod o-w file
```

Probably the more popular way to change permission is the absolute change by using numbers representing bits.
First number represents user, second group, third others.
Decimal representation represents 3 bits for read, write, execute: 4-2-1.

If the owner should have execute access and no read or write only the last bit is turned on so the decimal value for 001 is 1. If write access should be enabled, only the first bit should be turned on 010 what gives 2 in decimal. For read, write and execute all bits should be enabled 111 what gives 7.

```bash
# Read, write, execute access for owner, read and write for group and read for others:
$ chmod 764 filename

# Read, write for owner, no rights for others
$ chmod 400 filename
```

The shell default permissions are specified with the `umask` command, 022 means that all users will be able to see files and directories created by the user.

```bash
$ umask
0022
```

---
##### 2.7.7 Creating symbolic links

To create a file that points to another file like the shortcuts from M$ Windows use `ln` command with the `-s` parameter.

```bash
$ ln -s ~/projects/programs/ myprograms

$ ls -lah
lrwxr-xr-x   1 wsierakowski  staff    61B 28 Jul 11:21 myprograms -> /Users/wsierakowski/projects/programs

$ cat myprograms
cat: myprograms: Is a directory
```

Notice that when trying to see the content of the symbolic link, the user is actually moved to the destination, in this case a directory. To view where the link points to use `ls -l`. If the symlink file is copied to another location, the path will become inaccurate and the link will not be pointing correctly to the target anymore.

Use `ln` without the `-s` parameter to create hard links. (TBC)

---
### 3. Other basics

---
#### 3.1 Getting help

The most popular way for getting help is to use the manual pages `man` command.

```bash
# Finding documentation for the less command
$ man less

# Finding all documentation pages containing the keyword
$ man -k less
PPI::Token::End(3pm)     - Completely useless content after the _|_END_|_ tag
less(1)                  - opposite of more
less(3pm)                - perl pragma to request less of something
```

Right after the manual page name, there is a section number listed in the brackets. Also many books or internet sources refer to a section of man when talking about particular manual pages. The less command we use in terminal appear to be in the section one (1) in the results above. Here is the list of all manual sections:

|Section|Description|
|-------|-----------|
|1|General commands|
|2|System calls|
|3|Library functions, covering in particular the C standard library|
|4|Special files (usually devices, those found in /dev) and drivers|
|5|File formats and conventions|
|6|Games and screensavers|
|7|Miscellanea|
|8|System administration commands and daemons|


Searching for help in a particular section:

```bash
$ man 1 less

$ man 5 passwd
```

Alternative to the `man` command is the `info` command from the GNU project.

---
#### 3.2 Shell and Environment variables

Variables are used to store string data to use them in scripts or to control the way how shell or some commands behave.

Assigning to shell variable is done with the equal sign (no spaces around the sign), the variable can be accessed by using the dollar sign:
```bash
$ MYVAR=hello # define shell variable $MYVAR
$ echo $MYVAR
hello
```
In addition to shell variables, there are also environment variables. The main difference between them two is that an environment variable is a globally available, in a program and its child programs. A shell variable is only available in the current shell. To make a shell variable available as an environment variable, use `export VARNAME` (without dollar $).

To list all environment variables, use `env` and to list all shell variables, use `set`.

```bash
$ MYVAR=hello # define shell variable $MYVAR
$ echo $MYVAR
hello
$ env | grep MYVAR # note: no output
$ export MYVAR # turn $MYVAR into an environment variable
$ env | grep MYVAR
MYVAR=hello
```

Another way to define an environment variable:

```bash
$ export MYVAR=hello
$ echo $MYVAR
hello
$ env | grep MYVAR
MYVAR=hello
```

Shell variable PS1 is used to define how the shell prompt looks like:
```bash
$ set | grep PS1
PS1='\h:\W \u\$ '
```

Environment variable LESS is used by the `less` command to set the default options. Man pages for commands contain section ENVIRONMENT VARIABLES describing what are the env variables that can be used for that purpose.

Some of the `shell variables` evaluate to data that may come useful:
* $$ gives current shell process PID

---
#### 3.3 Command path

There is a special environment variable dedicated to keep a list of system directories that the shell use when trying for locate commands. When the user runs any program from the terminal, the shell will check the `PATH` variable first and only if the command is not found in the locations listed there, it will search for the command in the current working directory.

```bash
$ echo $PATH
/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/git/bin

$ env | grep PATH
PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/git/bin
```

If the shell locates the command in one of the locations, it will not search others.

To add a new directory to the existing `PATH` variable, append it to the beginning if you want that location to be searched first or to the end if you want that location to be searched last by using the colon sign. The changes aren't permanent since opening new shell will use the default `PATH` variable.

```bash
# add mypath to the beginning
$ PATH=mypath:$PATH

# add mypath to the end
$ PATH=$PATH:mypath
```

---
#### 3.4 Redirecting and piping input and output

To send the output of any command to a file instead of terminal use the single or double redirections `>`, `>>`. Single overwrites a file if it already exists and double appends to it.

```bash
$ ls > lsoutput.txt
$ ls >> lsoutput.txt
```

To send output from one command to another use the pipe character `|`.
```bash
$ grep https /etc/* | wc
```

To redirect also standard error in addition to standard output use the `2>` redirection where 2 is the streamID of the standard error, and 1 is streamID of the standard out.

```bash
$ ls nonexistantpath > stdout.txt
ls: nonexistantpath: No such file or directory

$ ls nonexistantpath > stdout.txt 2> stderr.txt
```

In the first case the error was printed as stderr was printed to the terminal, in the second case the same error message got printed to the stderr.txt file.

Saving both outputs to the same file:
```bash
$ ls nonexistantpath > out.txt 2>&1
```

To redirect the input use the `<` operator. It is not common to use input redirection as most of the commands accept path to a file as one of the arguments.

```bash
# both do the same

$ cat < /etc/passwd

$ cat /etc/passwd
```

---
#### 3.5 Controlling processes

---
##### 3.5.1 Listing processes

To get a list of running processes with their details such as:
* process IDs (PID)
* terminal device they are running in (TTY)
* process status (STAT)
* amount of CPU time a process used (TIME)
* command

use the `ps` command:
```bash
  PID TTY           TIME CMD
  507 ttys003    0:00.12 -bash
28893 ttys005    0:00.04 -bash
38675 ttys005    0:00.40 mongo
```

Often used parameters:
* `x` to show all running processes for the user calling the command
* `ax` to show all running process for all users
* `u` to include more detailed information
* `w` to show full names for commands

Most often the `ps` command is used with `aux` parameter and it's output is redirected to `grep` to find a particular process by name:
```bash
$ ps aux | grep apache
```

---
##### 3.5.2 Terminating and killing processes

Using the `kill` command, the user can send a signal to the process with certain `PID`. There are many type of signals:
* TERM used by default by the `kill` command to terminate a process
* STOP to freeze
* CONT to resume STOPped process
* KILL (9) to kill a process

```bash
$ kill pid

# same as above:
$ kill -TERM pid

# immediately kill:
$ kill -9 pid
# or:
$ kill -KILL pid
```

Both numbers and names of signals are accepted.

The KILL (9) signal should be used with caution as it is the only signal that immediately stops the process and removes it from the memory without giving time to remove temporary files or do other maintenance job. Processes usually wait for signals and in case of receiving TERM in example, they perform some ending task before closing.

Using CTRL+C while a process is running in the terminal is equivalent to sending INT signal.

---
##### 3.5.3 Running processes in background

To detach process from the shell to get back control over it we can put a process in the background by using ampersand. This is usually done for the processes that will take significant amount of time to complete their work like compressing a file. The process will also continue to run after logging out or closing the terminal window. To avoid random stdout text from the processes run in background, redirect their output to a file.

```bash
$ tar cvf arch.tar myfiles &
[1] 50845
```

The shell returns PID of the process and returns the prompt.

Use `fg` to bring the process back.
