# Dragon-Better-History

Better history for Microsoft Edge Chromium

## How to compile less

Compile all less files with `less $ProjectFileDir$/dev/css/history.less $ProjectFileDir$/src/assets/application.css --clean-css="--s0 --advanced`

## How to compile javascript

Compile all javascript files to the compile folder using this command:
`uglifyjs $FileName$ -o compiled/$FileNameWithoutExtension$.js`

Then execute the "make.php" file to merge all file into a single javascript file: 
`php $ProjectFileDir$\dev\js\make\make.php`

If you need to add more javascript file don't forget to add it inside "make.txt" file.