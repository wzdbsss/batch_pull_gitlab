const request = require('request')
const config = require('./config');
const nodeCmd = require('node-cmd');
const path = require('path');

let hostAddr = config.url.match(/(http[s]?:\/\/.*?)\/groups/)[1];
let groupPath = config.url.match(/http[s]?:\/\/.*?\/groups\/(.*)\/-\/children\.json/)[1];

function sendRequest(relativePath) {
    request({
        url: hostAddr + '/groups/' + relativePath + '/-/children.json',
        headers: {
            'User-Agent': config['UserAgent'],
            'cookie': config['cookie']
        }
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log(error, body);
            return;
        }
        // console.log(relativePath + ' ===> ' + body);
        let data = JSON.parse(body);

        for (var i in data) {
            let relativePath = data[i].relative_path.substr(1);
            if (data[i].type == 'project') {
                let addr = 'mkdir ' + relativePath.replace(/\//g, path.sep) + ' && cd ' + relativePath + ' && git clone git@' + this.host + ':' + relativePath + '.git'
                nodeCmd.run(addr);
                for (var t = Date.now(); Date.now() - t <= 5000;);
            } else if (data[i].type == 'group') {
                sendRequest(relativePath)
            } else {
                console.log(data[i])
            }
            console.log(data[i].name);
        }
    })
}

sendRequest(groupPath);

