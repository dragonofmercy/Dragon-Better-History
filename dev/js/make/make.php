<?php
$handle = fopen(realpath(dirname(__FILE__)) . '/make.txt', "r");
$destination = realpath(dirname(__FILE__) . '/../../../src/assets');
$buffer = '';

if($handle)
{
    while(($line = fgets($handle)) !== false)
    {
        $file = realpath(dirname(__FILE__) . '/..') . '/compiled/' . trim($line);

        if(file_exists($file))
        {
            $buffer.= file_get_contents($file);
        }
    }

    fclose($handle);

    if(file_exists($destination))
    {
        file_put_contents($destination . '/application.js', $buffer);
    }
}