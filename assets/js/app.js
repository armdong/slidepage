(function(window, document) {

    var currentPosition = 0, // 记录当前页面位置  
        currentPoint = -1, // 记录当前点的位置
        pageNow = 1, // 当前页码
        points = null; // 页码数

    var app = {

        // 初始化
        init: function() {
            document.addEventListener('DOMContentLoaded', function() {
                points = document.querySelectorAll('.pagenumber div');
                app.bindTouchEvent(); // 绑定触摸事件
                app.setPageNow(); // 设置出事页码
            }.bind(app), false);
        }(),

        // 页面平移
        transform: function(translate) {
            this.style.webkitTransform = 'translate3d(' + translate + 'px, 0, 0)';
            currentPosition = translate;
        },

        // 设置当前页码
        setPageNow: function() {
            if (currentPoint != -1) {
                points[currentPoint].className = '';
            }
            currentPoint = pageNow - 1;
            points[currentPoint].className = 'now';
        },

        // 绑定触摸事件
        bindTouchEvent: function() {
            var viewport = document.querySelector('#viewport'),
                pageWidth = window.innerWidth,
                maxWidth = -pageWidth * (points.length - 1),
                startX = 0,
                startY = 0,
                initialPos = 0, // 手指按下的屏幕位置
                moveLength = 0, // 手指当前滑动的距离
                direction = 'left', // 滑动的方向
                isMove = false, // 是否发生左右滑动
                startT = 0; // 记录手指按下去的时间

            // 手指按下事件
            document.addEventListener('touchstart', function(e) {
                e.preventDefault();
                var touch = e.touches[0];
                startX = touch.pageX;
                startY = touch.pageY;
                initialPos = currentPosition; // 本次滑动前的初始位置
                viewport.style.webkitTransition = ''; // 取消动画效果
                startT = (new Date()).getTime(); // 记录手指按下的开始时间
                isMove = false;
            }.bind(this), false);

            // 手指在屏幕上滑动，页面跟随手指移动
            document.addEventListener('touchmove', function(e) {
                e.preventDefault();
                var touch = e.touches[0];
                var deltaX = touch.pageX - startX,
                    deltaY = touch.pageY - startY;

                // 如果X方向上的位移大于Y方向的位移，则认为是左右滑动
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    moveLength = deltaX;
                    var translate = initialPos + deltaX;

                    // 当前需要移动到的位置
                    // 如果translate > 0 或 translate < maxWidth，则表示页面超出边界
                    if (translate <= 0 && translate >= maxWidth) {
                        this.transform.call(viewport, translate);
                        isMove = true;
                    }
                    // 判断手指滑动方向
                    direction = deltaX > 0 ? 'right' : 'left';
                }
            }.bind(this), false);

            // 手指松开屏幕时，计算最终需要停留在哪一页
            document.addEventListener('touchend', function(e) {
                e.preventDefault();
                var translate = 0;

                // 计算手指在屏幕上停留的时间
                var deltaT = (new Date()).getTime() - startT;

                // 发生了左右滑动
                if (isMove) {

                    // 使用动画过渡让页面滑动到最终的位置
                    viewport.style.webkitTransition = '0.3s ease -webkit-transform';


                    if (deltaT < 300) {
                        // 如果停留时间小于300ms，则认为是快速滑动，无论滑动距离是多少，都滑动到下一页

                        translate = direction == 'left' ?
                            currentPosition - pageWidth - moveLength :
                            currentPosition + pageWidth - moveLength;

                        // 如果最终位置超过边界位置，则停留在边界位置
                        translate = translate > 0 ? 0 : translate; // 左边界
                        translate = translate < maxWidth ? maxWidth : translate; // 右边界
                    } else {

                        // 如果滑动距离小于屏幕的50%，则退回到上一页
                        if (Math.abs(moveLength) / pageWidth < 0.5) {
                            translate = currentPosition - moveLength;
                        } else {

                            // 如果滑动距离大于屏幕的50%，则滑动到下一页
                            translate = direction == 'left' ?
                                currentPosition - pageWidth - moveLength :
                                currentPosition + pageWidth - moveLength;
                            translate = translate > 0 ? 0 : translate;
                            translate = translate < maxWidth ? maxWidth : translate;
                        }
                    }

                    // 执行滑动，让页面完整的显示到屏幕上
                    this.transform.call(viewport, translate);

                    // 计算当前的页面
                    pageNow = Math.round(Math.abs(translate) / pageWidth) + 1;

                    setTimeout(function() {

                        // 设置页码，DOM操作需要放到子线程中，否则会出现卡顿
                        this.setPageNow();
                    }.bind(this), 100);
                }
            }.bind(this), false);
        }
    };

})(window, document);
