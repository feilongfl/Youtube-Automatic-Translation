// ==UserScript==
// @name         youtube自动切换中文字幕
// @namespace    https://github.com/crud-boy/Youtube-Automatic-Translation
// @version      0.1.4
// @description  油管自动跳广告,自动打开翻译字幕,如果打开失败，请手动点击一下字幕按钮
// @author       wlpha
// @match        *://www.youtube.com/watch?v=*
// @match        *://www.youtube.com
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-end


// ==/UserScript==


(function() {
    'use strict';

    function get_trans_coltrol_state(){
        var trans_coltrol_state = window.localStorage.getItem('trans_coltrol_state');
        return trans_coltrol_state == 'on';
    }

    // 添加开关
    function add_trans_control_btn(){
        var coltrol_place = document.querySelector('.ytp-chrome-controls .ytp-right-controls');
        if(coltrol_place.querySelector('.trans_coltrol_btn') == null) {
            var trans_coltrol_btn = document.createElement('button');
            trans_coltrol_btn.className = 'trans_coltrol_btn';
            trans_coltrol_btn.style = 'position: relative;top: -12px;border-radius: 25px;border: none; opacity: 0.95; background-color: #fff; outline:none;';

            trans_coltrol_btn.onclick = function(){
                var trans_coltrol_state = window.localStorage.getItem('trans_coltrol_state');
                if(trans_coltrol_state == 'on') {
                    window.localStorage.setItem('trans_coltrol_state', 'off');
                    trans_coltrol_btn.innerText = '开启翻译字幕';
                } else {
                    window.localStorage.setItem('trans_coltrol_state', 'on');
                    trans_coltrol_btn.innerText = '关闭翻译字幕';
                }
            }

            if(get_trans_coltrol_state()){
                trans_coltrol_btn.innerText = '关闭翻译字幕';
            } else {
                trans_coltrol_btn.innerText = '开启翻译字幕';
            }
            coltrol_place.prepend(trans_coltrol_btn);
        }

    }

    function has_subtitle(){
        return document.querySelector('.ytp-subtitles-button.ytp-button') != null;
    }

    function is_open_settings(){
        var menu = document.querySelector('.ytp-popup.ytp-settings-menu');
        return menu && menu.style.display != 'none';
    }

    function open_settings(){
        var menu_btn = document.querySelector('.ytp-settings-button');
        if(menu_btn) {
            menu_btn.click();
        }
    }

    function close_settings(){
        var menu = document.querySelector('.ytp-settings-menu');
        var menu_btn = document.querySelector('.ytp-settings-button');
        if(menu && menu.style.display != 'none') {
            menu_btn.click();
        }
    }

    function is_trans(){
        // 防止打开设置的时候检测字幕
        var trans = true;
        var setting_items = document.querySelectorAll('.ytp-popup.ytp-settings-menu .ytp-menuitem[aria-haspopup]');
        // 如果查询失败，就打开一下设置
        var is_open_settings = false;
        if(setting_items.length == 0) {
            is_open_settings = true;
            open_settings();
        }

        var setting_items = document.querySelectorAll('.ytp-popup.ytp-settings-menu .ytp-menuitem[aria-haspopup]');

        for(var l=0; l<setting_items.length; l++) {
            var item = setting_items[l].querySelector('.ytp-menuitem-label span');
            if(item) {
                if(item.innerText.indexOf('字幕') > -1) {
                    trans = false;
                    var el = setting_items[l].querySelector('.ytp-menuitem-content');
                    if(el) {
                        // 如果自动切换，或者认为切换到翻译，就不代表已经翻译过了
                        if(el.innerText.indexOf('中文') > -1 || el.innerText.indexOf('简体') > -1 || el.innerText.indexOf('(自动生成) >>') > -1) {
                            // 已经翻译过了
                            trans = true;
                            break;
                        }
                    }
                }
            }
        }

        // 关闭设置
        if(is_open_settings) {
            close_settings();
        }

        return trans;
    }


    function open_subtitle(){
        var setting_items = document.querySelectorAll('.ytp-popup.ytp-settings-menu .ytp-menuitem[aria-haspopup]');
        var is_open_subtitles = false;
        // 优先打开内置字幕
        for(var l=0; l<setting_items.length; l++) {
            var item = setting_items[l];
            if(item) {
                if (item.innerText.indexOf('简体') > -1) {
                    is_open_subtitles = true;
                    item.click();
                    break;
                }

            }
        }
        // 如果内置字幕，没有简体中文，就次选中文(没有简体字的情况下，一般是繁体字)
        if(!is_open_subtitles) {
            for(var l=0; l<setting_items.length; l++) {
                var item = setting_items[l];
                if(item) {
                    if (item.innerText.indexOf('中文') > -1) {
                        is_open_subtitles = true;
                        item.click();
                        break;
                    }
    
                }
            }
        }

        // 如果没有内置字幕，就打开翻译字幕
        if(!is_open_subtitles) {
            for(var l=0; l<setting_items.length; l++) {
                var item = setting_items[l];
                if(item) {
                    // 点击 "字幕"
                    if(item.innerText.indexOf('字幕') > -1) {
                        item.click();
                        var auto_trans_btns = document.querySelectorAll('.ytp-panel-menu .ytp-menuitem[role="menuitemradio"]');
                        for(var i=0; i<auto_trans_btns.length; i++) {
                            // 点击 "自动翻译"
                            if(auto_trans_btns[i] && auto_trans_btns[i].innerText.indexOf('自动翻译') > -1) {
                                auto_trans_btns[i].click();
                                var btns = document.querySelectorAll('.ytp-panel-menu .ytp-menuitem[role="menuitemradio"]');
                                for(var k=0; i<btns.length; k++) {
                                    // 选择"简体"
                                    if(btns[k] && btns[k].innerText.indexOf('简体') > -1) {
                                        btns[k].click();
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
    }

    function enable_subtitles(){
        // 如果人为打开设置，就不操作
        if(is_open_settings()){
            return;
        }
        if(has_subtitle()) {
            // 打开字幕
            var subtitle = document.querySelector('.ytp-subtitles-button.ytp-button[aria-pressed="false"]');
            if(subtitle && subtitle.style.display != 'none') {
                subtitle.click();
            }

            // 字幕没有翻译
            if(!is_trans()) {
                // 打开
                open_settings();
                // 切换字幕
                open_subtitle();
                // 关闭设置
                close_settings();
            }
        } 

    }

    setInterval(function(){
        // 隐藏广告
        var ads_string = ['.video-ads', '#player-ads'];
        for(var x in ads_string) {
            var ads = document.querySelectorAll(ads_string[x]);
            for(var i=0; i<ads.length; i++) {
                try{
                    var el = ads[i];
                    if(el && el.style.display != 'none') {
                        el.style.display = 'none';
                    }
                    //child.parentNode.removeChild(child);
                }catch(e) {

                }
            }
        }

        // 跳过播放器广告
        var ad_show = document.querySelector('.ad-showing');
        var volume = document.querySelector("#ytp-svg-volume-animation-mask");
        var volume_btn = document.querySelector('.ytp-mute-button');
        var player = document.querySelector('.html5-main-video');
        var movie_player = document.querySelector('#movie_player');
        if(ad_show) {
            // 关闭音量
            if(volume && volume_btn){
                volume_btn.click();
            }
            // 跳过播放器广告
            if(player) {
                player.currentTime  = player.getDuration();
            }

            // 设置黑屏,隐藏
            if(movie_player && movie_player.parentElement) {
                movie_player.parentElement.style.backgroundColor="#000";
                movie_player.style.display = 'none';

                var pass_ads = movie_player.parentElement.querySelector('.pass-ads');
                if(pass_ads == null) {
                    var p = document.createElement('p');
                    p.className = 'pass-ads';
                    p.style = 'position: relative;height: 100%;font-size: 1.5em;display: flex;word-wrap: break-word;justify-content: center;align-content: center;justify-items: center;align-items: center;color: #fff;';
                    p.innerText = '正在跳过广告中...';
                    movie_player.parentElement.appendChild(p);
                }
            }


        } else {
            // 打开音量
            if(volume == null && volume_btn){
                volume_btn.click();
            }

            // 取消播放器黑屏隐藏
            if(movie_player) {
                movie_player.style.display = 'block';
            }
        }

        // 非广告视频，就打开字幕
        if(!ad_show) {
            add_trans_control_btn();
            if(get_trans_coltrol_state()){
                enable_subtitles();
            }
            
        }
    
    }, 500);
})();
