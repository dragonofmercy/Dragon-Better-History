chrome.commands.onCommand.addListener(function(command) {
    console.log(command);
    if (command === 'dragon-open-history') {
        chrome.tabs.create({
            active: true,
            url:  'history.html'
        }, null);
    }
});