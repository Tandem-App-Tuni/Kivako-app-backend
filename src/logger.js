const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const FILE_SIZE_LIMIT_MEGABYTES = 1; 
const loggingModules = 
[
    'match',
    'user',
    'chat',
    'logger',
    'login',
    'admin'
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
        setWriterModuls();
        schedule.scheduleJob('0 0 * * *', () => 
        {
            fileSizeCheck();
            closeModuls();
            setWriterModuls();

            console.log('[LOGGER] Modules reset check compleated.');
        });
    }
    catch(error)
    {
        console.log('[LOGGER] Error in init', error);
    }
}

function fileSizeCheck()
{
    try
    {
        for (let k in writeModules)
        {
            const module = writeModules[k];
            const fileSize = fs.statSync(module[2].path).size;

            if ((fileSize/1000000) >= FILE_SIZE_LIMIT_MEGABYTES)
            {
                let timeStamp = new Date().toISOString().replace(/\..+/, '').replace(/T([0-9]+:)+[0-9]*/, '');
                const newFileName = path.join(__dirname, 'log' ,k + '_' + timeStamp + '_' + String(module[1] + 1));

                fs.appendFileSync(newFileName, '');

                console.log('[LOGGER] Adding new module', newFileName);
            }
        }
    }
    catch(error)
    {
        console.log('[LOGGER] Error in fileSizeCheck', error);
    }
}

function closeModuls()
{
    try
    {
        for (let k in writeModules) 
        {
            console.log('[LOGGER] Closing', k);
            writeModules[k][2].close();
        }

        writeModules = {};
    }
    catch(error)
    {
        console.log('[LOGGER] Error in closeModuls', error);
    }
}

function setWriterModuls()
{
    try
    {
        console.log(`[LOGGER] Init logger in directory ${__dirname}/log`);

        let files = fs.readdirSync(path.join(__dirname,'log'));
        
        for (let i = 0; i < loggingModules.length; i++)
        {
            let mod = loggingModules[i];

            const [file, mx] = getLogFile(loggingModules[i], files);

            if (mx === -1)
            {
                let timeStamp = new Date().toISOString().replace(/\..+/, '').replace(/T([0-9]+:)+[0-9]*/, '');
                const newFileName = mod + '_' + timeStamp + '_' + '0';

                fs.appendFileSync(path.join(__dirname,'log', newFileName), '');
                writeModules[mod] = [newFileName, 0, fs.createWriteStream(path.join(__dirname, 'log' ,newFileName), {flags: 'a', encoding: null, mode:0666})];
            }
            else writeModules[mod] = [file, mx, fs.createWriteStream(path.join(__dirname,'log',file), {flags: 'a', encoding: null, mode:0666})];
        }

        console.log('[LOGGER] Logger moduls set...');
    }
    catch(error)
    {
        console.log('[LOGGER] Error in setWriterModuls', error);
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