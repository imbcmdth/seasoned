# SEASONED (with your salt files)
Add a bit of seasoning to your SALT files! Converts a one or more of SALT files into a single CSV with a row for each utterance where the columns count the number times a code appears in each utterance.

## How to Use

### The Easy Way
The easiest way to use it is to install Node.js and then use the `npx` command to execute the command without the need to install anything else:
```
npx --yes seasoned "../my salt files/*.slt" > output.csv
```

### Advanced Usage
If you want to customize the columns (see below) then you'll need to use `git` to fetch the files from the repository:
```
git clone https://github.com/imbcmdth/seasoned.git
```
Then you will want to "install" the `seasoned` command as a global executable via `npm`:
```
cd seasoned
npm install . -g
```

After that is done, you can invoke the command as you would any other:
```
seasoned C:\my_salt_files\*.slt > output.csv
```

## How to Change Included Columns
Everything is driven by the `column-spec.yaml` file in the repository. Each line in the file specifies two things: 1) the final column name and 2) where the value comes from. The column name is self-explanitory so I will take a bit of time to explain the way you can specify the source of the data.

There are 3 main sources of data but they are specified in very similar ways:
1) The file name itself
2) The SALT header data
3) The codes within each utterance

### The File Name
The file name is split on underscores (\_) and dashes (\-) into *parts* that can be included as a column in the output. The parts are sequentially numbered starting at 0.

For instance, the file name "Bob_1992_English.slt" will become 3 parts:
* `fileNamePart_0` = "Bob"
* `fileNamePart_1` = "1992"
* `fileNamePart_2` = "English"

These can be referenced in the `column-spec.js` file to create columns with that data from the filename.

### SALT Headers
SALT headers are already key/value pairs we simply reference them directly by their key.

For example a file that contains the following header:
```
$ Child, Examiner
+ Language: English
+ Any Id: 1234567890
+ DOB: 1/1/2000
+ Office: Cambridge
+ Examiner: Alice
```

Will result in the following keys being available for the `column-spec.js` file:
* `Language` = "English"
* `Any Id` = "1234567890"
* `DOB` = "1/1/2000"
* `Office` = "Cambridge"
* `Examiner` = "Alice"

### Codes
Each unique code becomes a variable that can be logged. The value of the variable is the number of times the code appears in the line or utterance. There is no limit to the number of codes and codes that are not listed in `column-spec.js` are tracked but not made part of the output. See `column-spec.js` for an example of how codes are specified.

*Note: In the default `column-spec.js` the column name is identical to the code but this need not be the case - columns can have any name you want.*

