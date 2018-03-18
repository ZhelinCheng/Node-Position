/**
 * Created by cheng on 2017/10/1.
 */

const md5 = require('md5');
const security = require("./security");
const error = require("./error");
const handle = require("./handle");
const tools = require("./tools");

module.exports = function (obj) {
    obj.par = {};
    obj.par.w = parseInt(obj.req.query.w);
    obj.par.h = parseInt(obj.req.query.h);
    obj.par.o = parseInt(obj.req.query.o);
    obj.par.s = obj.req.query.s === 'false' || obj.req.query.s === '0' ? 0 : 1;
    obj.par.t = obj.req.query.t
        ? obj.req.query.t : obj.par.w + 'x' + obj.par.h;
    obj.path = obj.setting.path;

    //获取实际调用位置
    obj.route = (() => {
        let route = null;
        if(obj.req.route.path === '/random'){
            route = tools.randomPath(obj.par.w, obj.par.h)
        }else{
            route = obj.req.route.path;
        }
        return route;
    })();

    //生成获取源路径
    if (obj.par.w >= obj.par.h || obj.route === '/logo') {
        obj.source = obj.path.source + '/w' + obj.route;
    } else if (obj.par.w < obj.par.h) {
        obj.source = obj.path.source + '/h' + obj.route;
    }

    //基本判断
    if(!obj.par.w || !obj.par.h){
        //检查是否有参数
        error(obj.res, 301, obj.path.url);
        return false;
    }else if(security.main(obj)) {
        //检查是否安全
        error(obj.res, 403);
        return false;
    }

    //获取是否有冗余参数，有的话执行301跳转
    let parUrl = security.isParameter(obj.req.query,
        obj.par, obj.path.url + obj.req.route.path, obj.source);

    if(parUrl){
        error(obj.res, 301, parUrl);
        return false;
    }

    //console.log(obj.par, obj.source);

    //生成该参数对应的文件名
    obj.name = '/' + md5(JSON.stringify(obj.par) + obj.route) + '.jpg';

    //生成的文件地址
    obj.output = obj.path.output
        + obj.route;
    //处理图片
    handle.exists(obj)
};