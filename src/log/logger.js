const fs = require('fs');
const path = require('path');

const loggingModules = 
[
    'match',
    'user',
    'chat',
    'logger',
    'login'
];

const logSeverity = 
{
    0: 'DEBUG',
    1: 'WARNING',
    2: 'ERROR'
};

let writeModules = {};

function init()
{
    try
    {
        console.log('[LOGGER] Init logger in directory', __dirname);

        let files = fs.readdirSync(__dirname);
        
        for (let i = 0; i < loggingModules.length; i++)
        {
            let mod = loggingModules[i];

            const [file, mx] = getLogFile(loggingModules[i], files);

            if (mx === -1)
            {
                let timeStamp = new Date().toISOString().replace(/\..+/, '').replace(/T([0-9]+:)+[0-9]*/, '');
                const newFileName = mod + '_' + timeStamp + '_' + '0';

                fs.appendFileSync(path.join(__dirname, newFileName), '');
                writeModules[mod] = [newFileName, 0, fs.createWriteStream(path.join(__dirname, newFileName), {flags: 'a', encoding: null, mode:0666})];
            }
            else writeModules[mod] = [file, mx, fs.createWriteStream(path.join(__dirname, file), {flags: 'a', encoding: null, mode:0666})];
        }

        console.log('[LOGGER] Logger initialized...');
    }
    catch(error)
    {
        console.log('[LOGGER] Error in init', error);
    }
}

async function write(module, content, severity=0)
{
    try
    {
        let flag = true;
        let finalSeverity = severity;
        const timeStamp =  new Date().toISOString().replace(/\..+/, '');

        for (m in loggingModules) if (loggingModules[m] === module) flag = false;

        if (flag) 
        {
            writeModules['logger'][2].write(`ERROR ${timeStamp}: Logging module ${module} does not exist.\n`);
            return;
        }

        if (severity >= 3 || severity < 0)
        {
            writeModules['logger'][2].write(`WARNING ${timeStamp}: Invalid severity value. Defaulting to ERROR status.\n`);
            finalSeverity = 2;
        }

        writeModules[module][2].write(`${logSeverity[finalSeverity]} ${timeStamp}: ${content}\n`);
    }
    catch(error)
    {
        console.log('[LOGGER] Error writing to log', module);

        if (module !== 'logger') writeModules['logger'][2].write(`ERROR ${timeStamp}: Logging module ${module} error ${error}.\n`);
    }
}

function getLogFile(module, files)
{
    let selectedLogFile = '';
    let mx = -1;

    for (let j = 0; j < files.length; j++)
    {
        let fileName = files[j];

        if (fileName.includes(module))
        {
            let fSplit = fileName.split('_');
            let logCount = parseInt(fSplit[fSplit.length - 1]);

            if (mx < logCount)
            {
                mx = logCount;
                selectedLogFile = fileName;
            }
        }
    }

    return [selectedLogFile, mx];
}

module.exports = {
    init:init,
    write:write
}