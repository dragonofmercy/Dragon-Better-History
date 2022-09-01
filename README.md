# Dragon-Better-History

Better history for Microsoft Edge Chromium

## How to compile less

Compile all less files with  
````less $ProjectFileDir$/src/css/history.less $ProjectFileDir$/build/assets/application.css --clean-css="--s0 --advanced````

## How to compile javascript

Compile all javascript files to the compile folder using this command:  
````terser $FileName$ --output compiled/$FileNameWithoutExtension$.js --comments false````

Then execute in powershell merge all file into a single javascript file:  
````powershell Get-Content .\src\js\_merge.txt | foreach { Get-Content .\src\js\compiled\$_ } | Set-Content .\build\assets\application.js````

If you need to add more javascript file don't forget to add it inside "_merge.txt" file.
