﻿// 添加到页面的window对象上面，在页面中用ys.进行访问
; window.ys = {};
(function ($, ys) {
    "use strict";
    $.extend(ys, {
        openDialog: function (option) {
            var _option = $.extend({
                title: "系统窗口",
                width: "200px",
                height: "200px",
                url: "",
                shade: 0.4,
                btn: ['确认', '关闭'],
                callback: null,
                shadeClose: false
            }, option);
            layer.open({
                type: 2,
                area: [_option.width, _option.height],
                fix: false, //不固定
                maxmin: true,
                shade: _option.shade,
                title: _option.title,
                content: _option.url,
                btn: _option.btn,
                shadeClose: _option.shadeClose, // 弹层外区域关闭
                yes: _option.callback,
                cancel: function (index) {
                    return true;
                }
            });
        },
        closeDialog: function () {
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);
        },
        // 格式为 yyyy-MM-dd HH:mm:ss
        formatDate: function (v, format) {
            if (!v) return "";
            var d = v;
            if (typeof v === 'string') {
                if (v.indexOf("/Date(") > -1)
                    d = new Date(parseInt(v.replace("/Date(", "").replace(")/", ""), 10));
                else
                    d = new Date(Date.parse(v.replace(/-/g, "/").replace("T", " ").split(".")[0]));
            }
            var o = {
                "M+": d.getMonth() + 1,  //month
                "d+": d.getDate(),       //day
                "H+": d.getHours(),      //hour
                "m+": d.getMinutes(),    //minute
                "s+": d.getSeconds(),    //second
                "q+": Math.floor((d.getMonth() + 3) / 3),  //quarter
                "S": d.getMilliseconds() //millisecondjsonca4
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        },
        request: function (name) {
            var params = decodeURI(window.location.search);
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = params.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
            return null;
        },
        checkRowEdit: function (row) {
            if (row.length == 0) {
                ys.msgError("您没有选择任何行！");
            } else if (row.length > 1) {
                ys.msgError("您的选择大于1行！");
            } else if (row.length == 1) {
                return true;
            }
            return false;
        },
        checkRowDelete: function (row) {
            if (row.length == 0) {
                ys.msgError("您没有选择任何行！");
            } else if (row.length > 0) {
                return true;
            }
            return false;
        },
        getIds: function (row) {
            var ids = '';
            $.each(row, function (i, obj) {
                if (i == 0) {
                    ids = obj.Id;
                }
                else {
                    ids += "," + obj.Id;
                }
            });
            return ids;
        },
        exportExcel: function (url, postData) {
            ys.ajax({
                url: url,
                type: "post",
                data: postData,
                success: function (obj) {
                    if (obj.Tag == 1) {
                        window.location.href = ctx + "File/DownloadFile?fileName=" + obj.Result + "&delete=1";
                    }
                    else {
                        ys.msgError(obj.Message);
                    }
                },
                beforeSend: function (xhr) {
                    ys.showLoading("正在导出数据，请稍后...");
                }
            });
        },
        msgWarning: function (content) {
            layer.msg(content, { icon: 0, time: 1000, shift: 5 });
        },
        msgSuccess: function (content) {
            if (ys.isNullOrEmpty(content)) {
                content = "操作成功";
            }
            top.layer.msg(content, { icon: 1, time: 1000, shift: 5 });
        },
        msgError: function (content) {
            if (ys.isNullOrEmpty(content)) {
                content = "操作失败";
            }
            layer.msg(content, { icon: 2, time: 3000, shift: 5 });
        },
        alertWarning: function (content) {
            layer.alert(content, {
                icon: 0,
                title: "系统提示",
                btn: ['确认'],
                btnclass: ['btn btn-primary'],
            });
        },
        alertSuccess: function (content) {
            layer.alert(content, {
                icon: 1,
                title: "系统提示",
                btn: ['确认'],
                btnclass: ['btn btn-primary'],
            });
        },
        alertError: function (content) {
            layer.alert(content, {
                icon: 2,
                title: "系统提示",
                btn: ['确认'],
                btnclass: ['btn btn-primary'],
            });
        },
        confirm: function (content, callback) {
            layer.confirm(content, {
                icon: 3,
                title: "系统提示",
                btn: ['确认', '取消'],
                btnclass: ['btn btn-primary', 'btn btn-danger'],
            }, function (index) {
                layer.close(index);
                callback(true);
            });
        },
        showLoading: function (message) {
            $.blockUI({ message: '<div class="loaderbox"><div class="loading-activity"></div> ' + message + '</div>', css: { border: "none", backgroundColor: 'transparent' } });
        },
        closeLoading: function () {
            setTimeout(function () { $.unblockUI(); }, 50);
        },
        ajax: function (option) {
            var opt = $.extend({
                url: option.url,
                async: true,
                type: "get",
                data: option.data || {},
                dataType: option.dataType || "json",
                error: function (xhr, status, obj) { ys.alertError("系统出错了"); },
                success: function (rdata) {
                    ys.msgSuccess();
                },
                beforeSend: function (xhr) {
                    ys.showLoading("正在处理中...");
                },
                complete: function (xhr, status) {
                    ys.closeLoading();
                }
            }, option);

            if (ys.isNullOrEmpty(opt.url)) {
                ys.alertError("url 参数不能为空");
                return;
            }
            $.ajax({
                url: opt.url,
                async: opt.async,
                type: opt.type,
                data: opt.data,
                dataType: opt.dataType,
                error: opt.error,
                success: opt.success,
                beforeSend: opt.beforeSend,
                complete: opt.complete,
            });
        },
        ajaxUploadFile: function (option) {
            var opt = $.extend({
                url: option.url,
                data: option.data || {},
                error: function (xhr, status, obj) { ys.alertError("系统出错了"); },
                success: function (rdata) {
                    ys.msgSuccess();
                },
                beforeSend: function (xhr) {
                    ys.showLoading("正在处理中...");
                },
                complete: function (xhr, status) {
                    ys.closeLoading();
                }
            }, option);

            if (ys.isNullOrEmpty(opt.url)) {
                ys.alertError("url 参数不能为空");
                return;
            }
            if (ys.isNullOrEmpty(opt.data)) {
                ys.alertError("data 参数不能为空");
                return;
            }
            $.ajax({
                url: opt.url,
                data: opt.data,
                type: "post",
                processData: false,
                contentType: false,
                error: opt.error,
                success: opt.success,
                beforeSend: opt.beforeSend,
                complete: opt.complete
            })
        },
        isNullOrEmpty: function (obj) {
            if ((typeof (obj) == "string" && obj == "") || obj == null || obj == undefined) {
                return true;
            }
            else {
                return false;
            }
        },
        isNullOrZero: function (obj) {
            if (ys.isNullOrEmpty(obj)) {
                return true;
            }
            else if (obj == "0") {
                return true;
            }
            else {
                return false;
            }
        },
        // Html.Raw()方法会提示语法错误，所以用这个函数包装一下
        getJson: function (value) {
            return value;
        },
        getGuid: function () {
            var guid = "";
            for (var i = 1; i <= 32; i++) {
                var n = Math.floor(Math.random() * 16.0).toString(16);
                guid += n;
                if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) guid += "-";
            }
            return guid;
        },
        getValueByKey: function (json, key) {
            var value = "";
            $.each(json, function (i, obj) {
                if (obj.Key == key) {
                    value = obj.Value;
                }
            });
            return value;
        },
        changeURLParam: function (url, arg, arg_val) {
            var pattern = arg + '=([^&]*)';
            var replaceText = arg + '=' + arg_val;
            if (url.match(pattern)) {
                var tmp = '/(' + arg + '=)([^&]*)/gi';
                tmp = url.replace(eval(tmp), replaceText);
                return tmp;
            } else {
                if (url.match('[\?]')) {
                    var arr = url.split('#');
                    if (arr.length > 1) {
                        return arr[0] + '&' + replaceText + '#' + arr[1];
                    }
                    else {
                        return url + '&' + replaceText;
                    }
                } else {
                    return url + '?' + replaceText;
                }
            }
        },
        trimStart: function (rawStr, c) {
            if (c == null || c == '') {
                var str = rawStr.replace(/^s*/, '');
                return str;
            }
            else {
                var rg = new RegExp('^' + c + '*');
                var str = rawStr.replace(rg, '');
                return str;
            }
        },
        trimEnd: function (rawStr, c) {
            if (c == null || c == "") {
                var rg = /s/;
                var i = rawStr.length;
                while (rg.test(rawStr.charAt(--i)));
                return rawStr.slice(0, i + 1);
            }
            else {
                var rg = new RegExp(c);
                var i = rawStr.length;
                while (rg.test(rawStr.charAt(--i)));
                return rawStr.slice(0, i + 1);
            }
        },
        getHttpFileName: function (url) {
            if (url == null || url == '') {
                return url;
            }
            var i = url.lastIndexOf('/');
            if (i > 0) {
                return url.substring(i + 1);
            }
            return url;
        },
        getFileNameWithoutExtension: function (fileName) {
            if (fileName == null || fileName == '') {
                return fileName;
            }
            var i = fileName.indexOf('.');
            if (i > 0) {
                return fileName.substring(0, i);
            }
            return fileName;
        },
        toString: function (value) {
            if (value == null) {
                return '';
            }
            return value.toString();
        }
    });
})(window.jQuery, window.ys);