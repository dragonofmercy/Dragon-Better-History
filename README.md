# Dragon-Better-History

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://ko-fi.com/dragonofmercy)

Better history for Microsoft Edge Chromium

## How to compile less

Compile all less files with  
```sh
less $ProjectFileDir$/src/css/history.less $ProjectFileDir$/build/assets/application.css --clean-css="--s0 --advanced
```

## How to compile javascript

Compile all javascript files to the compile folder using this command:  
```sh
terser $FileName$ --output compiled/$FileNameWithoutExtension$.js --comments false
```

Then execute in powershell merge all file into a single javascript file:  
```pwsh
powershell Get-Content .\src\js\_merge.txt | foreach { Get-Content .\src\js\compiled\$_ } | Set-Content .\build\assets\application.js
```

If you need to add more javascript file don't forget to add it inside "_merge.txt" file.

## 

If this project help you reduce time to develop, you can give me a cup of coffee :) 

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://ko-fi.com/dragonofmercy)
