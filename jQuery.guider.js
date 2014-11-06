;(function($) {
    var defOpt = {
            coverId: 'guide-cover',
            boxClass: 'guide-box',
            bgClass: 'guide-bg',
            faceClass: 'guide-face',
            headClass: 'guide-header',
            bodyClass: 'guider-body',
            coverCSS: {
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'background': '#000',
                'width': '100%',
                'height': '100%',
                'display': 'none',
                'opacity': 0.6
            },
            bgCSS: {
                position: 'absolute',
                display: 'none',
                width: 0,
                height: 0,
                background: '#fbfcfb'
            },
            faceCSS: {
                position: 'absolute',
                display: 'none'
            },
            boxCSS: {
                position: 'fixed'
            },
            title: '',
            content: '',
            zIndex: 999
        },
        cover,
        face,
        bg,
        isInited = false;

    function createCover(opt) {
        opt.coverCSS['z-index'] = opt.coverCSS['z-index'] || opt.zIndex;
        return $('<div/>').attr({'id': opt.coverId}).css(opt.coverCSS);
    }

    function createBg(opt) {
        opt.bgCSS['z-index'] = opt.bgCSS['z-index'] || opt.zIndex + 1;
        return $('<div/>').addClass(opt.bgClass).css(opt.bgCSS);
    }

    function createFace(opt) {
        opt.faceCSS['z-index'] = opt.faceCSS['z-index'] || opt.zIndex + 3;
        return $('<div/>').addClass(opt.faceClass).css(opt.faceCSS);
    }

    function setContent(html) {
        $(this).data('controller').content(html);
    }

    function setTitle(html) {
        $(this).data('controller').title(html);
    }

    function start() {
    	$(this).data('controller').start();
    }

    function next() {
        $(this).data('controller').next();
    }

    function prev() {
        $(this).data('controller').prev();
    }

    function close() {
        $(this).data('controller').close();
    }

    function redo() {
    	$(this).data('controller').redo();
    }

    function autoLay($dom) {
    	var eleWidth = $dom.width(),
    		eleHeight = $dom.height(),
    		left = 0,
    		top = 0;

		left = eleWidth >> 1;
		top = eleHeight >> 1;

    	$dom.css({
    		left: '50%',
    		top: '50%',
    		'margin-left': -left + 'px',
    		'margin-top': -top + 'px'
    	});
    }

    function initFrame(opt) {
        var doms = {
            'header': $('<div/>'),
            'body': $('<div/>')
        };

        doms.header.addClass(opt.headClass).html(opt.title || '');
        doms.body.addClass(opt.bodyClass).html(opt.content || '');

        this.on('setContent', setContent)
            .on('setTitle', setTitle)
            .on('close', close)
            .on('next', next)
            .on('prev', prev)
            .on('start', start)
            .on('redo', redo)
            .append(doms.header)
            .append(doms.body)
            .data('doms', doms)
            .data('_maxStep', 0);
    }

    function addCoverTo(ele, isFixed, layout, pos, bsize) {
    	if(!ele) {
    		cover.show();
    		face.hide();
    		bg.hide();
    		autoLay(this);
    		this.show();
    		return;
    	}
        var offset = ele.offset() || {
                left: 0,
                top: 0
            },
            position = isFixed ? 'fixed' : 'absolute',
            top = (isFixed ? offset.top - $(window).scrollTop() : offset.top) - bsize + (layout && layout.top ? layout.top : 0),
            left = offset.left - bsize + (layout && layout.left ? layout.left : 0),
            width = ele.width() + bsize,
            height = ele.height() + bsize,
            rect = {
                'position': position,
                'width': width + 'px',
                'height': height + 'px',
                'left': left + 'px',
                'top': top + 'px'
            };

        if (left < 0) {
            rect.width = width + left + 'px';
            rect.left = 0;
        }

        bg.css(rect);
        rect.left = left + bsize + 'px';
        rect.top = top + bsize + 'px';
        face.css(rect);

        if (pos) {
            this.css({
                left: pos.left + offset.left + 'px',
                top: pos.top + offset.top + 'px'
            });
        } else {
            autoLay(this);
        }

        this.show();
        face.show();
        bg.show();
        cover.show();
    }

    function show(dir) {
        var doms = this.data('doms'),
            opt = this.data('option'),
            opr = this.data('controller'),
            zIndex = opt.zIndex,
            list = opt.list,
            tmp = this.data('_tmp'),
            maxStep = this.data('_maxStep'),
            cur = this.data('_step'),
            cur = cur == undefined ? -1 : cur,
        	item = list[dir === 'next' ? ++cur : --cur],
            callback = true;

        tmp && tmp.css('z-index', tmp.data('zIndex'));
        tmp = null;

        if (item) {
            tmp = item.id ? $('#' + item.id) : null;

            callback = opt.eachFun && opt.eachFun.call(this, cur);

            if (callback === false) {
                this._tmp = null;
                this.trigger(dir);
                return;
            }

            maxStep = maxStep < cur ? cur : maxStep;

            opr.content(item.content)
                .title(item.title);

            if (tmp) {
            	tmp.data('zIndex', tmp.css('z-index'));
	            tmp.css('z-index', zIndex + 2);
	            tmp.offsetParent().prepend(cover);
	            cover.after(bg).after(face);
	            face.hide();
	            bg.hide();
            }

            this.css('z-index', zIndex + 5)
                .data('_step', cur)
                .data('_tmp', tmp)
                .data('_maxStep', maxStep);
            addCoverTo.call(this, tmp, item.fixed, item.layout, item.position, item.spaceSize || opt.spaceSize);
        } else {
            this.trigger("close");
        }
    }

    function Controller($dom) {
        this.baseDom = $dom;
    }

    Controller.prototype = {
        start: function() {
            var tmp = this.baseDom.data('_tmp');
            tmp && tmp.css('z-index', tmp.data('zIndex'));
            this.baseDom.data('_step', null);
            this.next();
            face.hide();
            bg.hide();
            return this;
        },
        title: function(html) {
            this.baseDom.data('doms').header.html(html);
            return this;
        },
        content: function(html) {
            this.baseDom.data('doms').body.html(html || '');
            return this;
        },
        next: function() {
            show.call(this.baseDom, 'next');
            return this;
        },
        prev: function() {
            show.call(this.baseDom, 'prev');
            return this;
        },
        redo: function() {
        	this.start();
            return this;
        },
        close: function() {
        	var dom = this.baseDom;
            var tmp = dom.data('_tmp');
            var opt = dom.data('option');
            tmp && tmp.css('z-index', tmp.data('zIndex'));
            this.baseDom.hide();
            face.hide();
            cover.hide();
            bg.hide();
            opt.closeFun && opt.closeFun.call(this.baseDom, dom.data('_step'), dom.data('_maxStep'));
            return this;
        }
    };

    function init(opt) {
        var controller, me = this,
            body = $('body');

        opt = opt ? $.extend({}, defOpt, opt) : defOpt;
        $.each(['coverCSS', 'faceCSS', 'bgCSS', 'boxCSS'], function(i, cur) {
            opt[cur] = opt[cur] !== defOpt[cur] ? $.extend({}, defOpt[cur], opt[cur]) : opt[cur];
        });

        if (!this[0]) {
            me = $('<div/>').css(opt.boxCSS).appendTo(body);
        }

        me.addClass(opt.boxClass).hide().data('option', opt);

        if (!isInited) {
            face = createFace(opt);
            cover = createCover(opt);
            bg = createBg(opt);
            body.append(cover).append(bg).append(face);

            initFrame.call(me, opt);

            controller = new Controller(me);
            me.data('controller', controller);

            isInited = true;
        }
        return me;
    }

    $.fn.guider = init;

})(jQuery);
