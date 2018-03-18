/**
 * Created by ChengZheLin on 2017/10/2.
 */

'use strict';
const fs = require('fs'),
    shell = require('shelljs');
    //cronJob = require("cron").CronJob;

let _state = true;

class Arrangement {
    start (obj) {
        let that = this;
        let findRm = 'find '+ obj.output +'/*/ -mtime +30 -type f -name *.jpg -exec rm -f {} '+
            (obj.os === 'Windows_NT' ? '' : '\\')
            +';';

        /*new cronJob('0 0 4 * * *', () => {
            if(_state) {
                _state = false;
                that.rm(obj, findRm);
            }

        }, null, true, 'Asia/Chongqing');*/


        setInterval(function () {
            let date = new Date();
            if(_state && date.getHours() === 4) {
                _state = false;
                that.rm(obj, findRm);
                that.buffCache(obj)
            }
        }, 3600000)
    }


    //删除操作
    rm (obj, com) {
        let that = this;
        shell.exec(com, (code, stdout, stderr) => {
            if(code !== 0) {
                console.log('删除旧文件执行错误\n' + stderr);
                that.addLogs(obj.logs, 'Error' + stderr);
                return;
            }

            that.addLogs(obj.logs, 'Del Success');
        });
    }

    //释放缓存，在linux上使用
    buffCache(obj) {
        let that = this;
        shell.exec('echo 3 > /proc/sys/vm/drop_caches', (code, stdout, stderr) => {
            if(code !== 0) {
                console.log('清除缓存执行错误\n' + stderr);
                that.addLogs(obj.logs, 'Error' + stderr);
                return;
            }

            that.addLogs(obj.logs, 'buff/cache Success');
        });
    }


    //添加日志
    addLogs (pathname, msg) {

        let data = null;
        let date = new Date();
        let com = date.getFullYear()+ '年'
            + (date.getMonth() + 1) + '月'
            + date.getDate() + '日 '
            + date.getHours() + ':'
            + date.getMinutes()
            + ' ' + msg + '\r\n';

        _state = true;

        try {
            data = fs.existsSync(pathname);
            if (!data) {
                shell.touch(pathname);
            }
            fs.appendFile(pathname, com, 'utf8', (err) => {
                if (err) throw err;
            });
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = new Arrangement();