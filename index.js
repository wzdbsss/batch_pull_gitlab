const request = require('request')
const config = require('./config');
const nodeCmd = require('node-cmd');
const path = require('path');

let hostAddr = config.url.match(/(http[s]?:\/\/.*?)\/groups/)[1];
let groupPath = config.url.match(/http[s]?:\/\/.*?\/groups\/(.*)\/-\/children\.json/)[1];

function sendRequest(relativePath, page) {

    let pageParameter = page === '' ? '' : '?page=' + page;

    request({
        url: hostAddr + '/groups/' + relativePath + '/-/children.json' + pageParameter,
        headers: {
            'User-Agent': config['UserAgent'],
            'cookie': config['cookie']
        }
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log(error, body);
            return;
        }

        let nextPage = response.headers['x-next-page'];
        if (nextPage !== "") {
            sendRequest(relativePath, nextPage);
        }

        // console.log(relativePath + ' ===> ' + body);
        let data = JSON.parse(body);

        Array.from(data).forEach(a => {
            let relativePath = a.relative_path.substr(1);
            if (a.type == 'project') {
                let addr = 'mkdir ' + relativePath.replace(/\//g, path.sep) + ' && cd ' + relativePath + ' && git clone git@' + this.host + ':' + relativePath + '.git'
                nodeCmd.run(addr);
                console.info('current pull: ' + a.name);
                for (var t = Date.now(); Date.now() - t <= 5000;) ;
            } else if (a.type == 'group') {
                sendRequest(relativePath, '');
            } else {
                console.error('can\'t process' + a);
            }
        });
    })
}

sendRequest(groupPath, '');
