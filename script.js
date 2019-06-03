// ==UserScript==
// @name         youtube自动切换中文字幕
// @namespace    https://github.com/crud-boy/Youtube-Automatic-Translation
// @version      0.1.6
// @description  自动打开翻译字幕
// @author       wlpha
// @match        *://www.youtube.com/watch?v=*
// @match        *://www.youtube.com
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-end


// ==/UserScript==


(function () {
    'use strict';

    function get_trans_coltrol_state() {
        var trans_coltrol_state = window.localStorage.getItem('trans_coltrol_state');
        return trans_coltrol_state == 'on';
    }

    function has_subtitle() {
        return document.querySelector('.ytp-subtitles-button.ytp-button') != null;
    }

    function is_open_settings() {
        var menu = document.querySelector('.ytp-popup.ytp-settings-menu');
        return menu && menu.style.display != 'none';
    }

    function open_settings() {
        var menu_btn = document.querySelector('.ytp-settings-button');
        if (menu_btn) {
            menu_btn.click();
        }
    }

    function close_settings() {
        var menu = document.querySelector('.ytp-settings-menu');
        var menu_btn = document.querySelector('.ytp-settings-button');
        if (menu && menu.style.display != 'none') {
            menu_btn.click();
        }
    }


    var checkInterval = setInterval(function () {
        var ad_show = document.querySelector('.ad-showing');

        // 非广告视频，就打开字幕
        if (!ad_show) {
            // add_trans_control_btn();
            if (get_trans_coltrol_state()) {
                enable_subtitles();
            }

        }
    }, 1000);

    var is_open_subtitles = true;//clear when check location
    function open_subtitle() {
        var setting_items = document.querySelectorAll('.ytp-popup.ytp-settings-menu .ytp-menuitem[aria-haspopup]');


        for (var l = 0; l < setting_items.length; l++) {
            var item = setting_items[l];
            if (item) {
                // 点击 "字幕"
                if (item.innerText.indexOf('字幕') > -1) {
                    item.click();
                    var auto_trans_btns = document.querySelectorAll('.ytp-panel-menu .ytp-menuitem[role="menuitemradio"]');
                    var langBtn = null;
                    for (var i = 0; i < auto_trans_btns.length; i++) {
                        console.log("found subtitle" + auto_trans_btns[i].innerText)
                        // 如果内置字幕，没有简体中文，就次选中文(没有简体字的情况下，一般是繁体字)
                        if (auto_trans_btns[i] && auto_trans_btns[i].innerText.indexOf('中文（中国）') > -1) {
                            langBtn = auto_trans_btns[i];
                        } else if (auto_trans_btns[i] && auto_trans_btns[i].innerText.indexOf('中文') > -1) {
                            if (langBtn == null || langBtn.innerText.indexOf('中文（中国）') == -1) {
                                langBtn = auto_trans_btns[i];
                            }
                        } else if (auto_trans_btns[i] && auto_trans_btns[i].innerText.indexOf('英语') > -1) {
                            // pre trans from english
                            if (langBtn == null) {
                                langBtn = auto_trans_btns[i];
                            }
                        }

                        if (auto_trans_btns[i] && auto_trans_btns[i].innerText.indexOf('自动翻译') > -1) {// last one
                            if (langBtn != null) { langBtn.click(); }
                            if (langBtn && langBtn.innerText.indexOf('中文') > -1) {
                                console.log("set to " + langBtn.innerText);
                                is_open_subtitles = true;
                                break;
                            }
                            // 如果没有内置字幕，就打开翻译字幕
                            // 点击 "自动翻译"
                            auto_trans_btns[i].click();
                            var btns = document.querySelectorAll('.ytp-panel-menu .ytp-menuitem[role="menuitemradio"]');
                            for (var k = 0; k < btns.length; k++) {
                                // 选择"简体"
                                if (btns[k] && btns[k].innerText.indexOf('简体') > -1) {
                                    btns[k].click();
                                    is_open_subtitles = true;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    break;

                }
            }
        }
    }

    var lastLocation = null;
    function enable_subtitles() {
        // 如果人为打开设置，就不操作
        if (is_open_settings()) {
            return;
        }
        if (has_subtitle()) {
            // 打开字幕
            if (!is_open_subtitles) {
                // 打开
                open_settings();
                // 切换字幕
                open_subtitle();
                // 关闭设置
                close_settings();
            } else {
                // clearInterval(checkInterval);
                if (window.location.href != lastLocation) {
                    lastLocation = window.location.href;
                    is_open_subtitles = false;
                }
            }
        }

    }


})();
